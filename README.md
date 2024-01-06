# Tamper Proof Data

At Bequest, we require that important user data is tamper proof. Otherwise, our system can incorrectly distribute assets if our internal database is breached.
Only the user is able to update their own data.

**1. How does the client insure that their data has not been tampered with? Assume that the database is compromised.**
<br />
Client Data Security:

- Provide users with an access token, which serves as a private key for creating a digital signature.
- Users must securely store this access token to prevent unauthorized access and tampering of their data.
- The access token is used to sign data before it is added or updated in the database.

Preventing Tampering:

- Each data update is accompanied by a digital signature created using the access token.
  In case of a compromised database, the access token cannot be updated or compromised, ensuring the integrity of the data.
- Data can be verified by comparing the stored signature with the recalculated signature during retrieval.

Improvement:

- Implement secure storage mechanisms for the access token on the client side.
- Use encryption to protect the access token during transmission.

<br />

**2. If the data has been tampered with, how can the client recover the lost data?**

Historical Data Tracking:

- Maintain a history of every update with the corresponding public key and signature stored in the database.
- If data integrity is compromised, the client can query the historical data to identify the latest correct version.

<br />
Recovery Process:

- Iterate through the historical records and verify each data entry using the corresponding public key and signature.
- Identify the latest correct version by selecting the entry with a valid signature.
- Retrieve and restore the correct data from the historical records.

Edit this repo to answer these two questions using any technologies you'd like, there any many possible solutions. Feel free to add comments.

### To run the apps:

`npm run start` in both the frontend and backend

## To make a submission:

1. Clone the repo
2. Make a PR with your changes in your repo
3. Email your github repository to robert@bequest.finance


## How to check:

1. Create access token [there is no input field for a user who already have the token, can be done in improvement part]
2. update the data to create footprints
3. verify the data, its will show a verified data
4. now click on Tamper Data to check button to tamper the data
5. now click on verify data button
6. you will see a tampered data notification with recover data button
7. click on recover data button to recover your data
8. Booyah, it works, [Lets have a call to let me demonstrate my work]
