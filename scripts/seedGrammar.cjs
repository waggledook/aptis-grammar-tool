// scripts/seedGrammar.js
const admin = require('firebase-admin');
const items = require('./grammar-items.json'); // your 50‐item list

// Load the service account key JSON
const serviceAccount = require('./serviceAccountKey.json');

// Initialize the Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const batch = db.batch();

// Seed each item into the 'grammarItems' collection,
// using the item.id for the document ID.
items.forEach(item => {
  const docRef = db.collection('grammarItems').doc(item.id);

  // Normalize tags: if you still have `tag`, convert it to `tags: [tag]`
  const data = {
    ...item,
    tags: Array.isArray(item.tags)
      ? item.tags
      : item.tag
        ? [item.tag]
        : []
  };
  delete data.tag; // remove old single-tag field if present

  batch.set(docRef, data);
});

batch.commit()
  .then(() => {
    console.log('✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  });
