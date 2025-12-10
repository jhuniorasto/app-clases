/**
 * Utilidades comunes para operaciones Firestore
 * Centralizan conversión de datos, manejo de fechas y operaciones CRUD repetitivas
 */

import {
  Firestore,
  CollectionReference,
  DocumentReference,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  QueryConstraint,
  DocumentData,
  Timestamp,
} from '@angular/fire/firestore';

/**
 * Tipo genérico para modelos con método fromFirestore
 */
export interface FirestoreModel<T> {
  fromFirestore(data: any, id: string): T;
}

/**
 * Convierte una fecha a formato ISO string para guardar en Firestore
 */
export function serializeDate(date: Date | string): string {
  if (typeof date === 'string') return date;
  return date.toISOString();
}

/**
 * Convierte un string ISO a Date
 */
export function deserializeDate(dateString: string | Date): Date {
  if (dateString instanceof Date) return dateString;
  return new Date(dateString);
}

/**
 * Convierte Timestamp de Firestore o string a Date
 */
export function toDate(value: any): Date | any {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'string') return new Date(value);
  return value;
}

/**
 * Convierte campos que puedan venir como Timestamp/string a Date
 */
export function convertTimestampFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const clone = { ...obj } as any;
  fields.forEach((field) => {
    if (clone[field] !== undefined && clone[field] !== null) {
      clone[field] = toDate(clone[field]);
    }
  });
  return clone;
}

/**
 * Serializa un objeto con fechas para guardar en Firestore
 */
export function serializeDates<T extends Record<string, any>>(
  obj: T,
  dateFields: (keyof T)[]
): Record<string, any> {
  const result = { ...obj };
  dateFields.forEach((field) => {
    const value = result[field] as any;
    if (value instanceof Date) {
      (result as any)[field] = serializeDate(value);
    }
  });
  return result;
}

/**
 * Deserializa un objeto con fechas desde Firestore
 */
export function deserializeDates<T extends Record<string, any>>(
  obj: T,
  dateFields: (keyof T)[]
): T {
  const result = { ...obj };
  dateFields.forEach((field) => {
    if (typeof result[field] === 'string') {
      result[field] = deserializeDate(result[field] as string) as any;
    }
  });
  return result;
}

/**
 * Obtiene una referencia a una colección
 */
export function getCollectionRef(
  firestore: Firestore,
  path: string
): CollectionReference {
  return collection(firestore, path);
}

/**
 * Obtiene una referencia a un documento
 */
export function getDocRef(
  firestore: Firestore,
  path: string
): DocumentReference {
  return doc(firestore, path);
}

/**
 * Crea un documento en una colección
 */
export async function createDocument<T>(
  collectionRef: CollectionReference,
  data: T
): Promise<string> {
  const docRef = await addDoc(collectionRef, data as DocumentData);
  return docRef.id;
}

/**
 * Crea o reemplaza un documento por ID
 */
export async function setDocument<T>(
  firestore: Firestore,
  collectionPath: string,
  id: string,
  data: T
): Promise<void> {
  const ref = getDocRef(firestore, `${collectionPath}/${id}`);
  await setDoc(ref, data as DocumentData);
}

/**
 * Obtiene un documento por ID
 */
export async function getDocumentById<T>(
  firestore: Firestore,
  collectionPath: string,
  id: string,
  mapper: (data: any, id: string) => T
): Promise<T | null> {
  const docRef = getDocRef(firestore, `${collectionPath}/${id}`);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;
  return mapper(snap.data(), snap.id);
}

/**
 * Obtiene todos los documentos de una colección
 */
export async function getAllDocuments<T>(
  collectionRef: CollectionReference,
  mapper: (data: any, id: string) => T
): Promise<T[]> {
  const snapshot = await getDocs(collectionRef);
  return snapshot.docs.map((doc) => mapper(doc.data(), doc.id));
}

/**
 * Obtiene documentos con query
 */
export async function queryDocuments<T>(
  collectionRef: CollectionReference,
  constraints: QueryConstraint[],
  mapper: (data: any, id: string) => T
): Promise<T[]> {
  const q = query(collectionRef, ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => mapper(doc.data(), doc.id));
}

/**
 * Actualiza un documento
 */
export async function updateDocument(
  firestore: Firestore,
  collectionPath: string,
  id: string,
  data: Partial<any>
): Promise<void> {
  const docRef = getDocRef(firestore, `${collectionPath}/${id}`);
  await updateDoc(docRef, data);
}

/**
 * Elimina un documento
 */
export async function deleteDocument(
  firestore: Firestore,
  collectionPath: string,
  id: string
): Promise<void> {
  const docRef = getDocRef(firestore, `${collectionPath}/${id}`);
  await deleteDoc(docRef);
}

/**
 * Maneja errores de Firestore de forma consistente
 */
export function handleFirestoreError(error: any, operation: string): never {
  console.error(`❌ Error en ${operation}:`, error);

  // Mapeo de códigos de error comunes
  const errorMessages: Record<string, string> = {
    'permission-denied': 'No tienes permisos para realizar esta operación',
    'not-found': 'El recurso solicitado no existe',
    'already-exists': 'El recurso ya existe',
    'failed-precondition': 'La operación no cumple las condiciones necesarias',
    unavailable: 'El servicio no está disponible temporalmente',
  };

  const code = error?.code || 'unknown';
  const message =
    errorMessages[code] ||
    `Error inesperado: ${error?.message || 'Desconocido'}`;

  throw new Error(message);
}

/**
 * Verifica si un documento existe
 */
export async function documentExists(
  firestore: Firestore,
  collectionPath: string,
  id: string
): Promise<boolean> {
  const docRef = getDocRef(firestore, `${collectionPath}/${id}`);
  const snap = await getDoc(docRef);
  return snap.exists();
}
