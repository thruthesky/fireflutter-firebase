import * as admin from "firebase-admin";
import { UserRecord } from "firebase-functions/lib/providers/auth";
import {
  EMPTY_UID,
  USER_PUBLIC_DATA_NOT_EXISTS,
  YOU_ARE_NOT_ADMIN
} from "./definitions";

const db = admin.firestore();
const auth = admin.auth();
const metaCol = db.collection("meta");
class User {
  publicDoc(uid: string) {
    return metaCol.doc("user").collection("public").doc(uid);
  }
  /**
   * Creates a user
   * @param data User create data
   * @param context context data
   *
   * @example
   *    const u = await user.create(users.admin, adminContext());
   */
  async create(data: any, context: any): Promise<UserRecord> {
    await this.checkAdmin(context);
    const user = await auth.createUser(data);
    await this.publicDoc(user.uid).set({
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return user;
  }

  /**
   * Delete users.
   *
   * @param uid string or array of string to delete usres.
   *   If it's a string, it will delte that user of uid.
   *   If it's an array of string, then it will delete the users of uid array.
   * @param context context
   */
  async delete(uid: any, context: any) {
    await this.checkAdmin(context);
    if (!uid) throw EMPTY_UID;
    if (typeof uid === "string") {
      await auth.deleteUser(uid);
      await this.publicDoc(uid).delete();
    } else {
      for (const id of uid) {
        await auth.deleteUser(id);
        await this.publicDoc(id).delete();
      }
    }
  }
  async setAdmin(uid: string, context: any): Promise<void> {
    await this.checkAdmin(context);
    if (!uid) throw EMPTY_UID;
    await this.publicDoc(uid).set({
      isAdmin: true
    });
  }

  /**
   * Returns user's public data.
   *
   * @note id will be inserted into the public data.
   *
   * @param uid user uid
   */
  async getPublicData(uid: string): Promise<any> {
    if (!uid) throw EMPTY_UID;
    const snapshot = await this.publicDoc(uid).get();
    if (snapshot.exists == false) throw USER_PUBLIC_DATA_NOT_EXISTS;
    const data: any = snapshot.data();

    data["id"] = snapshot.id;
    return data;
  }

  /// Returns true if the uid (of the user) is admin.
  async isAdmin(uid: string): Promise<boolean> {
    const user = await this.getPublicData(uid);
    return !!user.isAdmin;
  }

  /// Throws an error if the (requesting) user is not admin.
  async checkAdmin(context: any) {
    if (!context || !context.auth || !context.auth.uid) throw EMPTY_UID;
    const re = await this.isAdmin(context.auth.uid);
    if (re == false) throw YOU_ARE_NOT_ADMIN;
  }
}

export { User };
