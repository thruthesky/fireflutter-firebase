import * as admin from "firebase-admin";

/// Firebase Admin SDK Account Key 를 가져 옴
const serviceAccount = require("/Users/thruthesky/Documents/Keys/firebase/admin-sdk-service-account-key/sonub-dating.json");

/// Firebase 초기화는 한 번 만 함
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://sonub-dating.firebaseio.com"
  });
}

/// 테스트를 위한 헬퍼 함수 import
import { deleteCollection } from "./test-helper-functions";

/// 테스트 툴
import "mocha";
import { assert } from "chai";

/// Firebase Authentication 의 사용자를 관리하기 위한 admin.auth() 인스턴스
const auth = admin.auth();

/// 테스트 사용자 정보
const password = "12345a,*";
interface UserData {
  email: string;
  password: string;
  phoneNumber: string;
  displayName: string;
  photoURL: string;
  disabled: boolean;
}
interface UsersData {
  [key: string]: UserData;
}
const users: UsersData = {
  a: {
    email: "userA@test.com",
    password: password,
    phoneNumber: "+10123456782",
    displayName: "User A",
    photoURL: "http://www.example.com/12345678/photo.png",
    disabled: false
  },
  b: {
    email: "userB@test.com",
    password: password,
    phoneNumber: "+10123456780",
    displayName: "User B",
    photoURL: "http://www.example.com/12345678/photo.png",
    disabled: false
  },
  c: {
    email: "userC@test.com",
    password: password,
    phoneNumber: "+10123456781",
    displayName: "User C",
    photoURL: "http://www.example.com/12345678/photo.png",
    disabled: false
  }
};

import { User } from "../src/user";
const user = new User();

describe("Firebase test", () => {
  it("Clean user data before test", async () => {
    for (const k of Object.keys(users)) {
      console.log(k);
      try {
        const u = await auth.getUserByEmail(users[k].email);
        await user.delete({ uid: u.uid }, {});
        console.log(`${u.displayName} has been deleted.`);
      } catch (e) {
        if (e.code == "auth/user-not-found") {
        } else {
          console.log(e);
          assert(false, "Failed to delete user.");
        }
      }
    }
  });
  it("Clean test firestore data before test", async () => {
    await deleteCollection(admin.firestore(), "test/data/path", 500);
  });
  it("Create user - A", async () => {
    const userRecord = await admin.auth().createUser(users.a);
    assert(userRecord.displayName, users.a.displayName);
  });
});
