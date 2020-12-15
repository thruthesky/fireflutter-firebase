import * as functions from "firebase-functions";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

import { functionsRegion } from "./config";
import { User } from "./user";

const user = new User();

exports.registerBonusCredit = functions
  .region(functionsRegion)
  .https.onCall(async (data, context) => {
    try {
      return await user.delete(data, context as any);
    } catch (error) {
      throw new functions.https.HttpsError("unimplemented", error, data);
    }
  });
