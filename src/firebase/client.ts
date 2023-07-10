import { initializeApp } from "firebase/app"

const firebaseConfig = {
    apiKey: "AIzaSyDLO2_savEZ5UKpikcUlqkM_VBo2fz_7x0",
    authDomain: "musical-stockpile.firebaseapp.com",
    projectId: "musical-stockpile",
    storageBucket: "musical-stockpile.appspot.com",
    messagingSenderId: "1031455092948",
    appId: "1:1031455092948:web:b73ea51df0145449914b41",
    measurementId: "G-FZ846HX34V"
}

export const app = initializeApp(firebaseConfig)