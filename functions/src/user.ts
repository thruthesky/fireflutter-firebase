import * as admin from "firebase-admin";

const db = admin.firestore();
const auth = admin.auth();
const metaCol = db.collection("meta");
class User {
  publicDoc(uid: string) {
    return metaCol.doc("user").collection("public").doc(uid);
  }
  async delete(data: any, context: any) {
    await auth.deleteUser(data.uid);
    await this.publicDoc(data.uid).delete();
  }
}

export { User };
