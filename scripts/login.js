// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCzgrvaRodfuiY1pF6dveXiLDmI0St64qc",
    authDomain: "macondotest-904af.firebaseapp.com",
    projectId: "macondotest-904af",
    storageBucket: "macondotest-904af.appspot.com",
    messagingSenderId: "853635517373",
    appId: "1:853635517373:web:f5439d310e3e114ecba0d4"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Show specific view based on authentication status
function showGame() {
    window.location.href = "../gameplay/index.html";
}

// Login
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            console.log('User logged in: ', userCredential.user);
            showGame();
        })
        .catch((error) => {
            console.error('Error during login: ', error);
            alert('Invalid credentials. Please try again.');
        });
});

// Add 'Go to Signup' button functionality
document.getElementById('goToSignup').addEventListener('click', function() {
    window.location.href = "../signup/index.html";
});
