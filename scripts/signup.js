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

// Redirect to gameplay page
function redirectToGameplay() {
    window.location.href = "../gameplay/index.html";
}

// Show specific view based on authentication status
function showLogin() {
    window.location.href = "../login/index.html";
}

// Sign up
document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    // Check if the user is already signed up
    firebase.auth().fetchSignInMethodsForEmail(email)
        .then((methods) => {
            if (methods.length > 0) {
                // User is already signed up
                alert('You are already signed up. Please log in.');
            } else {
                // Create new user
                firebase.auth().createUserWithEmailAndPassword(email, password)
                    .then((userCredential) => {
                        const user = userCredential.user;
                        console.log('User signed up: ', user);
                        // Create a Firestore document for the new user
                        db.collection('users').doc(user.uid).set({
                            email: user.email,
                            balance: 0, // Initial balance
                            withdraw_balance: false,
                            top_up_balance: false,
                            datetime_withdrawal_requested: null,
                            balance_at_withdrawal_request: null
                        })
                        .then(() => {
                            console.log('User document created in Firestore');
                            redirectToGameplay();
                        })
                        .catch((error) => {
                            console.error('Error creating user document: ', error);
                        });
                    })
                    .catch((error) => {
                        console.error('Error during sign up: ', error);
                    });
            }
        })
        .catch((error) => {
            console.error('Error checking sign in methods: ', error);
        });
});

// Add 'Go to Login' button functionality
document.getElementById('goToLogin').addEventListener('click', function() {
    showLogin();
});

