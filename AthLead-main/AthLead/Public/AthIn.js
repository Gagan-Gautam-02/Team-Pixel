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
        console.log('User is logged in:', user.uid);

        const togglePostButton = document.getElementById('toggle-post');
        const postSection = document.querySelector('.new-post');

        togglePostButton.addEventListener('click', () => {
            postSection.classList.toggle('hidden');
        });

        setupPostSubmission(user);
        loadFeed(user);
        setupSearch();

    } else {
        console.log('User not authenticated, redirecting to login.');
        window.location = 'login.html';
    }
});

function setupPostSubmission(user) {
    const submitPostButton = document.getElementById('submit-post');
    const postContent = document.getElementById('post-content');

    submitPostButton.addEventListener('click', () => {
        const content = postContent.value.trim();
        if (content) {
            db.collection('posts').add({
                content: content,
                author: user.uid,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                likes: 0,
                comments: []
            }).then(() => {
                console.log('Post added!');
                postContent.value = '';  // Clear the textarea
                loadFeed(user);
            }).catch(error => {
                console.error('Error adding post:', error);
            });
        }
    });
}

function loadFeed(user) {
    const feedContent = document.getElementById('feed-content');
    db.collection('posts')
        .orderBy('timestamp', 'desc')
        .get()
        .then(snapshot => {
            feedContent.innerHTML = ''; // Clear previous feed
            snapshot.forEach(doc => {
                const postData = doc.data();
                const postId = doc.id;
                const userRef = db.collection('users').doc(postData.author);

                userRef.get().then(userDoc => {
                    if (userDoc.exists) {
                        const userName = userDoc.data().name;
                        const userId = userDoc.id;
                        feedContent.innerHTML += `
                            <div class="post-item">
                                <img src="usericon.png" class="profilepic">
                                <p class="UserName"><strong><a href="profile.html?uid=${userId}">${userName}</a></strong></p>
                            <br><p>${postData.content}</p><br>
                                <small>${new Date(postData.timestamp.seconds * 1000).toLocaleString()}</small>
                                <div>
                                    <button onclick="likePost('${postId}')">Like (${postData.likes || 0})</button>
                                    <button onclick="toggleComment('${postId}')">Comment</button>
                                </div>
                                <div id="comments-${postId}" class="hidden">
                                    <input type="text" id="comment-input-${postId}" placeholder="Write a comment..." class="w-full p-2 border rounded mb-2">
                                    <button onclick="submitComment('${postId}', '${user.uid}')">Submit</button>
                                    <div id="comment-list-${postId}"></div>
                                </div>
                            </div>
                        `;
                        loadComments(postId);
                    } else {
                        console.error('No user data found for this post ID:', postId);
                    }
                }).catch(error => {
                    console.error('Error fetching user data:', error);
                });
            });
        })
        .catch(error => {
            console.error('Error loading feed:', error);
        });
}

function likePost(postId) {
    const postRef = db.collection('posts').doc(postId);
    postRef.update({
        likes: firebase.firestore.FieldValue.increment(1)
    }).then(() => {
        console.log('Post liked!');
        loadFeed(auth.currentUser);
    }).catch(error => {
        console.error('Error liking post:', error);
    });
}

function toggleComment(postId) {
    const commentsSection = document.getElementById(`comments-${postId}`);
    commentsSection.classList.toggle('hidden');
}

function submitComment(postId, userId) {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    const commentContent = commentInput.value.trim();
    if (commentContent) {
        const postRef = db.collection('posts').doc(postId);
        postRef.update({
            comments: firebase.firestore.FieldValue.arrayUnion({
                content: commentContent,
                author: userId,
                timestamp: Date.now()
            })
        }).then(() => {
            console.log('Comment added!');
            commentInput.value = '';  // Clear the comment input
            loadComments(postId);
        }).catch(error => {
            console.error('Error adding comment:', error);
        });
    }
}

function loadComments(postId) {
    const postRef = db.collection('posts').doc(postId);
    postRef.get().then(doc => {
        if (doc.exists) {
            const commentsList = doc.data().comments || [];
            const commentsContainer = document.getElementById(`comment-list-${postId}`);
            commentsContainer.innerHTML = '';  // Clear existing comments
            commentsList.forEach(comment => {
                const authorRef = db.collection('users').doc(comment.author);
                authorRef.get().then(authorDoc => {
                    if (authorDoc.exists) {
                        const authorName = authorDoc.data().name;
                        commentsContainer.innerHTML += `
                            <div class="comment-item">
                                <p><strong>${authorName}</strong>: ${comment.content}</p>
                                <p><small>${new Date(comment.timestamp).toLocaleString()}</small></p>
                            </div>
                        `;
                    }
                }).catch(error => {
                    console.error('Error fetching comment author data:', error);
                });
            });
        }
    }).catch(error => {
        console.error('Error loading comments:', error);
    });
}

function setupSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.querySelector('.search-results');

    if (searchForm && searchInput && resultsContainer) {
        searchForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const queryText = searchInput.value.trim();

            if (queryText) {
                const athletesRef = db.collection('users');
                athletesRef
                    .where('name', '>=', queryText)
                    .where('name', '<=', queryText + '\uf8ff')
                    .get()
                    .then(snapshot => {
                        resultsContainer.innerHTML = '';  // Clear previous results
                        if (snapshot.empty) {
                            resultsContainer.innerHTML = '<p>No athletes found.</p>';
                        } else {
                            snapshot.forEach(doc => {
                                const athleteData = doc.data();
                                resultsContainer.innerHTML += `
                                    <div class="athlete">
                                        <p><strong>${athleteData.name}</strong></p>
                                        <p>${athleteData.age} years old</p>
                                        <p>${athleteData.email}</p>
                                    </div>
                                `;
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error fetching athletes:', error);
                    });
            } else {
                resultsContainer.innerHTML = '<p>Please enter a search term.</p>';
            }
        });
    }
}