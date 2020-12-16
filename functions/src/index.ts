// require("cors")({ origin: true });
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

import { functionsRegion } from "./config";
import { User } from "./user";

const user = new User();

exports.userCreate = functions
  .region(functionsRegion)
  .https.onCall(async (data, context) => {
    try {
      return await user.create(data, context);
    } catch (error) {
      throw new functions.https.HttpsError("unimplemented", error, data);
    }
  });
exports.userDelete = functions
  .region(functionsRegion)
  .https.onCall(async (data, context) => {
    try {
      return await user.delete(data, context);
    } catch (error) {
      throw new functions.https.HttpsError("unimplemented", error, data);
    }
  });

exports.userSetAdmin = functions
  .region(functionsRegion)
  .https.onCall(async (data, context) => {
    try {
      return await user.setAdmin(data, context);
    } catch (error) {
      throw new functions.https.HttpsError("unimplemented", error, data);
    }
  });

exports.publicDataGet = functions
  .region(functionsRegion)
  .https.onCall(async (data, context) => {
    try {
      return await user.publicDataGet(data);
    } catch (error) {
      throw new functions.https.HttpsError("unimplemented", error, data);
    }
  });
exports.publicDataCreate = functions
  .region(functionsRegion)
  .https.onCall(async (data, context) => {
    try {
      return await user.publicDataCreate(data, context);
    } catch (error) {
      throw new functions.https.HttpsError("unimplemented", error, data);
    }
  });
exports.publicDataUpdate = functions
  .region(functionsRegion)
  .https.onCall(async (data, context) => {
    try {
      return await user.publicDataUpdate(data, context);
    } catch (error) {
      throw new functions.https.HttpsError("unimplemented", error, data);
    }
  });

exports.publicDataDelete = functions
  .region(functionsRegion)
  .https.onCall(async (data, context) => {
    try {
      return await user.publicDataDelete(data, context);
    } catch (error) {
      throw new functions.https.HttpsError("unimplemented", error, data);
    }
  });
