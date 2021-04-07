const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin');
const serviceAccount = require('./amcham-app-firebase-adminsdk-j7px6-82dff37ac5.json');
const cors = require('cors')({ origin: true });
const https = require('https');
//const nodemailer = require('nodemailer');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: 'amchamsa.events@gmail.com',
//         pass: '31Bextonlane#'  //you your password
//     }
// });
// exports.sendMail = functions.https.onRequest((req, res) => {
//     cors(req, res, () => {
//         // getting dest email by query string
//         const dest = req.query.dest;
//         const subject = req.query.subject;
//         const message = req.query.message;

//         const mailOptions = {
//             from: 'Amcham ZA <amchamsa.events@gmail.com>', // 
//             to: dest,
//             subject: subject, // email subject
//             html: message,
//         };
//         // returning result
//         return transporter.sendMail(mailOptions, (e, info) => {
//             if (e) {
//                 return res.send(e.toString());
//             }
//             return res.send('Sent');
//         });
//     });
// });

exports.registerUser = functions.https.onRequest((req, res) => {
    cors(req, res, async function () {
        // getting dest email by query string
        const userKey = req.query.user;
        const eventID = req.query.eventID;
        var data;
        console.log(userKey);
        var snapshot = await db.collection('UserInfo').where('key', '==', userKey.toString()).get();
        var user = snapshot.docs[0].id;
        console.log(user);
        //update user field
        var userEventData = [];
        await db.collection('UserInfo').doc(user).get().then(documentSnapshot => {
            data = documentSnapshot.data();
        });

        try {
            userEventData = data["owned_events"];
            userEventData.push(eventID);
        }
        catch (e) {
            console.log(e);
            console.log("error");
            userEventData = [eventID];
        }
        await db.collection('UserInfo').doc(user).set({ 'owned_events': userEventData }, { merge: true });

        //update event field
        await db.collection('Events').doc(eventID).get().then(documentSnapshot => {
            data = documentSnapshot.data();
        });
        var eventUserData = [];
        try {
            eventUserData = data["registered_users"];
            eventUserData.push(user);
        }
        catch (e) {
            console.log(e);
            console.log("error");
            eventUserData = [user];
        }
        await db.collection('Events').doc(eventID).set({ 'registered_users': eventUserData }, { merge: true });
        //var userEmailString; // make it the email with %40
        //await https.get('https://us-central1-amcham-app.cloudfunctions.net/genkey?user='+userEmailString);
        await updatekey(user);
        res.send('success \n you can close this window');

        return;

    });
});

exports.genkey = functions.https.onRequest((req, res) => {
    cors(req, res, async function () {
        const user = req.query.user;
        var key = await updatekey(user);
        return res.send(key);

    });
});


function makekey(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
async function updatekey(user) {
    var key = makekey(15);
    db.collection('UserInfo').doc(user).set({ 'key': key.toString() }, { merge: true });
    return key;
}
