const firebaseConfig = {
    apiKey: "AIzaSyB8NYQSC8QMM9AKM0m3bofLNICw00RsPv0",
    authDomain: "athlead-9e4d0.firebaseapp.com",
    databaseURL: "https://athlead-9e4d0-default-rtdb.firebaseio.com",
    projectId: "athlead-9e4d0",
    storageBucket: "athlead-9e4d0.firebasestorage.app",
    messagingSenderId: "548897577535",
    appId: "1:548897577535:web:941f9b17f3083f6677f68a",
    measurementId: "G-J1DWWFBM16"
  };
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Signup function
if (document.getElementById('signup-form')) {
    const signupForm = document.getElementById('signup-form');
    signupForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const name = signupForm['name'].value;
        const age = signupForm['age'].value;
        const email = signupForm['email'].value;
        const password = signupForm['password'].value;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                return db.collection('users').doc(userCredential.user.uid).set({
                    name: name,
                    age: age,
                    email: email
                });
            })
            .then(() => {
                console.log('User signed up and data stored!');
                window.location = 'AthIn.html'; // Redirect to homepage
            })
            .catch((error) => {
                console.error('Error signing up:', error);
            });
    });
}

// Login function
if (document.getElementById('login-form')) {
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = loginForm['login-email'].value;
        const password = loginForm['login-password'].value;

        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                console.log('User logged in!');
                window.location = 'AthIn.html';  // Redirect to homepage
            })
            .catch((error) => {
                console.error('Error logging in:', error);
            });
    });
}