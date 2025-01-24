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
        txnid: 't6svtqtjRdl4ws',
        amount: '1',
        productinfo: 'iPhone',
        firstname: 'Ashish',
        lastname: 'Kumar',
        email: 'test@gmail.com',
        phone: '9988776655',
        surl: 'https://apiplayground-response.herokuapp.com/', // Success URL
        furl: 'https://apiplayground-response.herokuapp.com/', // Failure URL
        salt: 'mcuyBrSdirqcH9bLowVLoe9eca77ttX6'
    };

   
    paymentDetails.hash = generateHash(paymentDetails);
    console.log(paymentDetails.hash);
   
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

   
    const { txnid, status, key, amount, email, salt, hash } = webhookData;

   
    const generatedHash = generateHash({
        key,
        txnid,
        amount,
        productinfo: webhookData.productinfo,
        firstname: webhookData.firstname,
        email,
        salt
    });

   
    if (generatedHash !== hash) {
        console.log('Hash mismatch, potential tampering');
        return res.status(400).send('Invalid hash');
    }

   
    switch (status) {
        case 'success':
            console.log(`Payment successful for transaction ID: ${txnid}`);
          
            break;
        case 'failure':
            console.log(`Payment failed for transaction ID: ${txnid}`);
         
            break;
        case 'refund':
            console.log(`Payment refunded for transaction ID: ${txnid}`);
          
            break;
        case 'dispute':
            console.log(`Dispute raised for transaction ID: ${txnid}`);
         
            break;
        default:
            console.log('Unhandled payment status:', status);
    }

    
    res.status(200).send('Webhook received successfully');
});


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
