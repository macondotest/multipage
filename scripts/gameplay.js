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

const cardImages = [
    '../images/2_of_spades.png', '../images/3_of_spades.png', '../images/4_of_spades.png', '../images/5_of_spades.png', '../images/6_of_spades.png',
    '../images/7_of_spades.png', '../images/8_of_spades.png', '../images/9_of_spades.png', '../images/10_of_spades.png', '../images/jack_of_spades.png',
    '../images/queen_of_spades.png', '../images/king_of_spades.png', '../images/ace_of_spades.png', '../images/2_of_hearts.png', '../images/3_of_hearts.png',
    '../images/4_of_hearts.png', '../images/5_of_hearts.png', '../images/6_of_hearts.png', '../images/7_of_hearts.png', '../images/8_of_hearts.png',
    '../images/9_of_hearts.png', '../images/10_of_hearts.png', '../images/jack_of_hearts.png', '../images/queen_of_hearts.png', '../images/king_of_hearts.png',
    '../images/ace_of_hearts.png', '../images/2_of_diamonds.png', '../images/3_of_diamonds.png', '../images/4_of_diamonds.png', '../images/5_of_diamonds.png',
    '../images/6_of_diamonds.png', '../images/7_of_diamonds.png', '../images/8_of_diamonds.png', '../images/9_of_diamonds.png', '../images/10_of_diamonds.png',
    '../images/jack_of_diamonds.png', '../images/queen_of_diamonds.png', '../images/king_of_diamonds.png', '../images/ace_of_diamonds.png',
    '../images/2_of_clubs.png', '../images/3_of_clubs.png', '../images/4_of_clubs.png', '../images/5_of_clubs.png', '../images/6_of_clubs.png',
    '../images/7_of_clubs.png', '../images/8_of_clubs.png', '../images/9_of_clubs.png', '../images/10_of_clubs.png', '../images/jack_of_clubs.png',
    '../images/queen_of_clubs.png', '../images/king_of_clubs.png', '../images/ace_of_clubs.png'
];

// Authentication state observer
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        fetchUserData(user);
    } else {
        window.location.href = "../login/index.html";
    }
});

// Fetch user data
function fetchUserData(user) {
    console.log('Fetching user data for: ', user.uid);
    db.collection('users').doc(user.uid).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            document.getElementById('balance').textContent = data.balance;
            const withdrawDisabled = data.withdraw_balance || data.top_up_balance || data.balance === 0;
            const topUpDisabled = data.top_up_balance || data.withdraw_balance;
            document.getElementById('withdrawBalance').disabled = withdrawDisabled;
            document.getElementById('topUpBalance').disabled = topUpDisabled;
            document.querySelectorAll('.option button').forEach(button => {
                button.disabled = withdrawDisabled || topUpDisabled;
            });
            document.getElementById('withdrawBalance').classList.remove('hidden');
            document.getElementById('topUpBalance').classList.remove('hidden');
            document.getElementById('logout').classList.remove('hidden');
            if (data.bet) {
                document.getElementById('currentBet').textContent = data.bet;
            } else {
                document.getElementById('currentBet').textContent = 'No bet placed yet';
            }
            console.log('Current bet fetched:', data.bet);
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

// Withdraw balance
document.getElementById('withdrawBalance').addEventListener('click', function() {
    const user = firebase.auth().currentUser;
    if (user) {
        const balanceElement = document.getElementById('balance');
        const balance = parseInt(balanceElement.textContent, 10);
        db.collection('users').doc(user.uid).update({
            withdraw_balance: true,
            datetime_withdrawal_requested: new Date().toISOString(),
            balance_at_withdrawal_request: balance
        }).then(() => {
            document.getElementById('withdrawBalance').disabled = true;
            document.getElementById('topUpBalance').disabled = true;
            alert('Your request to withdraw balance has been registered and will be processed as soon as possible! Thank you!');
            document.querySelectorAll('.option button').forEach(button => {
                button.disabled = true;
            });
        }).catch((error) => {
            console.error("Error updating document: ", error);
        });
    }
});

// Top up balance
document.getElementById('topUpBalance').addEventListener('click', function() {
    const user = firebase.auth().currentUser;
    if (user) {
        const balanceElement = document.getElementById('balance');
        const balance = parseInt(balanceElement.textContent, 10);
        db.collection('users').doc(user.uid).update({
            top_up_balance: true,
            datetime_top_up_requested: new Date().toISOString(),
            balance_at_top_up_request: balance
        }).then(() => {
            document.getElementById('topUpBalance').disabled = true;
            document.getElementById('withdrawBalance').disabled = true;
            alert('Your request to top up your balance has been registered and you will soon receive an email with instructions on how to top up your balance!');
            document.querySelectorAll('.option button').forEach(button => {
                button.disabled = true;
            });
        }).catch((error) => {
            console.error("Error updating document: ", error);
        });
    }
});

// Log out
document.getElementById('logout').addEventListener('click', function() {
    firebase.auth().signOut().then(() => {
        showLogin();
    }).catch((error) => {
        console.error(error);
    });
});

// Game logic and UI updates
async function updateBalanceDisplay() {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            const doc = await db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                const data = doc.data();
                document.getElementById('balance').textContent = data.balance;
            }
        } catch (error) {
            console.log("Error getting document:", error);
        }
    }
}

function updateCurrentBetDisplay() {
    const user = firebase.auth().currentUser;
    if (user) {
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists) {
                const data = doc.data();
                if (data.bet) {
                    document.getElementById('currentBet').textContent = data.bet;
                } else {
                    document.getElementById('currentBet').textContent = 'No bet placed yet';
                }
                console.log('Current bet updated in display:', data.bet);
            }
        }).catch((error) => {
            console.log("Error getting document:", error);
        });
    }
}

async function updateBalanceInDB(newBalance) {
    const user = firebase.auth().currentUser;
    if (user) {
        try {
            await db.collection('users').doc(user.uid).update({ balance: newBalance });
            console.log('Balance updated in Firestore: ', newBalance);
        } catch (error) {
            console.error("Error updating balance in Firestore: ", error);
        }
    }
}

async function updateDrawnCardsInDB(drawnCards, selectedOption) {
    const user = firebase.auth().currentUser;
    if (user) {
         await db.collection('users').doc(user.uid).update({
            drawnCards: drawnCards,
            bet: selectedOption,
            datetime_bet: new Date().toISOString()
        }).then(() => {
            console.log('Drawn cards and bet updated in Firestore:', drawnCards, selectedOption);
        }).catch((error) => {
            console.error("Error updating drawn cards and bet in Firestore: ", error);
        });
    }
}

document.querySelectorAll('.option button').forEach(button => {
    button.addEventListener('click', async function() {
        const betType = this.getAttribute('data-bet-type');
        const exactType = this.getAttribute('data-exact-type');
        const optionElementId = betType + 'Options';
        const selectedOption = document.getElementById(optionElementId).value;
        const wagerAmount = parseInt(document.getElementById('wagerAmount').value, 10);
        if (isNaN(wagerAmount) || wagerAmount < 5) {
            alert('Invalid wager amount.');
            return;
        }

        // Fetch the latest balance from Firestore
        const user = firebase.auth().currentUser;
        if (!user) {
            alert('User not authenticated.');
            return;
        }

        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) {
            alert('User data not found.');
            return;
        }

        let currentBalance = userDoc.data().balance;
        if (wagerAmount > currentBalance) {
            alert('Insufficient balance.');
            return;
        }
        currentBalance -= wagerAmount;
        await updateBalanceInDB(currentBalance);
        await updateBalanceDisplay();

        // Draw cards and update Firestore
        const drawnCards = drawCards(4);
        if (!Array.isArray(drawnCards)) {
            console.error('drawnCards is not an array:', drawnCards);
            return;
        }
        displayDrawnCards(drawnCards);
        await updateDrawnCardsInDB(drawnCards, selectedOption);

        // Evaluate bet and update balance if won
        const { win, multiplier, winnings } = evaluateBet(betType, exactType, drawnCards, wagerAmount, selectedOption);
        setTimeout(async () => {
            if (win) {
            const winnings = wagerAmount * multiplier;
            currentBalance += winnings;
            await updateBalanceInDB(currentBalance);
            await updateBalanceDisplay();
            alert('Congrats! You guessed the cards! You have won ' + winnings.toFixed(1) + ' points!');
        } else {
            alert('Sorry, try again!');
        } updateCurrentBetDisplay();}, 3000 + (drawnCards.length - 1) * 500);
    });
});

// Helper functions for drawing cards and evaluating bets
function shuffleCards() {
    for (let i = cardImages.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cardImages[i], cardImages[j]] = [cardImages[j], cardImages[i]];
    }
}

function drawCards(num) {
    shuffleCards();
    const drawnCards = cardImages.slice(0, num); // Return the first 'num' cards from the shuffled deck
    console.log('Drawn cards:', drawnCards); // Add a console log for debugging
    return drawnCards;
}

function getCardNumericValue(card) {
    const cardValue = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
        'jack': 12, 'queen': 13, 'king': 14, 'ace': 15
    };
    const cardName = card.split('/').pop().split('_')[0]; // Extract card name from the path
    return cardValue[cardName];
}

    function getCardSuit(card) {
        return card.split('_')[2].replace('.png', '');
    }

function displayDrawnCards(drawnCards) {
    console.log('Displaying drawn cards:', drawnCards); // Debug log
    drawnCards.forEach((card, index) => {
        const cardSlot = document.getElementById(`card${index + 1}`);
        setTimeout(() => {
       // Remove any existing background image and trigger reflow to restart animation
        cardSlot.style.backgroundImage = '';
        cardSlot.classList.remove('flip');
  
        void cardSlot.offsetWidth; // Trigger reflow to restart animation
        
        // Add the flip class to start the animation
        cardSlot.classList.add('flip');
        
        // Set the background image after the animation duration (2s)
        setTimeout(() => {
            cardSlot.style.backgroundImage = `url(${card})`;
            cardSlot.classList.remove('flip');
        }, 2000);
            }, index * 500); 
    });
}

function evaluateBet(betType, exactType, drawnCards, wagerAmount, selectedOption) {
    switch (betType) {
        case 'sum':
            return handleSumBet(drawnCards, wagerAmount, selectedOption);
        case 'color':
            return handleColorBet(drawnCards, selectedOption);
        case 'macondo':
            return handleMacondoBet(drawnCards, selectedOption);
        case 'exact':
            return handleExactBet(drawnCards, exactType, wagerAmount);
            default:
            return { win: false, multiplier: 0, winnings: 0 };
    }
}
    function handleSumBet(drawnCards, wagerAmount, selectedOption) {
       const sumRanges = {
        '270725:8': {min: 8, max: 8},
        '3:9-29': {min: 9, max: 29},
        '3.1:30-36': {min: 30, max: 36},
        '2.9:37-59': {min: 37, max: 59},
        '270725:60': {min: 60, max: 60}
    };
        console.log('Selected option for sum bet:', selectedOption);
    if (!sumRanges[selectedOption]) {
        console.error('Invalid selected option:', selectedOption);
        return { win: false, multiplier: 0, winnings: 0 };
    }
    const {min, max} = sumRanges[selectedOption];
    const totalSum = drawnCards.reduce((acc, card) => acc + getCardNumericValue(card), 0);
    const multiplier = parseFloat(selectedOption.split(':')[0]);
    const win = totalSum >= min && totalSum <= max;
    return {win, multiplier, winnings: win ? wagerAmount * multiplier : 0};
    }
    // Placeholder for other handle functions
    function handleColorBet(drawnCards, selectedOption) {
        const betMultipliers = {
        '3black': 8.5,
        '3red': 8.5,
        '4black': 18.1,
        '4red': 18.1
    };
    const count = { 'black': 0, 'red': 0 };
    drawnCards.forEach(card => {
        const suit = getCardSuit(card);
        count[suit.includes('hearts') || suit.includes('diamonds') ? 'red' : 'black']++;
    });
    const [expectedCount, expectedColor] = selectedOption.split(':').pop().match(/(\d+)(black|red)/).slice(1);
    const win = count[expectedColor] === parseInt(expectedCount, 10);
    const multiplier = betMultipliers[`${expectedCount}${expectedColor}`];
    return { win, multiplier, winnings: win ? wagerAmount * multiplier : 0 };
    }
    function handleMacondoBet(drawnCards, selectedOption) {
       const categories = {
        'Low': [2, 3, 4, 5],
        'Mid': [6, 7, 8, 9],
        'High': [10, 12, 13, 14, 15]  // Including face cards as numeric values
    };
   const multiplierGroups = {
    19.4: [['High', 'High', 'High']],
    21.8: [['Low', 'High', 'High'], ['Mid', 'High', 'High'], ['High', 'Low', 'High'], ['High', 'Mid', 'High'], ['High', 'High', 'Low'], ['High', 'High', 'Mid']],
    25.9: [['Low', 'Mid', 'High'], ['Low', 'High', 'Mid'], ['Mid', 'Low', 'High'], ['Mid', 'High', 'Low'], ['High', 'Low', 'Mid'], ['High', 'Mid', 'Low']],
    27.6: [['Low', 'Low', 'High'], ['Low', 'High', 'Low'], ['Mid', 'Mid', 'High'], ['Mid', 'High', 'Mid'], ['High', 'Low', 'Low'], ['High', 'Mid', 'Mid']],
    34.5: [['Low', 'Low', 'Mid'], ['Low', 'Mid', 'Low'], ['Low', 'Mid', 'Mid'], ['Mid', 'Low', 'Low'], ['Mid', 'Low', 'Mid'], ['Mid', 'Mid', 'Low']],
    39.5: [['Low', 'Low', 'Low'], ['Mid', 'Mid', 'Mid']],
    55.9: [['High', 'High', 'High', 'High']],
    59.4: [['Low', 'High', 'High', 'High'], ['Mid', 'High', 'High', 'High'], ['High', 'Low', 'High', 'High'], ['High', 'Mid', 'High', 'High'], ['High', 'High', 'Low', 'High'], ['High', 'High', 'Mid', 'High'], ['High', 'High', 'High', 'Low'], ['High', 'High', 'High', 'Mid']],
    66.8: [['Low', 'Mid', 'High', 'High'], ['Low', 'High', 'Mid', 'High'], ['Low', 'High', 'High', 'Mid'], ['Mid', 'Low', 'High', 'High'], ['Mid', 'High', 'Low', 'High'], ['Mid', 'High', 'High', 'Low'], ['High', 'Low', 'Mid', 'High'], ['High', 'Low', 'High', 'Mid'], ['High', 'Mid', 'Low', 'High'], ['High', 'Mid', 'High', 'Low'], ['High', 'High', 'Low', 'Mid'], ['High', 'High', 'Mid', 'Low']],
    71.2: [['Low', 'Low', 'High', 'High'], ['Low', 'High', 'Low', 'High'], ['Low', 'High', 'High', 'Low'], ['Mid', 'Mid', 'High', 'High'], ['Mid', 'High', 'Mid', 'High'], ['Mid', 'High', 'High', 'Mid'], ['High', 'Low', 'Low', 'High'], ['High', 'Low', 'High', 'Low'], ['High', 'Mid', 'Mid', 'High'], ['High', 'Mid', 'High', 'Mid'], ['High', 'High', 'Low', 'Low'], ['High', 'High', 'Mid', 'Mid']],
    84.6: [['Low', 'Low', 'Mid', 'High'], ['Low', 'Low', 'High', 'Mid'], ['Low', 'Mid', 'Low', 'High'], ['Low', 'Mid', 'Mid', 'High'], ['Low', 'Mid', 'High', 'Low'], ['Low', 'Mid', 'High', 'Mid'], ['Low', 'High', 'Low', 'Mid'], ['Low', 'High', 'Mid', 'Low'], ['Low', 'High', 'Mid', 'Mid'], ['Mid', 'Low', 'Low', 'High'], ['Mid', 'Low', 'Mid', 'High'], ['Mid', 'Low', 'High', 'Low'], ['Mid', 'Low', 'High', 'Mid'], ['Mid', 'Mid', 'Low', 'High'], ['Mid', 'Mid', 'High', 'Low'], ['Mid', 'High', 'Low', 'Low'], ['Mid', 'High', 'Low', 'Mid'], ['Mid', 'High', 'Mid', 'Low'], ['High', 'Low', 'Low', 'Mid'], ['High', 'Low', 'Mid', 'Low'], ['High', 'Low', 'Mid', 'Mid'], ['High', 'Mid', 'Low', 'Low'], ['High', 'Mid', 'Low', 'Mid'], ['High', 'Mid', 'Mid', 'Low']],
    96.7: [['Low', 'Low', 'Low', 'High'], ['Low', 'Low', 'High', 'Low'], ['Low', 'High', 'Low', 'Low'], ['Mid', 'Mid', 'Mid', 'High'], ['Mid', 'Mid', 'High', 'Mid'], ['Mid', 'High', 'Mid', 'Mid'], ['High', 'Low', 'Low', 'Low'], ['High', 'Mid', 'Mid', 'Mid']],
    112.8: [['Low', 'Low', 'Mid', 'Mid'], ['Low', 'Mid', 'Low', 'Mid'], ['Low', 'Mid', 'Mid', 'Low'], ['Mid', 'Low', 'Low', 'Mid'], ['Mid', 'Low', 'Mid', 'Low'], ['Mid', 'Mid', 'Low', 'Low']],
    120.9: [['Low', 'Low', 'Low', 'Mid'], ['Low', 'Low', 'Mid', 'Low'], ['Low', 'Mid', 'Low', 'Low'], ['Low', 'Mid', 'Mid', 'Mid'], ['Mid', 'Low', 'Low', 'Low'], ['Mid', 'Low', 'Mid', 'Mid'], ['Mid', 'Mid', 'Low', 'Mid'], ['Mid', 'Mid', 'Mid', 'Low']],
    148.7: [['Low', 'Low', 'Low', 'Low'], ['Mid', 'Mid', 'Mid', 'Mid']],
};
        console.log('Selected option for macondo bet:', selectedOption);
    if (!selectedOption) {
        console.error('Invalid selected option:', selectedOption);
        return { win: false, multiplier: 0, winnings: 0 };
    }
    const sequence = selectedOption.split(':')[1].split(',');
    let win = sequence.every((category, index) => categories[category].includes(getCardNumericValue(drawnCards[index])));
    let multiplier = parseFloat(selectedOption.split(':')[0]);
    return { win, multiplier, winnings: win ? wagerAmount * multiplier : 0 };
    }
    function handleExactBet(drawnCards, exactType, wagerAmount) {
         const exactBetMultipliers = {
        '3random': 22100,
        '3exact': 132600,
        '4random': 270725,
        '4exact': 6497400
    };
    const selectedCards = [
        document.getElementById('card1Picker').value,
        document.getElementById('card2Picker').value,
        document.getElementById('card3Picker').value,
        document.getElementById('card4Picker').value
    ];
    let win = exactType.includes('exact') ? drawnCards.every((card, index) => card === selectedCards[index]) :
        selectedCards.every(card => drawnCards.includes(card)) && drawnCards.every(card => selectedCards.includes(card));
    const multiplier = exactBetMultipliers[exactType];
    return {win, multiplier};
    }
    document.getElementById('reshuffle').addEventListener('click', function() {
        shuffleCards();
        document.querySelectorAll('.card-slot').forEach(slot => {
            slot.style.backgroundImage = '';
            slot.textContent = '';
        });
        document.getElementById('currentBet').textContent = '';
        alert('Deck reshuffled!');
    });
