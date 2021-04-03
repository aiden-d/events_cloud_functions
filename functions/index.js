const functions = require("firebase-functions");

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

exports.registerUser = functions.https.onRequest((req, res) => {
    cors(req, res,  () => /*async function()*/{
        // getting dest email by query string
        const user = req.query.user;
        const eventID = req.query.eventID;
        db.collection('UserInfo').doc(user).get();
        res.send(user);
        // //var ownedEvents = UserDoc("owned_events")
        // var ownedEvents = ["test1","test2"]

        // ownedEvents.push(eventID);
        // await db.collection('UserInfo').doc(user).update({ 'owned_events': ownedEvents}).then;
        // await db.collection('TestCollection').doc('TestDoc').update({ 'username': user , 'eventID': eventID}).then(() => { (console.log('Done')) });
        // return ":)";

    });
});
