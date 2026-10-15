import { onValue, ref } from "firebase/database";

export function getRealtimeServerTimeOffset(database) {
  // .info is client-local metadata. get() sends it to the server as a data path,
  // which Firebase rejects with "Invalid token in path".
  return new Promise((resolve, reject) => {
    onValue(ref(database, ".info/serverTimeOffset"), (snapshot) => {
      resolve(Number(snapshot.val()) || 0);
    }, reject, { onlyOnce: true });
  });
}
