const chai = require("chai");
const assert = chai.assert;

const test = require("firebase-functions-test")(
  {
    databaseURL: "https://fireflutter-test.firebaseio.com",
    storageBucket: "",
    projectId: "fireflutter-test"
  },
  "../firebase-service-account-key.json" //
);
