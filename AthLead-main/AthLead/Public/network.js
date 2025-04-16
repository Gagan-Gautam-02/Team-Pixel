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

auth.onAuthStateChanged((user) => {
    if (user) {
        const currentUserUid = user.uid;
        const followingListContainer = document.getElementById('following-list');
        const searchInput = document.getElementById('search-connections');

        const loadFollowers = (querySnapshot) => {
            followingListContainer.innerHTML = '';
            if (querySnapshot.empty) {
                followingListContainer.innerHTML = '<p>You are not following anyone yet.</p>';
            } else {
                querySnapshot.forEach((doc) => {
                    const followedUser = doc.data();
                    const userId = doc.id; // Assuming the doc ID corresponds to the user ID
                    followingListContainer.innerHTML += `
                        <div class="followed-user flex align-center">
                            <img src="${followedUser.profilePic}" alt="${followedUser.name} profile">
                            <p><strong><a href="profile.html?uid=${userId}" class="text-blue-500 hover:text-blue-700">${followedUser.name}</a></strong></p>
                        </div>
                    `;
                });
            }
        };

        const fetchFollowers = (searchQuery = null) => {
            let query = db.collection('users').doc(currentUserUid).collection('following');
            if (searchQuery) {
                query = query.where('name', '>=', searchQuery).where('name', '<=', searchQuery + '\uf8ff');
            }
            query.get().then(loadFollowers).catch((error) => {
                console.error('Error fetching following list:', error);
            });
        };

        fetchFollowers();

        searchInput.addEventListener('input', (event) => {
            fetchFollowers(event.target.value.trim());
        });

    } else {
        console.log('User not authenticated, redirecting to login.');
        window.location = 'login.html';
    }
});