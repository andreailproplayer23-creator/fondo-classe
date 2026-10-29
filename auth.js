import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { 
    getAuth, 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";

// TODO: Sostituisci con le tue chiavi Firebase se necessario
const firebaseConfig = {
  apiKey: "AIzaSyAjuupS2Wdfw5bwbrNTNYs6u4EvoTluVvU",
  authDomain: "fondo-classe-b5085.firebaseapp.com",
  projectId: "fondo-classe-b5085",
  storageBucket: "fondo-classe-b5085.firebasestorage.app",
  messagingSenderId: "610301786910",
  appId: "1:610301786910:web:eda577bf473ddd7da8270f",
  measurementId: "G-EN4W3ZZE9T"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const googleLoginBtn = document.getElementById('google-login-btn');
const googleBtnText = document.getElementById('google-btn-text');
const emailLoginForm = document.getElementById('email-login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const showRegisterBtn = document.getElementById('show-register');
const submitBtn = document.getElementById('submit-btn');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const switchText = document.getElementById('switch-text');

let isRegistering = false;

// Se l'utente è già loggato, va alla dashboard
onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "dashboard.html";
    }
});

// Switch dinamico tra modalità Accedi e Registrati
showRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    isRegistering = !isRegistering;
    
    if (isRegistering) {
        authTitle.textContent = "Crea Account 🚀";
        authSubtitle.textContent = "Unisciti per gestire il fondo classe";
        googleBtnText.textContent = "Registrati con Google";
        submitBtn.textContent = "Crea Account";
        switchText.textContent = "Hai già un account?";
        showRegisterBtn.textContent = "Accedi";
    } else {
        authTitle.textContent = "Fondo Classe 💰";
        authSubtitle.textContent = "Gestisci le finanze in modo trasparente";
        googleBtnText.textContent = "Accedi con Google";
        submitBtn.textContent = "Accedi";
        switchText.textContent = "Non hai un account?";
        showRegisterBtn.textContent = "Registrati";
    }
});

// Accesso/Registrazione con Google
googleLoginBtn.addEventListener('click', () => {
    signInWithPopup(auth, provider)
        .then(() => {
            window.location.href = "dashboard.html";
        })
        .catch((error) => {
            console.error("Errore Google Auth:", error);
            alert("Errore durante l'accesso con Google: " + error.message);
        });
});

// Accesso/Registrazione Email & Password
emailLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    if (isRegistering) {
        createUserWithEmailAndPassword(auth, email, password)
            .then(() => {
                window.location.href = "dashboard.html";
            })
            .catch((error) => alert("Errore registrazione: " + error.message));
    } else {
        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                window.location.href = "dashboard.html";
            })
            .catch((error) => alert("Errore accesso: Credenziali errate."));
    }
});
