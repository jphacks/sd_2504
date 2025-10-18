import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

const WAITING_POOL = "waiting_pool";
const USERS = "users";
const MATCHES = "matches";

/**
 * Triggered when a user enters the waiting pool.
 * This function attempts to find a match for the new user.
 */
export const onFindMatch = functions.region("asia-northeast1").firestore
  .document(`${WAITING_POOL}/{userId}`)
  .onCreate(async (snap, context) => {
    const newUser = snap.data();
    const userId = context.params.userId;

    if (!newUser || newUser.status !== 'waiting') {
      functions.logger.info(`User ${userId} is not in a 'waiting' state.`);
      return null;
    }

    try {
      await db.runTransaction(async (transaction) => {
        // 1. Try to find a "Miracle Match" (same category)
        let matchQuery = db.collection(WAITING_POOL)
          .where("category", "==", newUser.category)
          .where("status", "==", "waiting")
          .where(admin.firestore.FieldPath.documentId(), "!=", userId)
          .limit(1);

        let potentialMatches = await transaction.get(matchQuery);

        // 2. If no miracle match, find any other waiting user
        if (potentialMatches.empty) {
          matchQuery = db.collection(WAITING_POOL)
            .where("status", "==", "waiting")
            .where(admin.firestore.FieldPath.documentId(), "!=", userId)
            .limit(1);
          potentialMatches = await transaction.get(matchQuery);
        }

        if (potentialMatches.empty) {
          functions.logger.info(`No match found for user ${userId}. They will continue waiting.`);
          return;
        }

        const matchedUserDoc = potentialMatches.docs[0];
        const matchedUserData = matchedUserDoc.data();
        const isMiracleMatch = newUser.category === matchedUserData.category;

        // 3. Create a match document
        const matchRef = db.collection(MATCHES).doc();
        transaction.set(matchRef, {
          participants: [userId, matchedUserDoc.id],
          isMiracleMatch,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 4. Update both users' status to 'matched'
        transaction.update(snap.ref, { status: "matched", matchId: matchRef.id });
        transaction.update(matchedUserDoc.ref, { status: "matched", matchId: matchRef.id });

        functions.logger.info(`Match found for ${userId} and ${matchedUserDoc.id}! Miracle: ${isMiracleMatch}`);

        // 5. Award points for a Miracle Match
        if (isMiracleMatch) {
          const userRef = db.collection(USERS).doc(userId);
          const matchedUserRef = db.collection(USERS).doc(matchedUserDoc.id);
          transaction.update(userRef, { miracleMatchPoints: admin.firestore.FieldValue.increment(1) });
          transaction.update(matchedUserRef, { miracleMatchPoints: admin.firestore.FieldValue.increment(1) });
        }
      });
    } catch (error) {
      functions.logger.error("Matchmaking transaction failed for user:", userId, error);
      // Revert status to 'waiting' if something went wrong
      await snap.ref.update({ status: "waiting", matchId: admin.firestore.FieldValue.delete() });
    }
    return null;
  });

/**
 * A scheduled function to clean up stale users from the waiting pool.
 * Runs every 2 minutes.
 */
export const cleanupWaitingPool = functions.region("asia-northeast1").pubsub
  .schedule("every 2 minutes")
  .onRun(async (context) => {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const staleUsersQuery = db.collection(WAITING_POOL)
      .where("status", "==", "waiting")
      .where("createdAt", "<", twoMinutesAgo);

    const staleUsers = await staleUsersQuery.get();

    if (staleUsers.empty) {
      functions.logger.info("No stale users to clean up.");
      return null;
    }

    const batch = db.batch();
    staleUsers.docs.forEach((doc) => {
      functions.logger.info(`Timing out user ${doc.id}`);
      batch.update(doc.ref, { status: "timed_out" });
    });

    await batch.commit();
    return null;
  });

const ROOMS_COLLECTION = "rooms";

/**
 * Creates a new room in the `rooms` collection.
 */
export const createRoom = functions.region("asia-northeast1").https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in to create a room.");
  }

  const { name, category, bgmUrl } = data;
  if (!name || !category) {
    throw new functions.https.HttpsError("invalid-argument", "Room name and category are required.");
  }

  try {
    const newRoomRef = db.collection(ROOMS_COLLECTION).doc();
    await newRoomRef.set({
      name,
      category,
      bgmUrl: bgmUrl || null,
      participantCount: 1, // The creator is the first participant
      maxParticipants: 10,
      createdBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    functions.logger.info(`Room ${newRoomRef.id} created by user ${uid}.`);

    // TODO: If using a 3rd party WebRTC service, create a room on their platform as well.

    return { roomId: newRoomRef.id };
  } catch (error) {
    functions.logger.error("Error creating room:", error);
    throw new functions.https.HttpsError("internal", "Failed to create room.");
  }
});

/**
 * Allows a user to join a room and get an access token for the video call.
 */
export const joinRoom = functions.region("asia-northeast1").https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in to join a room.");
  }

  const { roomId } = data;
  if (!roomId) {
    throw new functions.https.HttpsError("invalid-argument", "Room ID is required.");
  }

  const roomRef = db.collection(ROOMS_COLLECTION).doc(roomId);

  try {
    let accessToken = "";
    await db.runTransaction(async (transaction) => {
      const roomDoc = await transaction.get(roomRef);
      if (!roomDoc.exists) {
        throw new functions.https.HttpsError("not-found", "The specified room does not exist.");
      }

      const roomData = roomDoc.data();
      if (!roomData) {
        throw new functions.https.HttpsError("internal", "Failed to read room data.");
      }

      if (roomData.participantCount >= roomData.maxParticipants) {
        throw new functions.https.HttpsError("resource-exhausted", "The room is full.");
      }

      transaction.update(roomRef, {
        participantCount: admin.firestore.FieldValue.increment(1),
      });
    });

    functions.logger.info(`User ${uid} joined room ${roomId}.`);

    // TODO: Generate a real access token from your WebRTC service provider (e.g., Agora, Twilio).
    // This token will authorize the user to join the video call session.
    accessToken = `fake-token-for-user-${uid}-in-room-${roomId}`;

    return { accessToken };
  } catch (error) {
    functions.logger.error(`Error joining room ${roomId} for user ${uid}:`, error);
    // If the error is one we threw intentionally, rethrow it.
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to join the room.");
  }
});


/**
 * Handles a user leaving a room. If the room becomes empty, it is deleted.
 */
export const leaveRoom = functions.region("asia-northeast1").https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError("unauthenticated", "User must be logged in to leave a room.");
  }

  const { roomId } = data;
  if (!roomId) {
    throw new functions.https.HttpsError("invalid-argument", "Room ID is required.");
  }

  const roomRef = db.collection(ROOMS_COLLECTION).doc(roomId);

  try {
    await db.runTransaction(async (transaction) => {
      const roomDoc = await transaction.get(roomRef);

      // If the room doesn't exist, it might have been already deleted.
      // This is not an error condition.
      if (!roomDoc.exists) {
        functions.logger.warn(`User ${uid} tried to leave a non-existent room ${roomId}.`);
        return;
      }

      const newParticipantCount = (roomDoc.data()?.participantCount || 1) - 1;

      if (newParticipantCount <= 0) {
        // If this user is the last one, delete the room.
        transaction.delete(roomRef);
        functions.logger.info(`Room ${roomId} is empty and has been deleted.`);
        // TODO: If using a 3rd party WebRTC service, close the room on their platform.
      } else {
        // Otherwise, just decrement the participant count.
        transaction.update(roomRef, {
          participantCount: admin.firestore.FieldValue.increment(-1),
        });
        functions.logger.info(`User ${uid} left room ${roomId}. New count: ${newParticipantCount}`);
      }
    });

    return { success: true };
  } catch (error) {
    functions.logger.error(`Error leaving room ${roomId} for user ${uid}:`, error);
    throw new functions.https.HttpsError("internal", "Failed to leave the room.");
  }
});
