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
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

exports.registerUser = functions.https.onRequest((req, res) => {
    cors(req, res, async function () {
        // getting dest email by query string
        const user = req.query.user;
        const eventID = req.query.eventID;
        var data;
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
        await db.collection('UserInfo').doc(user).set({ 'owned_events': userEventData}, {merge: true});
       
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
        await db.collection('Events').doc(eventID).set({ 'registered_users': eventUserData}, {merge: true});


        res.send('success');

        return;

    });
});
