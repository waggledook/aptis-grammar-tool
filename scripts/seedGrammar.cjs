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
const BATCH_SIZE = 400;

async function seedGrammarItems() {
  let committed = 0;

  for (let start = 0; start < items.length; start += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = items.slice(start, start + BATCH_SIZE);

    chunk.forEach(item => {
      const docRef = db.collection('grammarItems').doc(item.id);
      const data = {
        ...item,
        tags: Array.isArray(item.tags)
          ? item.tags
          : item.tag
            ? [item.tag]
            : []
      };
      delete data.tag;
      batch.set(docRef, data);
    });

    await batch.commit();
    committed += chunk.length;
    console.log(`Committed ${committed}/${items.length} grammar items.`);
  }

  console.log('✅ Seed completed successfully!');
}

seedGrammarItems()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  });
