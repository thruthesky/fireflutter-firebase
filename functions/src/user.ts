import * as admin from "firebase-admin";
import { UserRecord } from "firebase-functions/lib/providers/auth";
import {
  EMPTY_UID,
  USER_PUBLIC_DATA_NOT_EXISTS,
  YOU_ARE_NOT_ADMIN,
  ADMIN_UID_EMPTY,
  ADMIN_PUBLIC_DATA_NOT_EXISTS
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
    } else {
      for (const id of uid) {
        await auth.deleteUser(id);
      }
    }
  }
  async setAdmin(uid: string, context: any): Promise<void> {
    await this.checkAdmin(context);
    if (!uid) throw EMPTY_UID;
    await this.publicDoc(uid).set(
      {
        isAdmin: true
      },
      { merge: true }
    );
  }

  /**
   * Returns user's public data.
   *
   * @note id will be inserted into the public data.
   *
   * @param uid user uid
   */
  async publicDataGet(uid: string): Promise<any> {
    if (!uid) throw EMPTY_UID;
    const snapshot = await this.publicDoc(uid).get();
    if (snapshot.exists === false) throw USER_PUBLIC_DATA_NOT_EXISTS;
    const data: any = snapshot.data();

    data["id"] = snapshot.id;
    return data;
  }

  /**
   * Creates public data.
   * This will overwrite all the public data document
   */
  async publicDataCreate(uid: string, context: any) {
    await this.checkAdmin(context);
    await this.publicDoc(uid).set({
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  /**
   * Updates public data.
   *
   * If public document does not exists, it will create by set merging.
   */
  async publicDataUpdate(uid: string, context: any) {
    await this.checkAdmin(context);
    await this.publicDoc(uid).set(
      {
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );
  }

  /**
   * Deletes a user's public data or multiple user's uid.
   * @param uid a string of uid or string list of multiple uid
   * @param context context
   */
  async publicDataDelete(uid: any, context: any) {
    await this.checkAdmin(context);

    if (typeof uid === "string") {
      await this.publicDoc(uid).delete();
    } else {
      for (const id of uid) {
        await this.publicDoc(id).delete();
      }
    }
  }

  /// Returns true if the uid (of the user) is admin.
  async isAdmin(uid: string): Promise<boolean> {
    if (!uid) throw EMPTY_UID;
    const snapshot = await this.publicDoc(uid).get();
    if (snapshot.exists === false) throw ADMIN_PUBLIC_DATA_NOT_EXISTS;
    const data: any = snapshot.data();
    return !!data.isAdmin;
  }

  /// Throws an error if the (requesting) user is not admin.
  async checkAdmin(context: any) {
    if (!context || !context.auth || !context.auth.uid) throw ADMIN_UID_EMPTY;
    const re = await this.isAdmin(context.auth.uid);
    if (re === false) throw YOU_ARE_NOT_ADMIN;
  }
}

export { User };
