const express = require('express');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


function generateHash({ key, txnid, amount, productinfo, firstname, email, salt }) {
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    return crypto.createHash('sha512').update(hashString).digest('hex');
}

app.get('/pay', (req, res) => {
  
    const paymentDetails = {
        key: '6X2iBq', 
        txnid: 't6svtqtjRdl4ws8',
        amount: '0.1',
        productinfo: 'iPhone',
        firstname: 'Ashish',
        lastname: 'Kumar',
        email: 'test@gmail.com',
        phone: '9690742886',
        surl: 'https://5b95-2405-201-4028-b90b-485c-b5e5-d9ad-6a0a.ngrok-free.app/webhook', 
        furl: 'https://apiplayground-response.herokuapp.com/', 
        salt: 'mcuyBrSdirqcH9bLowVLoe9eca77ttX6'
    };

   
    paymentDetails.hash = generateHash(paymentDetails);
   
   
    const form = `
        <html>
        <body>
            <form action="https://test.payu.in/_payment" method="post">
                <input type="hidden" name="key" value="${paymentDetails.key}" />
                <input type="hidden" name="txnid" value="${paymentDetails.txnid}" />
                <input type="hidden" name="productinfo" value="${paymentDetails.productinfo}" />
                <input type="hidden" name="amount" value="${paymentDetails.amount}" />
                <input type="hidden" name="email" value="${paymentDetails.email}" />
                <input type="hidden" name="firstname" value="${paymentDetails.firstname}" />
                <input type="hidden" name="lastname" value="${paymentDetails.lastname}" />
                <input type="hidden" name="surl" value="${paymentDetails.surl}" />
                <input type="hidden" name="furl" value="${paymentDetails.furl}" />
                <input type="hidden" name="phone" value="${paymentDetails.phone}" />
                <input type="hidden" name="hash" value="${paymentDetails.hash}" />
                <input type="submit" value="Pay Now" />
            </form>
        </body>
        </html>
    `;

    res.send(form);
});

app.post('/webhook', (req, res) => {
    const webhookData = req.body;

   
    const { txnid, status, key, amount, email, salt, hash, productinfo, firstname } = webhookData;

  

  
    const generatedHash = generateHash({
        key,
        txnid,
        amount,
        productinfo,
        firstname,
        email,
        salt
    });

    console.log("generatedHash:", generatedHash          ," ------------------- -----------",        "hash:"  , hash)

    
    if (generatedHash !== hash) {
        console.log('Hash mismatch detected!');
        return res.status(400).send('Invalid hash');
    }

  
    if (status === 'success') {
        console.log(`Payment successful for transaction ID: ${txnid}`);
               res.status(200).send('Transaction processed successfully');
    } 
    
    else {
        console.log(`Payment failed or other status for transaction ID: ${txnid}`);
        res.status(400).send('Unhandled transaction status');
    }
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
