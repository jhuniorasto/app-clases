// src/testing/firestore-functions.mock.ts
export const collection = () => ({});
export const doc = () => ({});
export const getDocs = () =>
  Promise.resolve({
    docs: [],
    size: 0,
    empty: true,
    metadata: {},
    query: {},
    docChanges: () => [],
    forEach: () => {},
  });
export const addDoc = () => Promise.resolve({ id: 'mockDocId' });
export const deleteDoc = () => Promise.resolve();
export const updateDoc = () => Promise.resolve();
