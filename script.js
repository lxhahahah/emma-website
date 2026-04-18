// Firebase Configuration (using REST API - no SDK needed)
const firebaseConfig = {
    projectId: "emma-home-debc4"
};

// Initialize Firebase
window.firebaseEnabled = true;
console.log('✅ Firebase REST API 已初始化，无需 SDK');

// Blog data
let blogPosts = [];
let filteredPosts = [];
let currentArticleId = null;

const categoryMap = {
    'learning': '📚 学习',
    'life': '🌟 生活',
    'tech': '💻 技术',
    'thoughts': '💭 思考',
    'travel': '✈️ 旅行'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded triggered');
    initializeNavigation();
    setupWriteForm();
    loadBlogPosts();
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
});

// ==================== MODAL FUNCTIONS ====================
function openWriteArticleModal() {
    console.log('✅ openWriteArticleModal called');
    const modal = document.getElementById('writeArticleModal');
    if (!modal) {
        console.error('❌ Modal element not found!');
        return;
    }
    
    // Reset form
    const form = document.getElementById('writeForm');
    if (form) form.reset();
    
    // Show modal
    modal.style.display = 'flex';
    console.log('✅ Modal displayed');
}

function closeWriteArticleModal() {
    console.log('✅ closeWriteArticleModal called');
    const modal = document.getElementById('writeArticleModal');
    if (!modal) {
        console.error('❌ Modal element not found!');
        return;
    }
    modal.style.display = 'none';
    console.log('✅ Modal hidden');
}

console.log('✅ Modal functions loaded');

// ==================== FORM HANDLING ====================
function setupWriteForm() {
    const form = document.getElementById('writeForm');
    if (!form) {
        console.error('❌ Write form not found!');
        return;
    }
    
    form.addEventListener('submit', submitBlogPost);
}

async function submitBlogPost(e) {
    e.preventDefault();
    console.log('✅ Form submitted');
    
    const title = document.getElementById('postTitle').value.trim();
    const emoji = document.getElementById('postEmoji').value.trim() || '📝';
    const category = document.getElementById('postCategory')?.value || 'tech';
    const content = document.getElementById('postContent').value.trim();
    const tagsInput = document.getElementById('postTags').value.trim();
    
    if (!title || !content) {
        alert('Please fill in title and content');
        return;
    }
    
    // Check if editing
    const isEditing = window.currentEditId !== undefined;
    
    // Create post object with full timestamp
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19); // YYYY-MM-DD HH:MM:SS
    
    const post = {
        id: isEditing ? window.currentEditId : Date.now(),
        title,
        emoji,
        category,
        excerpt: content.substring(0, 100),
        content,
        tags: tagsInput.split(',').map(t => t.trim()).filter(t => t),
        date: timestamp,
        createdAt: isEditing ? blogPosts.find(p => p.id == window.currentEditId)?.createdAt : now.getTime()
    };
    
    console.log(isEditing ? '✏️ Update post:' : '📝 New post:', post);
    
    // Save to Firebase
    try {
        if (isEditing) {
            // Find Firebase key for this post
            const response = await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/posts.json`);
            const data = await response.json();
            
            let firebaseKey = null;
            if (data) {
                for (const key in data) {
                    if (data[key].id == window.currentEditId) {
                        firebaseKey = key;
                        break;
                    }
                }
            }
            
            if (firebaseKey) {
                await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/posts/${firebaseKey}.json`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(post)
                });
                console.log('✅ 文章已更新');
            }
        } else {
            // New post
            const response = await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/posts.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(post)
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ 文章已保存到 Firebase:', data.name);
            }
        }
        
        // Close modal and clear edit state
        closeWriteArticleModal();
        window.currentEditId = undefined;
        
        // Reload and render
        loadBlogPosts();
        
        // Show success notification
        showSuccessNotification(title, isEditing);
    } catch (error) {
        console.error('❌ Save failed:', error);
        alert('Failed to publish article');
    }
}
function showSuccessNotification(title, isEditing = false) {
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
        z-index: 11000;
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
        <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">${isEditing ? 'Updated!' : 'Published!'}</h2>
        <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">Article ${isEditing ? 'updated' : 'published'} successfully</p>
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
    
    document.body.appendChild(modal);
    
    // Auto close after 4 seconds
    setTimeout(() => {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }, 4000);
}

// ==================== NAVIGATION ====================
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    console.log(`Found ${navLinks.length} nav links`);
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            
            // Update active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Navigate
            window.location.hash = '#' + sectionId;
            showSection(sectionId);
        });
    });
}

function handleHashChange() {
    const hash = window.location.hash.substring(1);
    console.log('📍 Hash changed to:', hash || 'home');
    
    if (hash.startsWith('post-')) {
        const postId = parseInt(hash.replace('post-', ''));
        showArticleDetail(postId);
    } else {
        showSection(hash || 'home');
    }
}

function showSection(sectionId) {
    console.log('📍 Showing section:', sectionId);
    
    const sections = document.querySelectorAll('section');
    sections.forEach(section => section.style.display = 'none');
    
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
        });
    }
}

// ==================== BLOG POST FUNCTIONS ====================
async function loadBlogPosts() {
    console.log('🔄 Loading blog posts...');
    
    try {
        const response = await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/posts.json`);
        const data = await response.json();
        
        if (data && typeof data === 'object') {
            blogPosts = Object.values(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            console.log(`✅ 从 Firebase 加载文章: ${blogPosts.length} 篇`);
        } else {
            blogPosts = [];
            console.log('📝 Firebase 数据库为空');
        }
    } catch (error) {
        console.error('❌ Failed to load from Firebase:', error);
        blogPosts = [];
    }
    
    // Render all
    filteredPosts = [...blogPosts];
    renderArticlesList();
    generateWordCloud();
    generateCategoryOptions();
}

function renderArticlesList() {
    console.log('🎨 renderArticlesList called, posts:', filteredPosts.length);
    
    const container = document.getElementById('articlesList');
    if (!container) {
        console.error('❌ articlesList element not found!');
        return;
    }
    
    const empty = document.getElementById('blogEmpty');
    
    if (filteredPosts.length === 0) {
        container.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }
    
    if (empty) empty.style.display = 'none';
    
    container.innerHTML = filteredPosts.map(post => `
        <div class="article-list-item" onclick="window.location.hash='#post-${post.id}'">
            <div class="article-emoji">${post.emoji || '📝'}</div>
            <div class="article-info">
                <h3 class="article-title">${post.title}</h3>
                <div class="article-meta">
                    <span class="article-date">${post.date}</span>
                    <span class="article-category">${categoryMap[post.category] || 'Other'}</span>
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('✅ Articles rendered');
}

function showArticleDetail(postId) {
    console.log('📖 Showing article:', postId);
    
    const post = blogPosts.find(p => p.id == postId);
    if (!post) {
        console.error('❌ Post not found:', postId);
        return;
    }
    
    const sections = document.querySelectorAll('section');
    sections.forEach(s => s.style.display = 'none');
    
    const detailSection = document.getElementById('article-detail');
    if (detailSection) {
        detailSection.innerHTML = `
            <div class="article-detail-container">
                <button onclick="window.location.hash='#blog'" class="back-button">← Back</button>
                
                <div class="article-detail-header">
                    <span class="detail-emoji">${post.emoji || '📝'}</span>
                    <h1>${post.title}</h1>
                    <div class="detail-meta">
                        <span>${post.date}</span>
                        <span>${categoryMap[post.category] || 'Other'}</span>
                    </div>
                </div>
                
                <div class="article-detail-content">
                    ${post.content.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('')}
                </div>
                
                ${post.tags && post.tags.length > 0 ? `
                    <div class="detail-tags">
                        ${post.tags.map(tag => `<span class="detail-tag">#${tag}</span>`).join('')}
                    </div>
                ` : ''}
                
                <div class="article-actions">
                    <button class="btn btn-primary" onclick="editArticle(${post.id})">✏️ Edit</button>
                    <button class="btn btn-danger" onclick="deleteArticle(${post.id})">🗑️ Delete</button>
                </div>
            </div>
        `;
        detailSection.style.display = 'block';
    }
}

// ==================== FILTERING ====================
function applyFilters() {
    console.log('🔍 Applying filters');
    
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const categorySelect = document.getElementById('categorySelect');
    
    let results = [...blogPosts];
    
    // Search
    if (searchInput && searchInput.value) {
        const query = searchInput.value.toLowerCase();
        results = results.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.content.toLowerCase().includes(query) ||
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
        );
    }
    
    // Category
    if (categorySelect && categorySelect.value) {
        results = results.filter(p => p.category === categorySelect.value);
    }
    
    // Sort
    if (sortSelect && sortSelect.value === 'oldest') {
        results.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    } else {
        results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    
    filteredPosts = results;
    renderArticlesList();
    console.log(`✅ Filtered to ${filteredPosts.length} articles`);
}

function generateCategoryOptions() {
    console.log('🏷️ Generating categories');
    
    const select = document.getElementById('categorySelect');
    if (!select) return;
    
    const categories = new Set();
    blogPosts.forEach(p => {
        if (p.category) categories.add(p.category);
    });
    
    select.innerHTML = '<option value="">All Categories</option>' +
        Array.from(categories).map(cat => 
            `<option value="${cat}">${categoryMap[cat] || cat}</option>`
        ).join('');
}

// ==================== KEYWORD CLOUD ====================
function generateWordCloud() {
    console.log('☁️ Generating word cloud');
    
    const container = document.getElementById('wordCloud');
    if (!container) return;
    
    if (blogPosts.length === 0) {
        container.innerHTML = '<p style="color: #999;">No keywords yet</p>';
        return;
    }
    
    const text = blogPosts
        .map(p => (p.title + ' ' + p.content + ' ' + (p.tags || []).join(' ')).toLowerCase())
        .join(' ');
    
    // Extract words
    const words = text.match(/[\u4e00-\u9fa5]+|[a-z]+/gi) || [];
    
    // Stop words
    const stopWords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'was', 'were',
        '的', '了', '是', '在', '我', '你', '他', '一', '有', '个', '这', '那', '不', '如', '和'
    ]);
    
    // Count frequency
    const freq = {};
    words.forEach(w => {
        if (w.length > 1 && !stopWords.has(w)) {
            freq[w] = (freq[w] || 0) + 1;
        }
    });
    
    const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);
    
    if (sorted.length === 0) {
        container.innerHTML = '<p style="color: #999;">No keywords yet</p>';
        return;
    }
    
    const minFreq = sorted[sorted.length - 1][1];
    const maxFreq = sorted[0][1];
    const range = maxFreq - minFreq || 1;
    
    container.innerHTML = sorted.map(([word, count]) => {
        const ratio = (count - minFreq) / range;
        const size = 12 + ratio * 20;
        const opacity = 0.5 + ratio * 0.5;
        return `<span style="font-size: ${size}px; opacity: ${opacity}; margin: 8px; cursor: pointer;" 
                      onclick="document.getElementById('searchInput').value='${word}'; applyFilters();">
                    ${word}(${count})
                </span>`;
    }).join('');
    
    console.log('✅ Word cloud generated');
}

// Add event listeners for filters
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const categorySelect = document.getElementById('categorySelect');
    
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    if (categorySelect) categorySelect.addEventListener('change', applyFilters);
});

// ==================== EDIT & DELETE ====================
function editArticle(postId) {
    console.log('✏️ Edit article:', postId);
    
    const post = blogPosts.find(p => p.id == postId);
    if (!post) {
        console.error('❌ Post not found');
        return;
    }
    
    // Populate form with article data
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postEmoji').value = post.emoji;
    document.getElementById('postContent').value = post.content;
    document.getElementById('postTags').value = post.tags.join(', ');
    document.getElementById('postCategory').value = post.category;
    
    // Store ID for update
    window.currentEditId = postId;
    
    // Open modal
    openWriteArticleModal();
}

async function deleteArticle(postId) {
    console.log('🗑️ Delete article:', postId);
    
    if (!confirm('Are you sure you want to delete this article?')) {
        return;
    }
    
    try {
        // Find the article in Firebase
        const response = await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/posts.json`);
        const data = await response.json();
        
        let firebaseKey = null;
        if (data) {
            for (const key in data) {
                if (data[key].id == postId) {
                    firebaseKey = key;
                    break;
                }
            }
        }
        
        // Delete from Firebase
        if (firebaseKey) {
            await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/posts/${firebaseKey}.json`, {
                method: 'DELETE'
            });
            console.log('✅ Article deleted from Firebase');
        }
        
        // Remove from local array
        blogPosts = blogPosts.filter(p => p.id != postId);
        filteredPosts = filteredPosts.filter(p => p.id != postId);
        
        // Go back to blog
        window.location.hash = '#blog';
        renderArticlesList();
    } catch (error) {
        console.error('❌ Delete failed:', error);
        alert('Failed to delete article');
    }
}
