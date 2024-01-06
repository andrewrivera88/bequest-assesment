import React, { useEffect, useState } from 'react';
import * as elliptic from 'elliptic';

const API_URL = 'http://localhost:8080';

const ec = new elliptic.ec('secp256k1');

function App() {
  const [data, setData] = useState<string>('');
  const [isTokenVisible, setIsTokenVisible] = useState<boolean>(true);
  const [isTokenBtnVisible, setIsTokenBtnVisible] = useState<boolean>(true);
  const [accessToken, setAccessToken] = useState<string>('');
  const [isTampered, setTampered] = useState<boolean>(false);

  console.log({ accessToken });

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (!isTokenVisible) return;

    const timeoutId = setTimeout(() => {
      setIsTokenVisible(false);
    }, 30000);

    return () => clearTimeout(timeoutId);
  }, [isTokenVisible]);

  const getData = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    setData(data);
  };

  const updateData = async () => {
    const keyPair = ec.keyFromPrivate(accessToken, 'hex');

    const signature = keyPair.sign(data).toDER('hex');

    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({ data, signature }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    await getData();
  };

  const verifyData = async () => {
    console.log('verifyData');
    try {
      const data = await fetch(`${API_URL}/verify`, { method: 'GET' });
      const { data: resData } = await data.json();

      console.log(resData[0].data, resData[0].signature, resData[0].key);

      const keyPair = ec.keyFromPrivate(accessToken, 'hex');

      console.log(keyPair);
      const isVerified = ec.verify(
        resData[0].data,
        resData[0].signature,
        resData[0].key,
        'hex'
      );

      console.log(isVerified);

      setTampered(!isVerified);
    } catch (error) {
      setTampered(true);
      console.log(error);
    }
  };

  const tamperDataToCheck = async () => {
    const keyPair = ec.keyFromPrivate(accessToken, 'hex');

    const signature = keyPair.sign(data).toDER('hex');

    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        data: data + ' tampered',
        signature: signature + 'tampered',
      }),
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    await getData();
  };

  const getAccessToken = async () => {
    try {
      const response = await fetch(`${API_URL}/access-token`, {
        method: 'POST',
        body: JSON.stringify({ data: {} }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });
      const { data } = await response.json();

      setIsTokenVisible(true);
      setIsTokenBtnVisible(false);

      console.log({ data });

      setAccessToken(data.accessToken);

      return accessToken;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const recoverData = async () => {
    console.log('recoverData');

    const resData = await fetch(`${API_URL}/history`, { method: 'GET' });
    const { data: history } = await resData.json();

    console.log({ history });

    let correctVersion = {
      data: '',
      signature: '',
    };

    for (const item of history) {
      if (!Object.keys(item).length) continue;

      const keyPair = ec.keyFromPrivate(accessToken, 'hex');

      const isVerified = ec.verify(item.data, item.signature, item.key, 'hex');

      if (isVerified) {
        console.log('verified');

        correctVersion = {
          data: item.data,
          signature: item.signature,
        };

        break;
      }
    }

    if (Object.keys(correctVersion).length) {
      await fetch(`${API_URL}/recover`, { method: 'POST' });

      await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({
          data: correctVersion.data,
          signature: correctVersion.signature,
        }),
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      await getData();

      alert('Data Recovered');
      setTampered(false);
    } else {
      alert('Data cannot be recovered');
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        position: 'absolute',
        padding: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        gap: '20px',
        fontSize: '30px',
      }}
    >
      <div>Saved Data</div>

      <div>
        {!isTampered ? (
          <>
            <div style={{ color: 'green' }}>Verified on Last Check</div>
            <button style={{ fontSize: '20px' }} onClick={tamperDataToCheck}>
              Tamper Data to check
            </button>
          </>
        ) : (
          <>
            <div style={{ color: 'red' }}>Tampered!</div>
            <button style={{ fontSize: '20px' }} onClick={recoverData}>
              Recover Data
            </button>
          </>
        )}
      </div>

      <div>
        {isTokenVisible && (
          <div
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              margin: '10px',
              textAlign: 'center',
            }}
          >
            <p>
              You are provided with a access token, Please save it somewhere
              safe. It will not be generated again.
            </p>

            <p>{accessToken}</p>
          </div>
        )}
      </div>
      <input
        style={{ fontSize: '30px' }}
        type='text'
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <div style={{ display: 'flex', gap: '10px' }}>
        {!isTokenBtnVisible && (
          <>
            <button style={{ fontSize: '20px' }} onClick={updateData}>
              Update Data
            </button>
            <button style={{ fontSize: '20px' }} onClick={verifyData}>
              Verify Data
            </button>
          </>
        )}
        {isTokenBtnVisible && (
          <button style={{ fontSize: '20px' }} onClick={getAccessToken}>
            Get Access Token
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
