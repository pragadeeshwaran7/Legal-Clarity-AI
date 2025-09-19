// Import the functions you need from the SDKs you need
import {initializeApp, getApps, getApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: 'studio-8098281947-f265b',
  appId: '1:857554194929:web:5592d32921a6918134f450',
  apiKey: 'AIzaSyC39QYRu84Foq4eVkvFGXsnLwQiq0N9R7Q',
  authDomain: 'studio-8098281947-f265b.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '857554194929',
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);


export {app, db, auth};
