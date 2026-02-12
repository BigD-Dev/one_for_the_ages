// ==================================================
// OFTA ADMIN PANEL - JavaScript
// ==================================================

const API_BASE = 'http://localhost:8080'

// ────────────────────────────────────────────────
// API Helper
// ────────────────────────────────────────────────

async function api(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options,
        })
        if (!res.ok) throw new Error(`API Error: ${res.status}`)
        return await res.json()
    } catch (err) {
        console.error('API call failed:', err)
        return null
    }
}


// ────────────────────────────────────────────────
// Navigation
// ────────────────────────────────────────────────

const pages = {
    dashboard: renderDashboard,
    celebrities: renderCelebrities,
    questions: renderQuestions,
    users: renderUsers,
    leaderboard: renderLeaderboard,
    config: renderConfig,
}

function navigateTo(page) {
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'))
    const navEl = document.getElementById(`nav-${page}`)
    if (navEl) navEl.classList.add('active')

    // Update title
    const titles = {
        dashboard: '📊 Dashboard',
        celebrities: '⭐ Celebrity Management',
        questions: '❓ Question Templates',
        users: '👥 User Management',
        leaderboard: '🏆 Leaderboard',
        config: '⚙️ App Configuration',
    }
    document.getElementById('page-title').textContent = titles[page] || page

    // Render page
    if (pages[page]) pages[page]()

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open')
}


// ────────────────────────────────────────────────
// Dashboard
// ────────────────────────────────────────────────

async function renderDashboard() {
    const container = document.getElementById('page-container')
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading dashboard...</p></div>'

    // Fetch stats
    const [celebStats, questionStats, userStats, sessionStats] = await Promise.all([
        api('/admin/stats/celebrities'),
        api('/admin/stats/questions'),
        api('/admin/stats/users'),
        api('/admin/stats/sessions'),
    ])

    const celebCount = celebStats?.count ?? '—'
    const questionCount = questionStats?.count ?? '—'
    const userCount = userStats?.count ?? '—'
    const sessionCount = sessionStats?.count ?? '—'

    container.innerHTML = `
        <!-- Stats Grid -->
        <div class="stats-grid">
            <div class="stat-card">
                <p class="stat-label">Total Celebrities</p>
                <p class="stat-value">${celebCount}</p>
            </div>
            <div class="stat-card">
                <p class="stat-label">Question Templates</p>
                <p class="stat-value">${questionCount}</p>
            </div>
            <div class="stat-card">
                <p class="stat-label">Registered Users</p>
                <p class="stat-value">${userCount}</p>
            </div>
            <div class="stat-card">
                <p class="stat-label">Total Sessions</p>
                <p class="stat-value">${sessionCount}</p>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Quick Actions</h3>
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <button class="btn btn-primary" onclick="navigateTo('celebrities')">⭐ Manage Celebrities</button>
                <button class="btn btn-primary" onclick="navigateTo('questions')">❓ Manage Questions</button>
                <button class="btn btn-secondary" onclick="navigateTo('users')">👥 View Users</button>
                <button class="btn btn-secondary" onclick="navigateTo('leaderboard')">🏆 Leaderboard</button>
            </div>
        </div>

        <!-- System Info -->
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">System Info</h3>
            </div>
            <div class="table-wrapper">
                <table>
                    <tr><td>API Base URL</td><td><code>${API_BASE}</code></td></tr>
                    <tr><td>Database</td><td><code>da_prod</code></td></tr>
                    <tr><td>Table Prefix</td><td><code>ofta_</code></td></tr>
                    <tr><td>Environment</td><td><span class="badge badge-info">Local</span></td></tr>
                </table>
            </div>
        </div>
    `
}


// ────────────────────────────────────────────────
// Celebrities
// ────────────────────────────────────────────────

async function renderCelebrities() {
    const container = document.getElementById('page-container')
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading celebrities...</p></div>'

    const data = await api('/admin/celebrities')
    const celebrities = data?.celebrities ?? []

    container.innerHTML = `
        <div class="search-bar">
            <input type="text" class="search-input" id="celeb-search" placeholder="Search celebrities..." oninput="filterCelebrities()">
            <button class="btn btn-primary" onclick="showAddCelebrityModal()">+ Add Celebrity</button>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">All Celebrities (${celebrities.length})</h3>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>DOB</th>
                            <th>Age</th>
                            <th>Star Sign</th>
                            <th>Category</th>
                            <th>Popularity</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="celeb-tbody">
                        ${celebrities.map(c => `
                            <tr class="celeb-row" data-name="${c.full_name.toLowerCase()}">
                                <td><strong>${c.full_name}</strong></td>
                                <td>${c.date_of_birth}</td>
                                <td>${calculateAge(c.date_of_birth)}</td>
                                <td>${c.star_sign}</td>
                                <td>${c.primary_category}</td>
                                <td>${c.popularity_score}</td>
                                <td>${c.is_active
            ? '<span class="badge badge-success">Active</span>'
            : '<span class="badge badge-danger">Inactive</span>'
        }</td>
                                <td>
                                    <button class="btn btn-sm btn-secondary" onclick="toggleCelebrity('${c.id}', ${!c.is_active})">
                                        ${c.is_active ? '🚫' : '✅'}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `
}

function filterCelebrities() {
    const query = document.getElementById('celeb-search').value.toLowerCase()
    document.querySelectorAll('.celeb-row').forEach(row => {
        row.style.display = row.dataset.name.includes(query) ? '' : 'none'
    })
}

function calculateAge(dob) {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const m = today.getMonth() - birthDate.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
    return age
}

async function toggleCelebrity(id, newStatus) {
    await api(`/admin/celebrities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: newStatus }),
    })
    renderCelebrities()
}

function showAddCelebrityModal() {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay active'
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">Add Celebrity</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input class="form-input" id="new-celeb-name" placeholder="e.g. Taylor Swift">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Date of Birth</label>
                        <input class="form-input" id="new-celeb-dob" type="date">
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Star Sign</label>
                        <select class="form-select" id="new-celeb-sign">
                            ${['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
            .map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Category</label>
                        <select class="form-select" id="new-celeb-category">
                            ${['Music', 'Movies', 'Sports', 'TV', 'Business', 'Royalty']
            .map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Nationality</label>
                        <input class="form-input" id="new-celeb-nationality" placeholder="e.g. American">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Popularity (1-100)</label>
                        <input class="form-input" id="new-celeb-pop" type="number" min="1" max="100" value="50">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Hints (comma-separated)</label>
                    <input class="form-input" id="new-celeb-hints" placeholder="Hint 1, Hint 2, Hint 3">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="submitNewCelebrity()">Add Celebrity</button>
            </div>
        </div>
    `
    document.body.appendChild(overlay)
}

async function submitNewCelebrity() {
    const payload = {
        full_name: document.getElementById('new-celeb-name').value,
        date_of_birth: document.getElementById('new-celeb-dob').value,
        star_sign: document.getElementById('new-celeb-sign').value,
        primary_category: document.getElementById('new-celeb-category').value,
        nationality: document.getElementById('new-celeb-nationality').value,
        popularity_score: parseInt(document.getElementById('new-celeb-pop').value),
        hints_easy: document.getElementById('new-celeb-hints').value.split(',').map(h => h.trim()).filter(Boolean),
    }

    if (!payload.full_name || !payload.date_of_birth) {
        alert('Name and DOB are required!')
        return
    }

    await api('/admin/celebrities', { method: 'POST', body: JSON.stringify(payload) })
    document.querySelector('.modal-overlay').remove()
    renderCelebrities()
}


// ────────────────────────────────────────────────
// Questions
// ────────────────────────────────────────────────

async function renderQuestions() {
    const container = document.getElementById('page-container')
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading questions...</p></div>'

    const data = await api('/admin/questions')
    const questions = data?.questions ?? []

    const modeCounts = {}
    questions.forEach(q => { modeCounts[q.mode] = (modeCounts[q.mode] || 0) + 1 })

    container.innerHTML = `
        <div class="stats-grid">
            ${Object.entries(modeCounts).map(([mode, count]) => `
                <div class="stat-card">
                    <p class="stat-label">${mode}</p>
                    <p class="stat-value">${count}</p>
                </div>
            `).join('')}
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">All Questions (${questions.length})</h3>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Mode</th>
                            <th>Celebrity</th>
                            <th>Difficulty</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${questions.slice(0, 100).map(q => `
                            <tr>
                                <td><span class="badge badge-info">${q.mode}</span></td>
                                <td>${q.celebrity_name || (q.celebrity_a_name ? `${q.celebrity_a_name} vs ${q.celebrity_b_name}` : '—')}</td>
                                <td>${'⭐'.repeat(q.difficulty)}</td>
                                <td>${q.is_active
            ? '<span class="badge badge-success">Active</span>'
            : '<span class="badge badge-danger">Inactive</span>'
        }</td>
                                <td>
                                    <button class="btn btn-sm btn-secondary" onclick="toggleQuestion('${q.id}', ${!q.is_active})">
                                        ${q.is_active ? '🚫' : '✅'}
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${questions.length > 100 ? `<p style="padding: 16px; color: var(--text-muted); font-size: 12px;">Showing 100 of ${questions.length} questions</p>` : ''}
        </div>
    `
}

async function toggleQuestion(id, newStatus) {
    await api(`/admin/questions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: newStatus }),
    })
    renderQuestions()
}


// ────────────────────────────────────────────────
// Users
// ────────────────────────────────────────────────

async function renderUsers() {
    const container = document.getElementById('page-container')
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading users...</p></div>'

    const data = await api('/admin/users')
    const users = data?.users ?? []

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">All Users (${users.length})</h3>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Provider</th>
                            <th>Joined</th>
                            <th>Last Active</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${users.map(u => `
                            <tr>
                                <td><strong>${u.display_name || 'Anonymous'}</strong></td>
                                <td>${u.email || '—'}</td>
                                <td>${u.auth_provider || 'anonymous'}</td>
                                <td>${formatDate(u.created_at)}</td>
                                <td>${formatDate(u.last_active_at)}</td>
                                <td>${u.is_banned
            ? '<span class="badge badge-danger">Banned</span>'
            : '<span class="badge badge-success">Active</span>'
        }</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `
}


// ────────────────────────────────────────────────
// Leaderboard
// ────────────────────────────────────────────────

async function renderLeaderboard() {
    const container = document.getElementById('page-container')
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading leaderboard...</p></div>'

    const today = new Date().toISOString().split('T')[0]
    const data = await api(`/v1/leaderboards/daily/${today}?limit=50`)
    const entries = data?.entries ?? []

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Daily Leaderboard — ${today}</h3>
            </div>
            ${entries.length === 0 ? `
                <div class="empty-state">
                    <p class="empty-state-icon">🏆</p>
                    <p class="empty-state-text">No entries for today</p>
                </div>
            ` : `
                <div class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Player</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${entries.map(e => `
                                <tr>
                                    <td><strong>${e.rank <= 3 ? ['🥇', '🥈', '🥉'][e.rank - 1] : '#' + e.rank}</strong></td>
                                    <td>${e.display_name}</td>
                                    <td><strong>${e.score}</strong></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `
}


// ────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────

async function renderConfig() {
    const container = document.getElementById('page-container')
    container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading config...</p></div>'

    const data = await api('/admin/config')
    const configs = data?.configs ?? []

    container.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">App Configuration</h3>
                <button class="btn btn-primary btn-sm" onclick="showAddConfigModal()">+ Add Config</button>
            </div>
            <div class="table-wrapper">
                <table>
                    <thead><tr><th>Key</th><th>Value</th><th>Updated</th></tr></thead>
                    <tbody>
                        ${configs.map(c => `
                            <tr>
                                <td><strong>${c.key}</strong></td>
                                <td><code>${JSON.stringify(c.value)}</code></td>
                                <td>${formatDate(c.updated_at)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `
}

function showAddConfigModal() {
    const overlay = document.createElement('div')
    overlay.className = 'modal-overlay active'
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3 class="modal-title">Add Config</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Key</label>
                    <input class="form-input" id="config-key" placeholder="e.g. feature_flags">
                </div>
                <div class="form-group">
                    <label class="form-label">Value (JSON)</label>
                    <input class="form-input" id="config-value" placeholder='e.g. {"enabled": true}'>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="submitConfig()">Save</button>
            </div>
        </div>
    `
    document.body.appendChild(overlay)
}

async function submitConfig() {
    const key = document.getElementById('config-key').value
    const value = document.getElementById('config-value').value

    if (!key || !value) return alert('Key and Value required')

    try {
        const parsedValue = JSON.parse(value)
        await api('/admin/config', { method: 'POST', body: JSON.stringify({ key, value: parsedValue }) })
        document.querySelector('.modal-overlay').remove()
        renderConfig()
    } catch {
        alert('Invalid JSON value')
    }
}


// ────────────────────────────────────────────────
// Utilities
// ────────────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return '—'
    try {
        const d = new Date(dateStr)
        return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch {
        return dateStr
    }
}


// ────────────────────────────────────────────────
// Init
// ────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    // Nav click handlers
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault()
            navigateTo(item.dataset.page)
        })
    })

    // Mobile menu toggle
    document.getElementById('menu-toggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open')
    })

    // Initial load
    renderDashboard()
})
