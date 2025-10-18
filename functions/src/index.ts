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
