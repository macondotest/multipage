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
function showLogin() {
    window.location.href = "../login/index.html";
}

// Sign up
document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            db.collection('users').doc(user.uid).set({
                email: user.email,
                balance: 0, // Initial balance
                withdraw_balance: false,
                top_up_balance: false,
                datetime_withdrawal_requested: null,
                balance_at_withdrawal_request: null
            });
            showLogin();
        })
        .catch((error) => {
            console.error(error);
        });
});
