// Firebase REST API Configuration (No SDK needed!)
const FIREBASE_PROJECT_ID = "emma-home-debc4";
const FIREBASE_DATABASE_URL = `https://${FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`;

// Save article to Firebase
async function saveBlogPostToFirebase(article) {
    try {
        const response = await fetch(`${FIREBASE_DATABASE_URL}/posts/${article.id}.json`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(article)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('✅ 文章已保存到 Firebase:', article.id);
        return true;
    } catch (error) {
        console.error('❌ 保存到 Firebase 失败:', error);
        return false;
    }
}

// Load all articles from Firebase
async function loadBlogPostsFromFirebase() {
    try {
        const response = await fetch(`${FIREBASE_DATABASE_URL}/posts.json`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data) {
            console.log('Firebase 数据库为空');
            return [];
        }

        // Convert Firebase object to array
        const posts = Object.values(data).sort((a, b) => new Date(b.date) - new Date(a.date));
        console.log('✅ 从 Firebase 加载文章:', posts.length, '篇');
        return posts;
    } catch (error) {
        console.error('❌ 从 Firebase 加载失败:', error);
        return [];
    }
}

// Delete article from Firebase
async function deleteArticleFromFirebase(articleId) {
    try {
        const response = await fetch(`${FIREBASE_DATABASE_URL}/posts/${articleId}.json`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('✅ 文章已从 Firebase 删除:', articleId);
        return true;
    } catch (error) {
        console.error('❌ 从 Firebase 删除失败:', error);
        return false;
    }
}

console.log('✅ Firebase REST API 加载成功 - 无需 SDK!');
window.firebaseRestReady = true;
