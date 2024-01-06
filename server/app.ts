import express from 'express';
import cors from 'cors';
import * as elliptic from 'elliptic';

const PORT = 8080;
const app = express();
const database = { data: 'Hello World', history: [{}], key: '' };
const ec = new elliptic.ec('secp256k1');

app.use(cors());
app.use(express.json());

const createKeys = () => {
  const keyPair = ec.genKeyPair();
  const privateKey = keyPair.getPrivate('hex');
  const publicKey = keyPair.getPublic('hex');

  return { publicKey, privateKey };
};

// Routes

app.post('/access-token', (req, res) => {
  // create a new access token

  const { publicKey, privateKey }: { publicKey: string; privateKey: string } =
    createKeys();

  database.key = publicKey;

  console.log({ publicKey, privateKey });

  res.send({ data: { accessToken: privateKey }, status: 200 });
});

app.get('/verify', (req, res) => {
  res.send({
    data: database.history.slice(-1),
    status: 200,
  });
});

app.get('/recover', (req, res) => {
  database.history = [{}];

  res.send({
    status: 200,
  });
});

app.get('/history', (req, res) => {
  res.send({
    data: database.history,
    status: 200,
  });
});

app.get('/', (req, res) => {
  res.json(database.data);
});

app.post('/', (req, res) => {
  database.data = req.body.data;

  database.history.push({
    data: req.body.data,
    signature: req.body.signature,
    key: database.key,
  });
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
