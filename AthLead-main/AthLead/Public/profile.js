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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

auth.onAuthStateChanged((user) => {
    if (user) {
        const params = new URLSearchParams(window.location.search);
        const userId = params.get('uid'); // The UID of the profile being viewed
        const currentUserUid = user.uid; // Current logged-in user ID

        if (userId) {
            // Reference to the user's profile
            const userRef = db.collection('users').doc(userId);
            const followingRef = db.collection('users').doc(currentUserUid).collection('following').doc(userId);

            // Fetch profile information
            userRef.get().then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    document.getElementById('profile-details').innerHTML = `
                        <p>Name: ${userData.name}</p>
                        <p>Age: ${userData.age}</p>
                        <p>Email: ${userData.email}</p>
                        <p>Sports: ${userData.sports || 'Not specified'}</p>
                        <p>Experience: ${userData.experience ? userData.experience.replace(/\n/g, '<br>') : 'Not specified'}</p>
                        <p>Achievements: ${userData.achievements ? userData.achievements.replace(/\n/g, '<br>') : 'Not specified'}</p>
                        <button id="follow-button">Follow</button>
                        <p id="follow-status"></p>
                    `;

                    // Check if already following this user
                    followingRef.get().then((followDoc) => {
                        if (followDoc.exists) {
                            document.getElementById('follow-button').innerText = 'Unfollow';
                        }

                        // Add follow/unfollow functionality
                        document.getElementById('follow-button').addEventListener('click', () => {
                            followingRef.get().then((followDoc) => {
                                if (followDoc.exists) {
                                    followingRef.delete().then(() => {
                                        document.getElementById('follow-button').innerText = 'Follow';
                                        console.log(`Unfollowed ${userData.name}`);
                                    });
                                } else {
                                    followingRef.set({ name: userData.name }).then(() => {
                                        document.getElementById('follow-button').innerText = 'Unfollow';
                                        console.log(`Following ${userData.name}`);
                                    });
                                }
                            });
                        });
                    });
                } else {
                    console.error('No user profile found.');
                }
            }).catch((error) => {
                console.error('Error retrieving user profile:', error);
            });
        } else {
            console.warn('No user ID found in URL.');
        }
    } else {
        console.log('User not authenticated, redirecting to login.');
        window.location = 'login.html';
    }
});
