const API_BASE = '/api';
let allCharacters = [];
let currentCharacter = null;

const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearch');
const loading = document.getElementById('loading');
const characterGrid = document.getElementById('characterGrid');
const characterModal = document.getElementById('characterModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const closeModal = document.getElementById('closeModal');
const modalTitle = document.getElementById('modalTitle');
const characterInfo = document.getElementById('characterInfo');
const fetchDetailsSection = document.getElementById('fetchDetailsSection');
const fetchDetailsBtn = document.getElementById('fetchDetailsBtn');
const detailsSection = document.getElementById('detailsSection');
const characterDetails = document.getElementById('characterDetails');
const systemPrompt = document.getElementById('systemPrompt');
const copyPromptBtn = document.getElementById('copyPrompt');
const downloadJSONBtn = document.getElementById('downloadJSON');
const downloadTXTBtn = document.getElementById('downloadTXT');
const toast = document.getElementById('toast');

document.addEventListener('DOMContentLoaded', () => {
    loadCharacters();
    setupEventListeners();
});

function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    closeModal.addEventListener('click', closeModalFunc);
    modalBackdrop.addEventListener('click', closeModalFunc);
    fetchDetailsBtn.addEventListener('click', fetchCharacterDetails);
    copyPromptBtn.addEventListener('click', copyPrompt);
    downloadJSONBtn.addEventListener('click', downloadJSON);
    downloadTXTBtn.addEventListener('click', downloadTXT);
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && characterModal.classList.contains('show')) {
            closeModalFunc();
        }
    });
}

async function loadCharacters() {
    try {
        loading.classList.add('show');
        characterGrid.innerHTML = '';
        const response = await fetch(`${API_BASE}/characters`);
        const result = await response.json();
        if (result.success) {
            allCharacters = result.data;
            displayCharacters(allCharacters);
        }
    } catch (error) {
        showToast('System synchronization failed.', 'error');
    } finally {
        loading.classList.remove('show');
    }
}

function displayCharacters(characters) {
    if (characters.length === 0) {
        characterGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 4rem;">No matching entities found.</p>';
        return;
    }
    
    characterGrid.innerHTML = characters.map(char => `
        <div class="card" onclick="openCharacterModal(${char.rawId || char.id}, '${escapeHtml(char.name)}')">
            ${char.avatar ? `<img src="${char.avatar}" alt="${char.name}" class="card-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%231e293b%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%238b5cf6%27 font-size=%2732%27 font-family=%27sans-serif%27 font-weight=%27bold%27%3E${char.name.charAt(0)}%3C/text%3E%3C/svg%3E'">` : `<div class="card-avatar" style="background: var(--bg-soft); display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 2.5rem; font-weight: bold;">${char.name.charAt(0)}</div>`}
            <div class="card-name">${char.name} ${char.isStar ? '✨' : ''}</div>
            <div class="card-desc">${char.desc || char.shortDesc || 'Elite AI entity data ready for extraction.'}</div>
            <div class="card-badge">${char.shortDesc || 'Classified'}</div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();
    clearSearchBtn.classList.toggle('show', query !== '');
    
    const filtered = allCharacters.filter(char => 
        char.name.toLowerCase().includes(query) ||
        (char.desc && char.desc.toLowerCase().includes(query)) ||
        (char.shortDesc && char.shortDesc.toLowerCase().includes(query))
    );
    displayCharacters(filtered);
}

function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.classList.remove('show');
    displayCharacters(allCharacters);
}

function openCharacterModal(id, name) {
    currentCharacter = { id, name };
    modalTitle.textContent = name;
    characterInfo.innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">IDENTIFIER</div>
                <div class="info-value">${id}</div>
            </div>
            <div class="info-item">
                <div class="info-label">DESIGNATION</div>
                <div class="info-value">${name}</div>
            </div>
        </div>
    `;
    detailsSection.style.display = 'none';
    fetchDetailsSection.style.display = 'block';
    characterModal.classList.add('show');
}

async function fetchCharacterDetails() {
    if (!currentCharacter) return;
    try {
        fetchDetailsBtn.disabled = true;
        fetchDetailsBtn.textContent = 'DECRYPTING...';
        const response = await fetch(`${API_BASE}/character/${currentCharacter.id}`);
        const result = await response.json();
        if (result.success) {
            currentCharacter = result.data;
            displayCharacterDetails(result.data);
            fetchDetailsSection.style.display = 'none';
            detailsSection.style.display = 'block';
            showToast('Access granted.', 'success');
        }
    } catch (error) {
        showToast('Access denied.', 'error');
    } finally {
        fetchDetailsBtn.disabled = false;
        fetchDetailsBtn.textContent = 'UNLOCK SYSTEM PROMPT';
    }
}

function displayCharacterDetails(char) {
    characterDetails.innerHTML = `
        <div class="info-grid" style="margin-bottom: 2rem;">
            <div class="info-item">
                <div class="info-label">DESCRIPTION</div>
                <div class="info-value">${char.desc || 'No data.'}</div>
            </div>
            ${char.helloTip ? `<div class="info-item">
                <div class="info-label">INITIALIZATION MESSAGE</div>
                <div class="info-value">${char.helloTip}</div>
            </div>` : ''}
        </div>
    `;
    systemPrompt.textContent = char.systemPrompt || 'Encrypted or unavailable.';
}

function closeModalFunc() {
    characterModal.classList.remove('show');
    currentCharacter = null;
}

async function copyPrompt() {
    if (!currentCharacter?.systemPrompt) return;
    await navigator.clipboard.writeText(currentCharacter.systemPrompt);
    showToast('Copied to clipboard.', 'success');
}

function downloadJSON() {
    if (!currentCharacter) return;
    const blob = new Blob([JSON.stringify(currentCharacter, null, 2)], { type: 'application/json' });
    saveAs(blob, `${currentCharacter.name}_intel.json`);
}

function downloadTXT() {
    if (!currentCharacter?.systemPrompt) return;
    const blob = new Blob([currentCharacter.systemPrompt], { type: 'text/plain' });
    saveAs(blob, `${currentCharacter.name}_prompt.txt`);
}

function saveAs(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function showToast(message, type) {
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.borderColor = type === 'success' ? 'var(--success)' : 'var(--error)';
    setTimeout(() => toast.style.display = 'none', 3000);
}
