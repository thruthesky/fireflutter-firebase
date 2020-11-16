const {
    assertFails,
    assertSucceeds,
    firestore
} = require("@firebase/rules-unit-testing");
const { setup, myAuth, myUid, otherAuth, otherUid } = require("./helper");


const roomId = 'room-id-123';

function data(obj) {
    return Object.assign({}, postData, obj);
}

describe("Chat", () => {

    it("Create a room", async () => {
        const db = await setup(myAuth, null);
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);
        await assertSucceeds(roomInfoDoc.set({ users: [myAuth.uid] }));
    });






    it("Update other room info: replace users: [otherUid] to users: [myUid]", async () => {
        const db = await setup(myAuth, {
            [`chat/room/list/${roomId}`]: { users: [otherUid] }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);
        await assertFails(roomInfoDoc.update({ users: [myAuth.uid] }));
    });

    it("Update other room info: add property val: 1", async () => {
        const db = await setup(myAuth, {
            [`chat/room/list/${roomId}`]: { users: [otherUid] }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);
        await assertFails(roomInfoDoc.update({ val: 1 }));
    });





    it("Update room info: Can't update any property", async () => {
        const db = await setup(myAuth, {
            [`chat/room/list/${roomId}`]: { users: [myUid], val: 0 }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);
        await assertFails(roomInfoDoc.update({ val: 1 }));
    });




    it("Read other room with empty user", async () => {
        const db = await setup(myAuth, {
            [`chat/room/list/${roomId}`]: { users: [] }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);
        await assertFails(roomInfoDoc.get());
    });

    it("Read other message from room (not my room)", async () => {
        const db = await setup(myAuth, {
            [`chat/room/list/${roomId}`]: { users: [ otherUid] }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);
        await assertFails(roomInfoDoc.get());
    });


    it("Read room info of my room", async () => {
        const db = await setup(myAuth, {
            [`chat/room/list/${roomId}`]: { users: [ myUid ] }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);
        await assertSucceeds(roomInfoDoc.get());
    });



    it("Add a user to my room", async () => {
        const db = await setup(myAuth, {
            [`chat/room/list/${roomId}`]: { users: [myAuth.uid, otherUid] }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);
        await assertSucceeds(roomInfoDoc.update({ users: [myAuth.uid, otherUid, 'another-user-uid'] }));
    });


    it("Add two users to my room", async () => {
        const db = await setup(myAuth, {
            [`chat/room/list/${roomId}`]: { users: [myAuth.uid, otherUid] }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);
        await assertSucceeds(roomInfoDoc.update({ users: [myAuth.uid, otherUid, 'user-1', 'user-2'] }));
    });

    it("Removing other user by a user shoud be failed: ", async () => {
        const db = await setup(myAuth, {
            [`chat/room/list/${roomId}`]: { users: [myAuth.uid, otherUid] }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);

        /// Remove otherUid
        await assertFails(roomInfoDoc.update({ users: [myAuth.uid, 'user-1', 'user-2'] }));
    });

    it("Removing a user by a user shoud be failed (2): ", async () => {
        const db = await setup(otherAuth, {
            [`chat/room/list/${roomId}`]: { users: [myAuth.uid, otherUid, 'your-uid'] }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);

        /// Remove 'your-uid'
        await assertFails(roomInfoDoc.update({ users: [myAuth.uid] }));
    });


    it("Removing a user by a moderator shoud be success: ", async () => {
        const db = await setup(myAuth, {
            [`chat/room/list/${roomId}`]: { moderators: [myUid, 'his-uid'], users: [myAuth.uid, otherUid, 'your-uid'] }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);
        await assertSucceeds(roomInfoDoc.update({ users: [myAuth.uid] }));
    });


    it("Read room(last message) from my room list", async () => {
        const db = await setup(myAuth, {
            [`chat/users/${myUid}/${roomId}`]: { users: [myUid, otherUid, 'your-uid'] }
        });
        const roomInfoDoc = db.collection('chat').doc('users').collection(myUid).doc(roomId);
        // console.log('path: ', roomInfoDoc.path);
        // console.log('data; ', (await roomInfoDoc.get()).data());
        await assertSucceeds(roomInfoDoc.get());
    });


    it("Can't read room in other room list", async () => {
        const db = await setup(myAuth, {
            [`chat/users/${otherUid}/${roomId}`]: { users: [myUid, otherUid, 'your-uid'] }
        });
        const roomInfoDoc = db.collection('chat').doc('users').collection(otherUid).doc(roomId);
        await assertFails(roomInfoDoc.get());
    });


    it("Delete room of other user's room list", async () => {
        const db = await setup(myAuth, {
            [`chat/users/${otherUid}/${roomId}`]: { users: [myUid, otherUid, 'your-uid'] }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);
        await assertFails(roomInfoDoc.delete());
    });



    it("Can't delete room(last message) from other user's room list", async () => {
        const db = await setup(myAuth, {
            [`chat/users/${otherUid}/${roomId}`]: { users: [myUid, otherUid, 'your-uid'] }
        });
        const roomInfoDoc = db.collection('chat').doc('users').collection(otherUid).doc(roomId);
        await assertFails(roomInfoDoc.delete());
    });


    it("Leave from room", async () => {
        const db = await setup(myAuth, {
            [`chat/room/list/${roomId}`]: { users: [myUid, otherUid, 'your-uid'] }
        });
        const roomInfoDoc = db.collection('chat').doc('room').collection('list').doc(roomId);

        /// Remove myUid. Leaving room.
        await assertSucceeds(roomInfoDoc.update({ users: [otherUid, 'your-uid'] }));
    });



    
    it("Delete room(last message) from my room list", async () => {
        const db = await setup(myAuth, {
            [`chat/users/${myUid}/${roomId}`]: { users: [myUid, otherUid, 'your-uid'] }
        });
        const roomInfoDoc = db.collection('chat').doc('users').collection(myUid).doc(roomId);
        await assertSucceeds(roomInfoDoc.delete());
    });




});

// const firebase = require("@firebase/rules-unit-testing");
// const { setup, myAuth, myUid } = require("./helper");

// describe("Basic", () => {
//     it("Read should success", async () => {
//         const db = await setup();

//         const testDoc = db.collection("readonlytest").doc("testDocId");

//         await firebase.assertSucceeds(testDoc.get());
//     });
//     it("Write should fail", async () => {
//         const db = await setup();
//         const testDoc = db.collection("readonlytest").doc("testDocId");

//         // Fails due to user authentication
//         await firebase.assertFails(testDoc.set({ foo: "bar" }));
//     });

//     it("Write should success", async () => {
//         const db = await setup(myAuth);

//         const myDoc = db.collection("readonlytest").doc(myUid);

//         await firebase.assertSucceeds(myDoc.set({ foo: "bar" }));
//     });

//     //
//     it("Read success on public doc", async () => {
//         const db = await setup();
//         const testQuery = db
//             .collection("publictest")
//             .where("visibility", "==", "public");
//         await firebase.assertSucceeds(testQuery.get());
//     });

//     it("Read success on public doc", async () => {
//         const db = await setup(myAuth);
//         const testQuery = db.collection("publictest").where("uid", "==", myUid);
//         await firebase.assertSucceeds(testQuery.get());
//     });

//     // 관리자 db instance 로 private 값을 미리 지정해서, 오류 테스트
//     // Set data on firestore documents with admin permission and test.
//     it("Read success on public doc", async () => {
//         const db = await setup(myAuth, {
//             "publictest/privateDocId": {
//                 visibility: "private"
//             },
//             "publictest/publicDocId": {
//                 visibility: "public"
//             },
//             "publictest/myDocId": {
//                 visibility: "does not matter",
//                 uid: myUid
//             }
//         });
//         let testQuery = db.collection("publictest").doc("privateDocId");
//         await firebase.assertFails(testQuery.get());
//         testQuery = db.collection("publictest").doc("publicDocId");
//         await firebase.assertSucceeds(testQuery.get());

//         await firebase.assertSucceeds(
//             db.collection("publictest").doc("myDocId").get()
//         );
//     });
// });
