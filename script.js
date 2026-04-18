// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAWZ0RbDjd6ZKPPVIcmbYYQbAGgqIddC9o",
    authDomain: "emma-home-debc4.firebaseapp.com",
    projectId: "emma-home-debc4",
    storageBucket: "emma-home-debc4.firebasestorage.app",
    messagingSenderId: "136720026127",
    appId: "1:136720026127:web:aa51fc64d6d023569a317a",
    measurementId: "G-VYSJV2RGJN"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    window.database = firebase.database();
    window.firebaseEnabled = true;
    console.log('✅ Firebase 初始化成功');
} catch (error) {
    console.warn('⚠️ Firebase 初始化失败:', error);
    window.firebaseEnabled = false;
}

// Blog data - stored locally, can be synced with Firebase
let blogPosts = [
    {
        id: 1,
        title: '我的第一篇博客',
        date: '2024-04-17',
        emoji: '📱',
        excerpt: '分享我开始写博客的初心和感受',
        content: '这是我的第一篇博客文章，很高兴在这里和你们分享我的想法和故事...',
        tags: ['博客', '分享'],
        category: 'thoughts'
    },
    {
        id: 2,
        title: 'Web 开发入门指南',
        date: '2024-04-10',
        emoji: '🚀',
        excerpt: '从零开始学习 Web 开发的经验分享',
        content: 'Web 开发是一个有趣且充满挑战的领域。在这篇文章中，我将分享我的学习经验...',
        tags: ['技术', '学习'],
        category: 'tech'
    },
    {
        id: 3,
        title: '设计思路分享',
        date: '2024-04-03',
        emoji: '🎨',
        excerpt: '个人主页的设计灵感和实现过程',
        content: '创建这个个人主页时，我想要一个简约可爱的设计。让我分享一下我的设计思路...',
        tags: ['设计', '创意'],
        category: 'tech'
    }
];

let currentArticleId = null;
let activeTag = null;

const categoryMap = {
    'learning': '📚 学习',
    'life': '🌟 生活',
    'tech': '💻 技术',
    'thoughts': '💭 思考',
    'travel': '✈️ 旅行'
};

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    setupWriteForm();
    loadBlogPosts();
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
});

// Handle hash-based routing
function handleHashChange() {
    const hash = window.location.hash.substring(1); // Remove the '#' prefix
    
    if (hash.startsWith('post-')) {
        const postId = parseInt(hash.replace('post-', ''));
        showArticleDetail(postId);
    } else if (hash) {
        // If hash exists but is not a post, try to show that section
        showSectionWithoutHash(hash);
    } else {
        // No hash, show home
        showSectionWithoutHash('home');
    }
}

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionId = this.getAttribute('data-section');
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active to current link
            this.classList.add('active');
            
            // Show the section
            showSection(sectionId);
        });
    });
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation active state
    if (sectionId !== 'article-detail') {
        const navLink = document.querySelector(`[data-section="${sectionId}"]`);
        if (navLink) {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            navLink.classList.add('active');
        }
    }
    
    window.location.hash = sectionId;
    
    if (sectionId === 'blog') {
        renderBlogPosts();
        generateWordCloud();
        generateTags();
    }
}

// Show section without changing hash (used by handleHashChange)
function showSectionWithoutHash(sectionId) {
    const sections = document.querySelectorAll('.section');
    
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update navigation active state
    const navLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (navLink) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        navLink.classList.add('active');
    }
    
    if (sectionId === 'blog') {
        renderBlogPosts();
        generateWordCloud();
        generateTags();
    }
}

function scrollToSection(sectionId) {
    const navLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (navLink) {
        navLink.click();
    }
    
    setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }, 100);
}

// Article Detail Page
function showArticleDetail(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (!post) return;
    
    currentArticleId = postId;
    
    document.getElementById('articleTitle').textContent = post.title;
    document.getElementById('articleDate').textContent = formatDate(post.date);
    document.getElementById('articleContent').innerHTML = formatContent(post.content);
    
    // Render tags
    const tagsHtml = post.tags.map(tag => 
        `<span class="article-tag">#${tag}</span>`
    ).join('');
    document.getElementById('articleTags').innerHTML = tagsHtml;
    
    showSection('article-detail');
    window.location.hash = `post-${postId}`;
}

function goBackToBlog() {
    showSection('blog');
}

function formatContent(content) {
    return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .map(line => `<p>${line}</p>`)
        .join('');
}

// Render blog posts with filters
function renderBlogPosts() {
    const blogGrid = document.getElementById('blogGrid');
    const blogEmpty = document.getElementById('blogEmpty');
    const searchInput = document.getElementById('searchInput');
    
    if (!blogGrid) return;
    
    let filteredPosts = blogPosts;
    
    // Apply search filter
    if (searchInput && searchInput.value) {
        const query = searchInput.value.toLowerCase();
        filteredPosts = filteredPosts.filter(post =>
            post.title.toLowerCase().includes(query) ||
            post.content.toLowerCase().includes(query) ||
            post.tags.some(tag => tag.toLowerCase().includes(query))
        );
    }
    
    // Apply tag filter
    if (activeTag) {
        filteredPosts = filteredPosts.filter(post =>
            post.tags.includes(activeTag)
        );
    }
    
    if (filteredPosts.length === 0) {
        blogGrid.style.display = 'none';
        if (blogEmpty) blogEmpty.style.display = 'block';
        return;
    }
    
    blogGrid.style.display = 'grid';
    if (blogEmpty) blogEmpty.style.display = 'none';
    
    blogGrid.innerHTML = filteredPosts.map(post => `
        <div class="blog-card" onclick="showArticleDetail(${post.id})">
            <div class="blog-card-header">${post.emoji}</div>
            <div class="blog-card-content">
                <div class="blog-card-title">${post.title}</div>
                <div class="blog-card-meta">
                    <span class="blog-card-date">${formatDate(post.date)}</span>
                    <span class="blog-card-category">${categoryMap[post.category] || '其他'}</span>
                </div>
                <div class="blog-card-tags">
                    ${post.tags.map(tag => `<span class="blog-card-tag">#${tag}</span>`).join('')}
                </div>
                <div class="blog-card-excerpt">${post.excerpt || post.content.substring(0, 80)}</div>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('zh-CN', options);
}

// Generate tags filter
function generateTags() {
    const tagsContainer = document.getElementById('tagsContainer');
    if (!tagsContainer) return;
    
    const allTags = new Set();
    blogPosts.forEach(post => {
        post.tags.forEach(tag => allTags.add(tag));
    });
    
    tagsContainer.innerHTML = Array.from(allTags).map(tag => `
        <button class="tag-button ${activeTag === tag ? 'active' : ''}" 
                onclick="filterByTag('${tag}')">
            #${tag}
        </button>
    `).join('');
}

function filterByTag(tag) {
    activeTag = activeTag === tag ? null : tag;
    generateTags();
    renderBlogPosts();
}

// Generate word cloud
function generateWordCloud() {
    const wordCloud = document.getElementById('wordCloud');
    if (!wordCloud) return;
    
    const wordFreq = analyzeKeywords();
    if (Object.keys(wordFreq).length === 0) {
        wordCloud.innerHTML = '<p style="color: var(--light-text);">还没有足够的内容生成关键词云...</p>';
        return;
    }
    
    // Get top 15 words
    const topWords = Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);
    
    const maxFreq = topWords[0][1];
    
    wordCloud.innerHTML = topWords.map(([word, freq]) => {
        let freqClass = 'low-freq';
        if (freq >= maxFreq * 0.7) {
            freqClass = 'high-freq';
        } else if (freq >= maxFreq * 0.4) {
            freqClass = 'mid-freq';
        }
        
        return `<span class="word-item ${freqClass}" title="出现 ${freq} 次">${word}</span>`;
    }).join('');
}

// Analyze keywords from all posts
function analyzeKeywords() {
    const text = blogPosts
        .map(post => `${post.title} ${post.content} ${post.tags.join(' ')}`)
        .join(' ')
        .toLowerCase();
    
    // Common stop words to exclude
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'from', 'is', 'are', 'am', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
        'could', 'can', 'may', 'might', 'must', 'shall', 'you', 'me', 'him',
        'her', 'it', 'we', 'they', 'this', 'that', 'these', 'those', 'what',
        'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
        'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor',
        'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'as',
        '的', '了', '在', '是', '我', '你', '他', '她', '它', '我们', '你们',
        '他们', '这', '那', '这个', '那个', '一个', '和', '或', '但是', '不',
        '也', '就', '只', '又', '更', '很', '太', '被', '把', '让'
    ]);
    
    // Extract words (Chinese and English)
    const words = text.match(/[\w\u4e00-\u9fa5]+/g) || [];
    
    const freq = {};
    words.forEach(word => {
        if (word.length > 2 && !stopWords.has(word)) {
            freq[word] = (freq[word] || 0) + 1;
        }
    });
    
    return freq;
}

// Write form functionality
function setupWriteForm() {
    const form = document.getElementById('writeForm');
    if (!form) return;
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderBlogPosts();
        });
    }
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitBlogPost();
    });
}

function submitBlogPost() {
    const title = document.getElementById('postTitle').value;
    const emoji = document.getElementById('postEmoji').value || '📝';
    const content = document.getElementById('postContent').value;
    const excerpt = document.getElementById('postExcerpt').value;
    const tagsInput = document.getElementById('postTags').value;
    const category = document.getElementById('postCategory').value || 'thoughts';
    
    if (!title || !content) {
        alert('请填写标题和内容');
        return;
    }
    
    const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
    
    const newPost = {
        id: Date.now(),
        title: title,
        date: new Date().toISOString().split('T')[0],
        emoji: emoji,
        excerpt: excerpt || content.substring(0, 100),
        content: content,
        tags: tags,
        category: category
    };
    
    // Save to Firebase if available
    if (window.firebaseEnabled) {
        saveBlogPostToFirebase(newPost);
    } else {
        saveBlogPostLocally(newPost);
    }
    
    // Add to blog posts array
    blogPosts.unshift(newPost);
    renderBlogPosts();
    generateWordCloud();
    
    // Reset form and show success message
    document.getElementById('writeForm').reset();
    showSuccessMessage('文章已发布！');
    
    // Redirect to blog section after 2 seconds
    setTimeout(() => {
        scrollToSection('blog');
    }, 2000);
}

// Edit and Delete functions
function editCurrentArticle() {
    if (!currentArticleId) return;
    
    const post = blogPosts.find(p => p.id === currentArticleId);
    if (!post) return;
    
    // Fill the form with current article data
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postEmoji').value = post.emoji;
    document.getElementById('postContent').value = post.content;
    document.getElementById('postExcerpt').value = post.excerpt;
    document.getElementById('postTags').value = post.tags.join(', ');
    document.getElementById('postCategory').value = post.category;
    
    // Delete the old post
    blogPosts = blogPosts.filter(p => p.id !== currentArticleId);
    saveBlogPostsLocally();
    
    // Scroll to write section
    scrollToSection('write');
    showSuccessMessage('已加载文章到编辑器，修改后可重新发布');
}

function deleteCurrentArticle() {
    if (!currentArticleId) return;
    
    const post = blogPosts.find(p => p.id === currentArticleId);
    if (!post) return;
    
    if (confirm(`确定要删除文章 "${post.title}" 吗？`)) {
        blogPosts = blogPosts.filter(p => p.id !== currentArticleId);
        saveBlogPostsLocally();
        showSuccessMessage('文章已删除');
        
        setTimeout(() => {
            scrollToSection('blog');
        }, 1500);
    }
}

// Firebase storage functions
function saveBlogPostToFirebase(post) {
    if (!window.database) return;
    
    try {
        window.database.ref('posts/' + post.id).set({
            title: post.title,
            date: post.date,
            emoji: post.emoji,
            excerpt: post.excerpt,
            content: post.content,
            tags: post.tags,
            category: post.category,
            timestamp: Date.now()
        });
        console.log('文章已保存到 Firebase');
    } catch (error) {
        console.error('保存到 Firebase 失败:', error);
    }
}

function loadBlogPosts() {
    if (window.firebaseEnabled && window.database) {
        window.database.ref('posts').on('value', snapshot => {
            const data = snapshot.val();
            if (data) {
                blogPosts = Object.entries(data).map(([key, value]) => ({
                    id: parseInt(key),
                    ...value
                })).sort((a, b) => new Date(b.date) - new Date(a.date));
                renderBlogPosts();
            }
        });
    } else {
        // Load from local storage
        const saved = localStorage.getItem('blogPosts');
        if (saved) {
            try {
                const localPosts = JSON.parse(saved);
                blogPosts = [...localPosts, ...blogPosts];
                renderBlogPosts();
            } catch (e) {
                console.error('加载本地存储失败:', e);
            }
        }
    }
}

function saveBlogPostLocally(post) {
    saveBlogPostsLocally();
}

function saveBlogPostsLocally() {
    try {
        localStorage.setItem('blogPosts', JSON.stringify(blogPosts.slice(0, 100)));
    } catch (e) {
        console.error('保存到本地存储失败:', e);
    }
}

// Success message
function showSuccessMessage(message) {
    const div = document.createElement('div');
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #E8A0C1, #FFB6D9);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(232, 160, 193, 0.3);
        font-weight: 600;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    div.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(div);
    
    setTimeout(() => {
        div.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => div.remove(), 300);
    }, 3000);
}
