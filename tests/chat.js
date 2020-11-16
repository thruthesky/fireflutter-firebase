const {
  assertFails,
  assertSucceeds,
  firestore
} = require("@firebase/rules-unit-testing");
const { setup, myAuth, myUid, otherAuth, otherUid } = require("./helper");

const roomId = "room-id-123";

function data(obj) {
  return Object.assign({}, postData, obj);
}

const roomList = function (db) {
  return db.collection("chat").doc("info").collection("room-list");
};
const myRoomList = function (db) {
  return db.collection("chat").doc("my-room-list");
};

describe("Chat", () => {
  it("Create a room", async () => {
    const db = await setup(myAuth, null);
    const roomInfoDoc = roomList(db).doc(roomId);
    await assertSucceeds(roomInfoDoc.set({ users: [myAuth.uid] }));
  });

  it("Update other room info: replace users: [otherUid] to users: [myUid]", async () => {
    const db = await setup(myAuth, {
      [`chat/info/room-list/${roomId}`]: { users: [otherUid] }
    });
    const roomInfoDoc = roomList(db).doc(roomId);
    await assertFails(roomInfoDoc.update({ users: [myAuth.uid] }));
  });

  it("Update other room info: add property val: 1", async () => {
    const db = await setup(myAuth, {
      [`chat/info/room-list/${roomId}`]: { users: [otherUid] }
    });
    const roomInfoDoc = roomList(db).doc(roomId);
    await assertFails(roomInfoDoc.update({ val: 1 }));
  });

  it("Update room info: Can't update any property", async () => {
    const db = await setup(myAuth, {
      [`chat/info/room-list/${roomId}`]: { users: [myUid], val: 0 }
    });
    const roomInfoDoc = roomList(db).doc(roomId);
    await assertFails(roomInfoDoc.update({ val: 1 }));
  });

  it("Read other room with empty user", async () => {
    const db = await setup(myAuth, {
      [`chat/info/room-list/${roomId}`]: { users: [] }
    });
    const roomInfoDoc = roomList(db).doc(roomId);
    await assertFails(roomInfoDoc.get());
  });

  it("Read other message from room (not my room)", async () => {
    const db = await setup(myAuth, {
      [`chat/info/room-list/${roomId}`]: { users: [otherUid] }
    });
    const roomInfoDoc = roomList(db).doc(roomId);
    await assertFails(roomInfoDoc.get());
  });

  it("Read room info of my room", async () => {
    const db = await setup(myAuth, {
      [`chat/info/room-list/${roomId}`]: { users: [myUid] }
    });
    const roomInfoDoc = roomList(db).doc(roomId);
    await assertSucceeds(roomInfoDoc.get());
  });

  it("Add a user to my room", async () => {
    const db = await setup(myAuth, {
      [`chat/info/room-list/${roomId}`]: { users: [myAuth.uid, otherUid] }
    });
    const roomInfoDoc = roomList(db).doc(roomId);
    await assertSucceeds(
      roomInfoDoc.update({ users: [myAuth.uid, otherUid, "another-user-uid"] })
    );
  });

  it("Add two users to my room", async () => {
    const db = await setup(myAuth, {
      [`chat/info/room-list/${roomId}`]: { users: [myAuth.uid, otherUid] }
    });
    const roomInfoDoc = roomList(db).doc(roomId);
    await assertSucceeds(
      roomInfoDoc.update({ users: [myAuth.uid, otherUid, "user-1", "user-2"] })
    );
  });

  it("Removing other user by a user shoud be failed: ", async () => {
    const db = await setup(myAuth, {
      [`chat/info/room-list/${roomId}`]: { users: [myAuth.uid, otherUid] }
    });
    const roomInfoDoc = roomList(db).doc(roomId);

    /// Remove otherUid
    await assertFails(
      roomInfoDoc.update({ users: [myAuth.uid, "user-1", "user-2"] })
    );
  });

  it("Removing a user by a user shoud be failed (2): ", async () => {
    const db = await setup(otherAuth, {
      [`chat/info/room-list/${roomId}`]: {
        users: [myAuth.uid, otherUid, "your-uid"]
      }
    });
    const roomInfoDoc = roomList(db).doc(roomId);

    /// Remove 'your-uid'
    await assertFails(roomInfoDoc.update({ users: [myAuth.uid] }));
  });

  it("Removing a user by a moderator shoud be success: ", async () => {
    const db = await setup(myAuth, {
      [`chat/info/room-list/${roomId}`]: {
        moderators: [myUid, "his-uid"],
        users: [myAuth.uid, otherUid, "your-uid"]
      }
    });
    const roomInfoDoc = roomList(db).doc(roomId);
    await assertSucceeds(roomInfoDoc.update({ users: [myAuth.uid] }));
  });

  it("Read room(last message) from my room list", async () => {
    const db = await setup(myAuth, {
      [`chat/my-room-list/${myUid}/${roomId}`]: {
        users: [myUid, otherUid, "your-uid"]
      }
    });
    const roomInfoDoc = myRoomList(db).collection(myUid).doc(roomId);
    // console.log('path: ', roomInfoDoc.path);
    // console.log('data; ', (await roomInfoDoc.get()).data());
    await assertSucceeds(roomInfoDoc.get());
  });

  it("Can't read room in other room list", async () => {
    const db = await setup(myAuth, {
      [`chat/my-room-list/${otherUid}/${roomId}`]: {
        users: [myUid, otherUid, "your-uid"]
      }
    });
    const roomInfoDoc = myRoomList(db).collection(otherUid).doc(roomId);
    await assertFails(roomInfoDoc.get());
  });

  it("Delete room of other user's room list", async () => {
    const db = await setup(myAuth, {
      [`chat/my-room-list/${otherUid}/${roomId}`]: {
        users: [myUid, otherUid, "your-uid"]
      }
    });
    const roomInfoDoc = roomList(db).doc(roomId);
    await assertFails(roomInfoDoc.delete());
  });

  it("Can't delete room(last message) from other user's room list", async () => {
    const db = await setup(myAuth, {
      [`chat/my-room-list/${otherUid}/${roomId}`]: {
        users: [myUid, otherUid, "your-uid"]
      }
    });
    const roomInfoDoc = myRoomList(db).collection(otherUid).doc(roomId);
    await assertFails(roomInfoDoc.delete());
  });

  it("Leave from room", async () => {
    const db = await setup(myAuth, {
      [`chat/info/room-list/${roomId}`]: {
        users: [myUid, otherUid, "your-uid"]
      }
    });
    const roomInfoDoc = roomList(db).doc(roomId);

    /// Remove myUid. Leaving room.
    await assertSucceeds(roomInfoDoc.update({ users: [otherUid, "your-uid"] }));
  });

  it("Delete room(last message) from my room list", async () => {
    const db = await setup(myAuth, {
      [`chat/my-room-list/${myUid}/${roomId}`]: {
        users: [myUid, otherUid, "your-uid"]
      }
    });
    const roomInfoDoc = myRoomList(db).collection(myUid).doc(roomId);
    await assertSucceeds(roomInfoDoc.delete());
  });
});
