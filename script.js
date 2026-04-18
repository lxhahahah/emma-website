// ==================== CONFIG ====================
const firebaseConfig = { projectId: "emma-home-debc4" };
const ADMIN_PASSWORD = "Emma2024!"; // You can change this
let isAuthenticated = false;
let currentEditSection = null;
let quillEditor = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Page loaded');
    
    initializeNavigation();
    setupWriteForm();
    initializeQuillEditor();
    loadPageContent(); // Load saved Home/About content
    loadBlogPosts();
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
});

// ==================== QUILL EDITOR ====================
function initializeQuillEditor() {
    quillEditor = new Quill('#postContentEditor', {
        theme: 'snow',
        placeholder: 'Start writing your article...',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                ['blockquote', 'code-block'],
                [{ 'header': 1 }, { 'header': 2 }],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'size': ['small', false, 'large', 'huge'] }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'font': [] }],
                [{ 'align': [] }],
                ['clean']
            ]
        }
    });
    console.log('✅ Quill editor initialized');
}

// ==================== AUTHENTICATION ====================
function requireAuth(callback) {
    if (isAuthenticated) {
        callback();
        return;
    }
    
    currentEditCallback = callback;
    openAuthModal();
}

function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('authPassword').focus();
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('authForm').reset();
    }
}

function submitAuth(event) {
    event.preventDefault();
    const password = document.getElementById('authPassword').value;
    
    if (password === ADMIN_PASSWORD) {
        isAuthenticated = true;
        console.log('✅ Authentication successful');
        closeAuthModal();
        
        if (window.currentEditCallback) {
            window.currentEditCallback();
            window.currentEditCallback = null;
        }
    } else {
        alert('❌ Incorrect password');
        document.getElementById('authPassword').value = '';
    }
}

// ==================== EDIT MODE FUNCTIONS ====================
function toggleEditMode(section) {
    requireAuth(() => {
        const editModal = document.getElementById('editSectionModal');
        
        if (!editModal) {
            createEditModal();
        }
        
        const content = document.getElementById(section + 'Content');
        if (!content) return;
        
        const editContainer = document.getElementById('editSectionContainer');
        if (editContainer) {
            editContainer.innerHTML = content.innerHTML;
            currentEditSection = section;
            openEditModal();
        }
    });
}

function createEditModal() {
    const modal = document.createElement('div');
    modal.id = 'editSectionModal';
    modal.className = 'modal';
    modal.style.display = 'none';
    
    modal.innerHTML = `
        <div class="modal-content" style="width: 95%; max-width: 900px; max-height: 90vh;">
            <div class="modal-header">
                <h2>✏️ Edit Content</h2>
                <button class="modal-close" onclick="closeEditModal()">&times;</button>
            </div>
            <div class="modal-body" style="overflow-y: auto;">
                <div id="editSectionContainer" contenteditable="true" style="
                    border: 1px solid #ddd;
                    padding: 20px;
                    border-radius: 6px;
                    min-height: 400px;
                    line-height: 1.6;
                    font-size: 16px;
                "></div>
                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: #999; font-size: 14px;">💡 Click to edit text directly. Use Ctrl/Cmd+B for bold, I for italic.</p>
                </div>
            </div>
            <div class="modal-body" style="border-top: 1px solid #eee; padding-top: 20px;">
                <div class="form-actions" style="justify-content: center;">
                    <button class="btn btn-primary" onclick="saveEditedContent()">💾 Save</button>
                    <button class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function openEditModal() {
    const modal = document.getElementById('editSectionModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            const editor = document.getElementById('editSectionContainer');
            if (editor) editor.focus();
        }, 100);
    }
}

function closeEditModal() {
    const modal = document.getElementById('editSectionModal');
    if (modal) modal.style.display = 'none';
}

async function saveEditedContent() {
    if (!currentEditSection) return;
    
    const editedContent = document.getElementById('editSectionContainer').innerHTML;
    const originalContent = document.getElementById(currentEditSection + 'Content');
    
    if (originalContent) {
        originalContent.innerHTML = editedContent;
    }
    
    // Save to localStorage (primary, always works)
    try {
        const data = {
            section: currentEditSection,
            content: editedContent,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem(`page_${currentEditSection}`, JSON.stringify(data));
        console.log(`✅ Page "${currentEditSection}" saved to localStorage`);
    } catch (error) {
        console.error('❌ localStorage save failed:', error);
    }
    
    // Also try to save to Firebase (secondary, for backup)
    try {
        const data = {
            section: currentEditSection,
            content: editedContent,
            timestamp: new Date().toISOString()
        };
        
        const response = await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/posts/page_${currentEditSection}.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            console.log(`✅ Page "${currentEditSection}" backed up to Firebase`);
        }
    } catch (error) {
        console.error('⚠️ Firebase backup failed (not critical):', error);
    }
    
    closeEditModal();
    currentEditSection = null;
}

// Load saved page content from localStorage (and Firebase as fallback)
async function loadPageContent() {
    try {
        // Try to load home content from localStorage first
        const homeData = localStorage.getItem('page_home');
        if (homeData) {
            try {
                const parsed = JSON.parse(homeData);
                if (parsed && parsed.content) {
                    const homeContent = document.getElementById('homeContent');
                    if (homeContent) {
                        homeContent.innerHTML = parsed.content;
                        console.log('✅ Home content loaded from localStorage');
                        return;
                    }
                }
            } catch (e) {
                console.warn('⚠️ Failed to parse home data from localStorage');
            }
        }
        
        // Try to load home from Firebase as fallback
        try {
            const homeResponse = await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/posts/page_home.json`);
            if (homeResponse.ok) {
                const homeData = await homeResponse.json();
                if (homeData && homeData.content) {
                    const homeContent = document.getElementById('homeContent');
                    if (homeContent) {
                        homeContent.innerHTML = homeData.content;
                        console.log('✅ Home content loaded from Firebase backup');
                    }
                }
            }
        } catch (error) {
            // Silent fail - not critical
        }
        
        // Try to load about content from localStorage first
        const aboutData = localStorage.getItem('page_about');
        if (aboutData) {
            try {
                const parsed = JSON.parse(aboutData);
                if (parsed && parsed.content) {
                    const aboutContent = document.getElementById('aboutContent');
                    if (aboutContent) {
                        aboutContent.innerHTML = parsed.content;
                        console.log('✅ About content loaded from localStorage');
                        return;
                    }
                }
            } catch (e) {
                console.warn('⚠️ Failed to parse about data from localStorage');
            }
        }
        
        // Try to load about from Firebase as fallback
        try {
            const aboutResponse = await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/posts/page_about.json`);
            if (aboutResponse.ok) {
                const aboutData = await aboutResponse.json();
                if (aboutData && aboutData.content) {
                    const aboutContent = document.getElementById('aboutContent');
                    if (aboutContent) {
                        aboutContent.innerHTML = aboutData.content;
                        console.log('✅ About content loaded from Firebase backup');
                    }
                }
            }
        } catch (error) {
            // Silent fail - not critical
        }
    } catch (error) {
        console.error('⚠️ Failed to load page content:', error);
        // Pages will show default content if all methods fail
    }
}

// ==================== BLOG FUNCTIONS ====================
let blogPosts = [];
let filteredPosts = [];

const categoryMap = {
    'learning': '📚 Learning',
    'life': '🌟 Life',
    'tech': '💻 Tech',
    'thoughts': '💭 Thoughts',
    'travel': '✈️ Travel'
};

function setupWriteForm() {
    const form = document.getElementById('writeForm');
    if (form) form.addEventListener('submit', submitBlogPost);
}

function openWriteArticleModal() {
    if (!isAuthenticated) {
        requireAuth(() => {
            const modal = document.getElementById('writeArticleModal');
            if (modal) {
                modal.style.display = 'flex';
                quillEditor.setContents([]);
                document.getElementById('writeForm').reset();
            }
        });
    } else {
        const modal = document.getElementById('writeArticleModal');
        if (modal) {
            modal.style.display = 'flex';
            quillEditor.setContents([]);
            document.getElementById('writeForm').reset();
        }
    }
}

function closeWriteArticleModal() {
    const modal = document.getElementById('writeArticleModal');
    if (modal) modal.style.display = 'none';
}

async function submitBlogPost(e) {
    e.preventDefault();
    console.log('✅ Form submitted');
    
    const title = document.getElementById('postTitle').value.trim();
    const emoji = document.getElementById('postEmoji').value.trim() || '📝';
    const category = document.getElementById('postCategory')?.value || 'tech';
    const tagsInput = document.getElementById('postTags').value.trim();
    
    // Get content from Quill editor
    const content = quillEditor.root.innerHTML;
    
    if (!title || !content || content === '<p><br></p>') {
        alert('Please fill in title and content');
        return;
    }
    
    const isEditing = window.currentEditId !== undefined;
    const now = new Date();
    const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
    
    const post = {
        id: isEditing ? window.currentEditId : Date.now(),
        title,
        emoji,
        category,
        excerpt: content.replace(/<[^>]*>/g, '').substring(0, 100),
        content,
        tags: tagsInput.split(',').map(t => t.trim()).filter(t => t),
        date: timestamp,
        createdAt: isEditing ? blogPosts.find(p => p.id == window.currentEditId)?.createdAt : now.getTime()
    };
    
    try {
        if (isEditing) {
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
                console.log('✅ Article updated');
            }
        } else {
            await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/posts.json`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(post)
            });
            console.log('✅ Article saved');
        }
        
        closeWriteArticleModal();
        window.currentEditId = undefined;
        loadBlogPosts();
        showSuccessNotification(title, isEditing);
    } catch (error) {
        console.error('❌ Save failed:', error);
        alert('Failed to publish article');
    }
}

function showSuccessNotification(title, isEditing = false) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.5); display: flex;
        align-items: center; justify-content: center; z-index: 11000;
        animation: fadeIn 0.3s ease;
    `;
    
    const content = document.createElement('div');
    content.style.cssText = `
        background: white; padding: 40px; border-radius: 12px; text-align: center;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2); max-width: 400px;
        animation: slideUp 0.3s ease;
    `;
    
    content.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 20px;">✅</div>
        <h2 style="margin: 0 0 10px 0; color: #333; font-size: 24px;">${isEditing ? 'Updated!' : 'Published!'}</h2>
        <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">Article ${isEditing ? 'updated' : 'published'} successfully</p>
        <p style="margin: 0 0 30px 0; color: #999; font-size: 13px;">《${title}》</p>
        <button onclick="this.closest('div').remove()" class="btn btn-primary">Dismiss</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    setTimeout(() => {
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease';
        setTimeout(() => modal.remove(), 300);
    }, 3000);
}

async function loadBlogPosts() {
    try {
        const response = await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/posts.json`);
        const data = await response.json();
        
        if (data && typeof data === 'object') {
            blogPosts = Object.values(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            console.log(`✅ Loaded ${blogPosts.length} articles`);
        } else {
            blogPosts = [];
        }
    } catch (error) {
        console.error('❌ Load failed:', error);
        blogPosts = [];
    }
    
    filteredPosts = [...blogPosts];
    renderArticlesList();
    generateWordCloud();
}

function renderArticlesList() {
    const container = document.getElementById('articlesList');
    if (!container) return;
    
    if (filteredPosts.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = `
        <div class="articles-table-header">
            <div class="articles-table-emoji">Icon</div>
            <div class="articles-table-title">Title</div>
            <div class="articles-table-date">Date</div>
            <div class="articles-table-category">Category</div>
        </div>
        ${filteredPosts.map(post => `
            <div class="articles-table-row" onclick="window.location.hash='#post-${post.id}'" style="cursor: pointer;">
                <div class="articles-table-emoji">${post.emoji || '📝'}</div>
                <div class="articles-table-title">${post.title}</div>
                <div class="articles-table-date">${post.date}</div>
                <div class="articles-table-category"><span class="category-badge">${categoryMap[post.category] || 'Other'}</span></div>
            </div>
        `).join('')}
    `;
}

function showArticleDetail(postId) {
    const post = blogPosts.find(p => p.id == postId);
    if (!post) return;
    
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
                    ${post.content}
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

function editArticle(postId) {
    requireAuth(() => {
        const post = blogPosts.find(p => p.id == postId);
        if (!post) return;
        
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postEmoji').value = post.emoji;
        document.getElementById('postTags').value = post.tags.join(', ');
        document.getElementById('postCategory').value = post.category;
        
        quillEditor.root.innerHTML = post.content;
        window.currentEditId = postId;
        
        openWriteArticleModal();
    });
}

async function deleteArticle(postId) {
    if (!confirm('Are you sure?')) return;
    
    requireAuth(async () => {
        try {
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
            
            if (firebaseKey) {
                await fetch(`https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/posts/${firebaseKey}.json`, {
                    method: 'DELETE'
                });
            }
            
            blogPosts = blogPosts.filter(p => p.id != postId);
            filteredPosts = filteredPosts.filter(p => p.id != postId);
            
            window.location.hash = '#blog';
            renderArticlesList();
        } catch (error) {
            console.error('❌ Delete failed:', error);
            alert('Failed to delete article');
        }
    });
}

function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const categorySelect = document.getElementById('categorySelect');
    
    let results = [...blogPosts];
    
    if (searchInput && searchInput.value) {
        const query = searchInput.value.toLowerCase();
        results = results.filter(p =>
            p.title.toLowerCase().includes(query) ||
            p.content.toLowerCase().includes(query) ||
            (p.tags && p.tags.some(tag => tag.toLowerCase().includes(query)))
        );
    }
    
    if (categorySelect && categorySelect.value) {
        results = results.filter(p => p.category === categorySelect.value);
    }
    
    if (sortSelect && sortSelect.value === 'oldest') {
        results.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    } else {
        results.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    }
    
    filteredPosts = results;
    renderArticlesList();
}

function generateWordCloud() {
    const container = document.getElementById('wordCloud');
    if (!container || blogPosts.length === 0) return;
    
    const text = blogPosts
        .map(p => (p.title + ' ' + p.content + ' ' + (p.tags || []).join(' ')).toLowerCase())
        .join(' ');
    
    // Extract words: Chinese 1-4 chars, English 2-10 chars (max 3-4 chars preferred)
    const words = text.match(/[\u4e00-\u9fa5]{1,4}|[a-z]{2,10}/gi) || [];
    
    const stopWords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'is', 'are', 'was', 'were',
        'i', 'me', 'my', 'we', 'you', 'he', 'she', 'it', 'that', 'this', 'as', 'be', 'by', 'do', 'go', 'if', 'can', 'will',
        '的', '了', '是', '在', '我', '你', '他', '一', '有', '个', '这', '那', '不', '如', '和', '也', '都', '可以', '就是', '要是'
    ]);
    
    const freq = {};
    words.forEach(w => {
        if (w.length > 1 && !stopWords.has(w)) {
            freq[w] = (freq[w] || 0) + 1;
        }
    });
    
    // Take top 25-30 keywords (increased from 4)
    const sorted = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30);
    
    if (sorted.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    const minFreq = sorted[sorted.length - 1][1];
    const maxFreq = sorted[0][1];
    const range = maxFreq - minFreq || 1;
    
    container.innerHTML = sorted.map(([word, count]) => {
        const ratio = (count - minFreq) / range;
        const size = 14 + ratio * 20; // 14px to 34px based on frequency
        const opacity = 0.6 + ratio * 0.4;
        return `<span style="font-size: ${size}px; opacity: ${opacity}; margin: 10px 8px; cursor: pointer; font-weight: 500;" 
                      onclick="document.getElementById('searchInput').value='${word}'; applyFilters();">
                    ${word}(${count})
                </span>`;
    }).join('');
}

// ==================== NAVIGATION ====================
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('data-section');
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            window.location.hash = '#' + sectionId;
            showSection(sectionId);
        });
    });
}

function handleHashChange() {
    const hash = window.location.hash.substring(1);
    
    if (hash.startsWith('post-')) {
        const postId = parseInt(hash.replace('post-', ''));
        showArticleDetail(postId);
    } else {
        showSection(hash || 'home');
    }
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => section.style.display = 'none');
    
    const section = document.getElementById(sectionId);
    if (section) {
        section.style.display = 'block';
        
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
        });
    }
}

// Add filter listeners
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const sortSelect = document.getElementById('sortSelect');
    const categorySelect = document.getElementById('categorySelect');
    
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    if (categorySelect) categorySelect.addEventListener('change', applyFilters);
});

console.log('✅ Script loaded successfully');
