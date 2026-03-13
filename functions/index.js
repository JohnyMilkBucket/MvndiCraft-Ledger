const { onDocumentDeleted, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

async function deleteCollectionDocs(refs) {
  if (!refs.length) return 0;

  let batch = db.batch();
  let count = 0;
  let deleted = 0;

  for (const ref of refs) {
    batch.delete(ref);
    count += 1;
    deleted += 1;

    if (count === 400) {
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }

  if (count) await batch.commit();
  return deleted;
}

exports.cleanupListingsOnUserMembershipChange = onDocumentUpdated('users/{userId}', async (event) => {
  const before = event.data.before.data() || {};
  const after = event.data.after.data() || {};
  const userId = event.params.userId;

  const beforeMemberships = Array.isArray(before.orgMemberships) ? before.orgMemberships : [];
  const afterMemberships = Array.isArray(after.orgMemberships) ? after.orgMemberships : [];

  const beforeOrgIds = new Set(beforeMemberships.map(m => String((m && m.orgId) || '')).filter(Boolean));
  const afterOrgIds = new Set(afterMemberships.map(m => String((m && m.orgId) || '')).filter(Boolean));
  const removedOrgIds = [...beforeOrgIds].filter(orgId => !afterOrgIds.has(orgId));

  for (const orgId of removedOrgIds) {
    const snap = await db.collection('marketListings').where('orgId', '==', orgId).get();
    const refs = snap.docs
      .filter(doc => {
        const d = doc.data() || {};
        return [d.createdBy, d.ownerUid, d.listedByUid].map(v => String(v || '')).includes(String(userId));
      })
      .map(doc => doc.ref);

    await deleteCollectionDocs(refs);
  }

  return null;
});

exports.cleanupListingsOnOrgDelete = onDocumentDeleted('orgs/{orgId}', async (event) => {
  const orgId = String(event.params.orgId || '');
  if (!orgId) return null;

  const snap = await db.collection('marketListings').where('orgId', '==', orgId).get();
  await deleteCollectionDocs(snap.docs.map(doc => doc.ref));
  return null;
});
