const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

const APPLY = process.argv.includes('--apply');
const OLD_ID = 'b1_prep_place_012';
const NEW_ID = 'b1_prep_place_01';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

function timestampMillis(value) {
  return value?.toMillis?.() || 0;
}

function sum(left, right, field) {
  return Math.max(0, Number(left?.[field]) || 0) +
    Math.max(0, Number(right?.[field]) || 0);
}

function mergeGrammarProgress(oldData, newData) {
  const oldTime = timestampMillis(oldData.lastAnsweredAt);
  const newTime = timestampMillis(newData.lastAnsweredAt);
  const latest = Object.keys(newData).length && newTime >= oldTime
    ? newData
    : oldData;

  return {
    ...oldData,
    ...newData,
    attempts: sum(oldData, newData, 'attempts'),
    everCorrect: oldData.everCorrect === true || newData.everCorrect === true,
    lastCorrect: latest.lastCorrect ?? false,
    lastAnsweredAt: latest.lastAnsweredAt || oldData.lastAnsweredAt || newData.lastAnsweredAt,
  };
}

function mergeLearningProgress(oldData, newData) {
  const oldTime = timestampMillis(oldData.lastAnsweredAt);
  const newTime = timestampMillis(newData.lastAnsweredAt);
  const [earliest, latest] = Object.keys(newData).length && oldTime <= newTime
    ? [oldData, newData]
    : [newData, oldData];

  return {
    ...earliest,
    ...latest,
    itemId: NEW_ID,
    attemptCount: sum(oldData, newData, 'attemptCount'),
    correctCount: sum(oldData, newData, 'correctCount'),
    incorrectCount: sum(oldData, newData, 'incorrectCount'),
    everCorrect: oldData.everCorrect === true || newData.everCorrect === true,
    firstAttemptCorrect:
      earliest.firstAttemptCorrect ?? latest.firstAttemptCorrect ?? null,
  };
}

async function getAllChunked(refs) {
  const snapshots = [];
  for (let index = 0; index < refs.length; index += 250) {
    snapshots.push(...await db.getAll(...refs.slice(index, index + 250)));
  }
  return snapshots;
}

async function main() {
  const operations = [];
  const counts = {
    grammarProgressMerged: 0,
    learningProgressMerged: 0,
    favouritesRepointed: 0,
    duplicateFavouritesRemoved: 0,
    mistakesRepointed: 0,
    grammarSetsUpdated: 0,
    duplicateBankDocumentsRemoved: 0,
  };

  const canonicalItem = await db.collection('grammarItems').doc(NEW_ID).get();
  if (!canonicalItem.exists) {
    throw new Error(`Canonical grammar item ${NEW_ID} does not exist.`);
  }

  const users = await db.collection('users').get();
  const progressRefs = users.docs.flatMap(user => [
    user.ref.collection('grammarProgress').doc(OLD_ID),
    user.ref.collection('grammarProgress').doc(NEW_ID),
  ]);
  const learningRefs = users.docs.flatMap(user => [
    user.ref.collection('grammarLearningProgress').doc(OLD_ID),
    user.ref.collection('grammarLearningProgress').doc(NEW_ID),
  ]);
  const [progressDocs, learningDocs] = await Promise.all([
    getAllChunked(progressRefs),
    getAllChunked(learningRefs),
  ]);

  for (let index = 0; index < progressDocs.length; index += 2) {
    const oldDoc = progressDocs[index];
    const newDoc = progressDocs[index + 1];
    if (!oldDoc.exists) continue;

    operations.push({
      type: 'set',
      ref: newDoc.ref,
      data: mergeGrammarProgress(oldDoc.data() || {}, newDoc.data() || {}),
    });
    operations.push({ type: 'delete', ref: oldDoc.ref });
    counts.grammarProgressMerged += 1;
  }

  for (let index = 0; index < learningDocs.length; index += 2) {
    const oldDoc = learningDocs[index];
    const newDoc = learningDocs[index + 1];
    if (!oldDoc.exists) continue;

    operations.push({
      type: 'set',
      ref: newDoc.ref,
      data: mergeLearningProgress(oldDoc.data() || {}, newDoc.data() || {}),
    });
    operations.push({ type: 'delete', ref: oldDoc.ref });
    counts.learningProgressMerged += 1;
  }

  const favourites = await db.collectionGroup('favourites').get();
  const favouriteGroups = new Map();
  favourites.docs
    .filter(doc => [OLD_ID, NEW_ID].includes(doc.data()?.itemId))
    .forEach(doc => {
      const key = doc.ref.parent.path;
      const group = favouriteGroups.get(key) || { old: [], canonical: [] };
      group[doc.data().itemId === OLD_ID ? 'old' : 'canonical'].push(doc);
      favouriteGroups.set(key, group);
    });

  for (const group of favouriteGroups.values()) {
    if (!group.old.length) continue;
    if (group.canonical.length) {
      group.old.forEach(doc => operations.push({ type: 'delete', ref: doc.ref }));
      counts.duplicateFavouritesRemoved += group.old.length;
      continue;
    }

    operations.push({
      type: 'set',
      ref: group.old[0].ref,
      data: { itemId: NEW_ID },
    });
    group.old.slice(1).forEach(doc => operations.push({ type: 'delete', ref: doc.ref }));
    counts.favouritesRepointed += 1;
    counts.duplicateFavouritesRemoved += Math.max(0, group.old.length - 1);
  }

  const mistakes = await db.collectionGroup('mistakes').get();
  mistakes.docs
    .filter(doc => doc.data()?.itemId === OLD_ID)
    .forEach(doc => {
      operations.push({ type: 'set', ref: doc.ref, data: { itemId: NEW_ID } });
      counts.mistakesRepointed += 1;
    });

  const grammarSets = await db.collection('grammarSets').get();
  grammarSets.docs.forEach(doc => {
    const itemIds = Array.isArray(doc.data()?.itemIds) ? doc.data().itemIds : [];
    if (!itemIds.includes(OLD_ID)) return;

    const canonicalIds = itemIds
      .map(id => id === OLD_ID ? NEW_ID : id)
      .filter((id, index, values) => values.indexOf(id) === index);
    operations.push({ type: 'set', ref: doc.ref, data: { itemIds: canonicalIds } });
    counts.grammarSetsUpdated += 1;
  });

  const duplicateBankDoc = await db.collection('grammarItems').doc(OLD_ID).get();
  if (duplicateBankDoc.exists) {
    operations.push({ type: 'delete', ref: duplicateBankDoc.ref });
    counts.duplicateBankDocumentsRemoved = 1;
  }

  console.log(JSON.stringify({
    mode: APPLY ? 'apply' : 'preview',
    oldId: OLD_ID,
    canonicalId: NEW_ID,
    usersScanned: users.size,
    operations: operations.length,
    ...counts,
  }, null, 2));

  if (!APPLY) return;

  const writer = db.bulkWriter();
  writer.onWriteError(error => error.failedAttempts < 3);
  for (const operation of operations) {
    if (operation.type === 'delete') {
      writer.delete(operation.ref);
    } else {
      writer.set(operation.ref, operation.data, { merge: true });
    }
  }
  await writer.close();
  console.log('Grammar item ID migration completed successfully.');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
