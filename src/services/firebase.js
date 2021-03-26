import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import 'firebase/firestore';
var config = {
  apiKey: "AIzaSyAHYCLV-AnAFMLUJMSWup_J7YbmRJo-px4",
  authDomain: "finger-guess.firebaseapp.com",
  projectId: "finger-guess",
  storageBucket: "finger-guess.appspot.com",
  messagingSenderId: "1038015472766",
  appId: "1:1038015472766:web:6b8a2464533ce75fe6642f",
  measurementId: "G-712J1S0L3V"
};

firebase.initializeApp(config);


export const auth = firebase.auth;
export const db = firebase.firestore();

