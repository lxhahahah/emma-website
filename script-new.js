// Firebase REST API functions are defined in firebase-rest.js
// Just ensure they exist before using

// Blog data - stored locally, can be synced with Firebase
let blogPosts = [
    {
        id: 1,
        title: '我的第一篇博客',
        date: '2024-04-17 10:30:00',
        emoji: '📱',
        excerpt: '分享我开始写博客的初心和感受',
        content: '这是我的第一篇博客文章，很高兴在这里和你们分享我的想法和故事...',
        tags: ['博客', '分享'],
        category: 'thoughts'
    },
    {
        id: 2,
        title: 'Web 开发入门指南',
        date: '2024-04-10 14:15:00',
        emoji: '🚀',
        excerpt: '从零开始学习 Web 开发的经验分享',
        content: 'Web 开发是一个有趣且充满挑战的领域。在这篇文章中，我将分享我的学习经验...',
        tags: ['技术', '学习'],
        category: 'tech'
    },
    {
        id: 3,
        title: '设计思路分享',
        date: '2024-04-03 09:45:00',
        emoji: '🎨',
        excerpt: '个人主页的设计灵感和实现过程',
        content: '在设计这个个人主页时，我考虑了很多因素。首先是用户体验...',
        tags: ['设计'],
        category: 'thoughts'
    }
];

let currentArticleId = null;
let filteredPosts = [];
let selectedTag = '';

// ========== TIMESTAMP FUNCTIONS ==========
function getFullTimestamp() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function formatDateWithTime(dateTimeString) {
    return dateTimeString;
}

// ========== MODAL FUNCTIONS ==========
function openWriteArticleModal() {
    document.getElementById('writeArticleModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeWriteArticleModal() {
    document.getElementById('writeArticleModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('writeForm').reset();
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    const modal = document.getElementById('writeArticleModal');
    if (event.target === modal) {
        closeWriteArticleModal();
    }
});

// ========== FORM SUBMISSION ==========
function submitBlogPost() {
    const title = document.getElementById('postTitle').value;
    const emoji = document.getElementById('postEmoji').value || '📝';
    const content = document.getElementById('postContent').value;
    const excerpt = document.getElementById('postExcerpt').value;
    const tagsInput = document.getElementById('postTags').value;
    const category = document.getElementById('postCategory').value || 'thoughts';
    
    if (!title || !content) {
        alert('Please fill in title and content');
        return;
    }
    
    const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    
    const newPost = {
        id: Date.now(),
        title: title,
        date: getFullTimestamp(),
        emoji: emoji,
        excerpt: excerpt || content.substring(0, 100),
        content: content,
        tags: tags,
        category: category
    };
    
    // Save to Firebase if available
    if (window.firebaseRestReady) {
        saveBlogPostToFirebase(newPost);
    } else {
        saveBlogPostLocally(newPost);
    }
    
    // Add to blog posts array
    blogPosts.unshift(newPost);
    saveBlogPostsLocally();
    applyFilters();
    generateWordCloud();
    
    // Reset form and show success modal
    document.getElementById('writeForm').reset();
    closeWriteArticleModal();
    showPublishSuccessModal(newPost.title);
}

// ========== ARTICLE DISPLAY ==========
function showArticleDetail(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    currentArticleId = postId;
    
    document.getElementById('articleTitle').textContent = post.title;
    document.getElementById('articleDate').textContent = formatDateWithTime(post.date);
    document.getElementById('articleContent').innerHTML = formatContent(post.content);
    
    // Render tags
    const tagsHtml = (post.tags || []).map(tag => 
        `<span class="article-tag">#${tag}</span>`
    ).join('');
    document.getElementById('articleTags').innerHTML = tagsHtml;
    
    showSection('article-detail');
    window.location.hash = `post-${postId}`;
}

function goBackToBlog() {
    showSection('blog');
}

// ========== KEYWORD EXTRACTION ==========
function generateWordCloud() {
    if (blogPosts.length === 0) {
        document.getElementById('wordCloud').innerHTML = '<p>No keywords yet</p>';
        return;
    }

    // Combine all article content
    const allContent = blogPosts.map(post => 
        (post.title + ' ' + post.content + ' ' + (post.excerpt || '')).toLowerCase()
    ).join(' ');

    // Common stop words
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'is', 'am', 'are', 'was', 'were',
        'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
        'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that',
        'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what',
        'which', 'who', 'when', 'where', 'why', 'how', 'in', 'on', 'at', 'to',
        'for', 'of', 'with', 'from', 'by', 'as', 'about', 'into', 'through',
        'my', 'me', 'your', 'him', 'her', 'its', 'their', 'de', 'la', 'el',
        '的', '是', '在', '了', '有', '和', '人', '这', '对', '很', '也', '都',
        '一', '个', '到', '说', '里', '就', '等'
    ]);

    // Extract words (Chinese + English)
    const words = allContent.match(/[\u4e00-\u9fa5]+|[a-z]+/gi) || [];
    
    // Count frequency
    const frequency = {};
    words.forEach(word => {
        if (!stopWords.has(word.toLowerCase()) && word.length > 1) {
            frequency[word] = (frequency[word] || 0) + 1;
        }
    });

    // Get top words
    const topWords = Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([word, count]) => ({ word, count }));

    if (topWords.length === 0) {
        document.getElementById('wordCloud').innerHTML = '<p>No keywords</p>';
        return;
    }

    // Find min and max for sizing
    const counts = topWords.map(w => w.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    const range = maxCount - minCount || 1;

    // Generate cloud HTML
    const cloudHTML = topWords.map(({ word, count }) => {
        const size = ((count - minCount) / range * 30) + 12;
        const opacity = ((count - minCount) / range * 0.5) + 0.5;
        return `<span style="font-size: ${size}px; opacity: ${opacity}; margin: 5px; cursor: pointer;" onclick="filterByKeyword('${word}')">${word}</span>`;
    }).join('');

    document.getElementById('wordCloud').innerHTML = cloudHTML;
}

// ========== FILTERING & SORTING ==========
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortOrder = document.getElementById('sortSelect').value;
    const selectedCategory = document.getElementById('categorySelect').value;

    // Filter posts
    filteredPosts = blogPosts.filter(post => {
        const matchesSearch = !searchTerm || 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm);
        
        const matchesCategory = !selectedCategory || post.category === selectedCategory;
        
        const matchesTag = !selectedTag || 
            (post.tags && post.tags.some(tag => tag === selectedTag));

        return matchesSearch && matchesCategory && matchesTag;
    });

    // Sort posts
    if (sortOrder === 'oldest') {
        filteredPosts.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else {
        filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    renderArticlesList();
}

function filterByKeyword(keyword) {
    // Filter articles containing this keyword
    const filtered = blogPosts.filter(post => 
        post.title.toLowerCase().includes(keyword.toLowerCase()) ||
        post.content.toLowerCase().includes(keyword.toLowerCase())
    );
    
    filteredPosts = filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderArticlesList();
}

function renderArticlesList() {
    const container = document.getElementById('articlesList');
    const empty = document.getElementById('blogEmpty');

    if (filteredPosts.length === 0) {
        container.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    
    container.innerHTML = filteredPosts.map(post => `
        <div class="article-list-item" onclick="showArticleDetail(${post.id})">
            <div class="article-item-header">
                <h3>${post.emoji || '📝'} ${post.title}</h3>
                <span class="article-item-date">${formatDateWithTime(post.date)}</span>
            </div>
            <div class="article-item-meta">
                <span class="article-item-category">${getCategoryLabel(post.category)}</span>
                ${(post.tags || []).map(tag => `<span class="article-item-tag">#${tag}</span>`).join('')}
            </div>
            <div class="article-item-excerpt">${post.excerpt || post.content.substring(0, 120)}...</div>
        </div>
    `).join('');
}

function getCategoryLabel(category) {
    const labels = {
        'learning': '📚 Learning',
        'life': '🌟 Life',
        'tech': '💻 Tech',
        'thoughts': '💭 Thoughts',
        'travel': '✈️ Travel'
    };
    return labels[category] || 'Other';
}

// ========== LOCALSTORAGE ==========
function saveBlogPostLocally(post) {
    saveBlogPostsLocally();
}

function saveBlogPostsLocally() {
    try {
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts.slice(0, 100)));
    } catch (e) {
        console.error('Failed to save to localStorage:', e);
    }
}

// ========== SUCCESS MODAL ==========
function showPublishSuccessModal(title) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        max-width: 400px;
        animation: slideUp 0.3s ease;
    `;
    
    content.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
        <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">Published Successfully!</h2>
        <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">Article published to blog</p>
        <p style="margin: 0 0 30px 0; color: #999; font-size: 13px; word-break: break-word;">《${title}》</p>
        <button onclick="this.closest('[role=dialog]').remove()" style="
            padding: 12px 30px;
            background: linear-gradient(135deg, #E8A0C1, #FFB6D9);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            View Blog
        </button>
    `;
    
    content.setAttribute('role', 'dialog');
    modal.appendChild(content);
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }, 4000);
}

// ========== PAGE NAVIGATION ==========
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function formatContent(text) {
    return text.replace(/\n/g, '<br>');
}

// ========== INITIALIZATION ==========
function setupWriteForm() {
    const form = document.getElementById('writeForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            submitBlogPost();
        });
    }
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
}

function loadBlogPosts() {
    if (window.firebaseRestReady) {
        try {
            const firebasePosts = window.loadBlogPostsFromFirebase && window.loadBlogPostsFromFirebase();
            if (firebasePosts && firebasePosts.length > 0) {
                blogPosts = firebasePosts;
                applyFilters();
                return;
            }
        } catch (error) {
            console.error('Failed to load from Firebase, using localStorage:', error);
        }
    }
    
    const saved = localStorage.getItem('blogPosts');
    if (saved) {
        try {
            const localPosts = JSON.parse(saved);
            blogPosts = [...localPosts, ...blogPosts];
            applyFilters();
        } catch (e) {
            console.error('Failed to load localStorage:', e);
        }
    } else {
        applyFilters();
    }
}

// Initial setup
document.addEventListener('DOMContentLoaded', function() {
    setupWriteForm();
    setupFilters();
    loadBlogPosts();
    generateWordCloud();
});

// Hash-based routing
function handleHashChange() {
    const hash = window.location.hash.substring(1);
    if (hash.startsWith('post-')) {
        const postId = parseInt(hash.substring(5));
        showArticleDetail(postId);
    } else {
        const sectionId = hash || 'home';
        if (document.getElementById(sectionId)) {
            showSection(sectionId);
        }
    }
}

window.addEventListener('hashchange', handleHashChange);
window.addEventListener('load', handleHashChange);
