const API_BASE = '/api';

let allCharacters = [];
let currentCharacter = null;

// DOM Elements
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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadCharacters();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    closeModal.addEventListener('click', closeModalFunc);
    modalBackdrop.addEventListener('click', closeModalFunc);
    fetchDetailsBtn.addEventListener('click', fetchCharacterDetails);
    copyPromptBtn.addEventListener('click', copyPrompt);
    downloadJSONBtn.addEventListener('click', downloadJSON);
    downloadTXTBtn.addEventListener('click', downloadTXT);
    
    // Close modal on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && characterModal.classList.contains('show')) {
            closeModalFunc();
        }
    });
}

// Load characters (lightweight - no details)
async function loadCharacters() {
    try {
        loading.classList.add('show');
        characterGrid.innerHTML = '';
        
        const response = await fetch(`${API_BASE}/characters`);
        const result = await response.json();
        
        if (result.success) {
            allCharacters = result.data;
            displayCharacters(allCharacters);
            showToast(`Loaded ${allCharacters.length} characters`, 'success');
        } else {
            showToast('Failed to load characters', 'error');
        }
    } catch (error) {
        console.error('Error loading characters:', error);
        showToast('Error loading characters', 'error');
    } finally {
        loading.classList.remove('show');
    }
}

// Display characters
function displayCharacters(characters) {
    if (characters.length === 0) {
        characterGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 2rem;">No characters found</p>';
        return;
    }
    
    characterGrid.innerHTML = characters.map(char => `
        <div class="card" onclick="openCharacterModal(${char.rawId || char.id}, '${escapeHtml(char.name)}')">
            ${char.avatar ? `<img src="${char.avatar}" alt="${char.name}" class="card-avatar" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2780%27 height=%2780%27%3E%3Crect fill=%27%231e293b%27 width=%2780%27 height=%2780%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%236366f1%27 font-size=%2724%27%3E${char.name.charAt(0)}%3C/text%3E%3C/svg%3E'">` : `<div class="card-avatar" style="background: var(--bg-light); display: flex; align-items: center; justify-content: center; color: var(--primary); font-size: 1.5rem; font-weight: bold;">${char.name.charAt(0)}</div>`}
            <div class="card-name">
                ${char.name}
                ${char.isStar ? '<span class="star">⭐</span>' : ''}
            </div>
            <div class="card-desc">${char.desc || char.shortDesc || 'No description'}</div>
            <div class="card-badge">${char.shortDesc || 'Character'}</div>
        </div>
    `).join('');
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Search
function handleSearch(e) {
    const query = e.target.value.trim();
    
    if (query === '') {
        displayCharacters(allCharacters);
        clearSearchBtn.classList.remove('show');
        return;
    }
    
    clearSearchBtn.classList.add('show');
    
    clearTimeout(handleSearch.timeout);
    handleSearch.timeout = setTimeout(async () => {
        try {
            const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
            const result = await response.json();
            
            if (result.success) {
                displayCharacters(result.data);
            }
        } catch (error) {
            const filtered = allCharacters.filter(char => 
                char.name.toLowerCase().includes(query.toLowerCase()) ||
                (char.desc && char.desc.toLowerCase().includes(query.toLowerCase())) ||
                (char.shortDesc && char.shortDesc.toLowerCase().includes(query.toLowerCase()))
            );
            displayCharacters(filtered);
        }
    }, 300);
}

function clearSearch() {
    searchInput.value = '';
    clearSearchBtn.classList.remove('show');
    displayCharacters(allCharacters);
}

// Open modal (lightweight - no details loaded)
function openCharacterModal(id, name) {
    currentCharacter = { id, name };
    modalTitle.textContent = name;
    
    characterInfo.innerHTML = `
        <div class="info-item">
            <div class="info-label">Character</div>
            <div class="info-value">${name}</div>
        </div>
        <div class="info-item">
            <div class="info-label">ID</div>
            <div class="info-value">${id}</div>
        </div>
    `;
    
    // Hide details section, show fetch button
    detailsSection.style.display = 'none';
    fetchDetailsSection.style.display = 'block';
    
    characterModal.classList.add('show');
}

// Fetch character details (on button click)
async function fetchCharacterDetails() {
    if (!currentCharacter) return;
    
    try {
        fetchDetailsBtn.classList.add('loading');
        fetchDetailsBtn.disabled = true;
        fetchDetailsBtn.innerHTML = '<span>⏳ Loading...</span>';
        
        const response = await fetch(`${API_BASE}/character/${currentCharacter.id}`);
        const result = await response.json();
        
        if (result.success) {
            currentCharacter = result.data;
            displayCharacterDetails(result.data);
            fetchDetailsSection.style.display = 'none';
            detailsSection.style.display = 'block';
            showToast('Details loaded successfully!', 'success');
        } else {
            showToast('Failed to load details', 'error');
        }
    } catch (error) {
        console.error('Error loading character:', error);
        showToast('Error loading details', 'error');
    } finally {
        fetchDetailsBtn.classList.remove('loading');
        fetchDetailsBtn.disabled = false;
        fetchDetailsBtn.innerHTML = '<span>🔍 Fetch Details & System Prompt</span>';
    }
}

// Display character details
function displayCharacterDetails(char) {
    characterDetails.innerHTML = `
        ${char.desc ? `
        <div class="info-item">
            <div class="info-label">Description</div>
            <div class="info-value">${char.desc}</div>
        </div>
        ` : ''}
        ${char.shortDesc ? `
        <div class="info-item">
            <div class="info-label">Category</div>
            <div class="info-value">${char.shortDesc}</div>
        </div>
        ` : ''}
        ${char.helloTip ? `
        <div class="info-item">
            <div class="info-label">Hello Message</div>
            <div class="info-value">${char.helloTip}</div>
        </div>
        ` : ''}
    `;
    
    if (char.systemPrompt) {
        // Format prompt for easy copy-paste
        const formattedPrompt = formatPromptForCopy(char.systemPrompt);
        systemPrompt.textContent = formattedPrompt;
        
        const promptLength = char.systemPrompt.length;
        const header = document.querySelector('.prompt-header h3');
        if (header) {
            header.innerHTML = `System Prompt <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: normal;">(${promptLength.toLocaleString()} chars)</span>`;
        }
    } else {
        systemPrompt.textContent = 'System prompt not available';
    }
}

// Format prompt for easy copy-paste
function formatPromptForCopy(prompt) {
    // Clean up the prompt - remove extra spaces, normalize line breaks
    return prompt
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}

function closeModalFunc() {
    characterModal.classList.remove('show');
    currentCharacter = null;
    detailsSection.style.display = 'none';
    fetchDetailsSection.style.display = 'block';
}

// Copy prompt
async function copyPrompt() {
    if (!currentCharacter || !currentCharacter.systemPrompt) {
        showToast('No prompt to copy', 'error');
        return;
    }
    
    try {
        const formatted = formatPromptForCopy(currentCharacter.systemPrompt);
        await navigator.clipboard.writeText(formatted);
        showToast('Copied to clipboard!', 'success');
    } catch (error) {
        const textarea = document.createElement('textarea');
        textarea.value = formatPromptForCopy(currentCharacter.systemPrompt);
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Copied to clipboard!', 'success');
    }
}

// Download JSON
function downloadJSON() {
    if (!currentCharacter) {
        showToast('No data to download', 'error');
        return;
    }
    
    const data = {
        character: {
            name: currentCharacter.name,
            role_id: currentCharacter.rawId || currentCharacter.id,
            shortDesc: currentCharacter.shortDesc,
            description: currentCharacter.desc,
            helloMessage: currentCharacter.helloTip,
            systemPrompt: currentCharacter.systemPrompt
        },
        source: {
            website: "aichattings.com",
            extractedDate: new Date().toISOString().split('T')[0]
        }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCharacter.name.replace(/[^a-z0-9]/gi, '_')}_prompt.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded JSON!', 'success');
}

// Download TXT
function downloadTXT() {
    if (!currentCharacter || !currentCharacter.systemPrompt) {
        showToast('No prompt to download', 'error');
        return;
    }
    
    const content = `SYSTEM PROMPT FOR ${currentCharacter.name.toUpperCase()}
${'='.repeat(60)}

Character: ${currentCharacter.name}
Role ID: ${currentCharacter.rawId || currentCharacter.id}
Description: ${currentCharacter.desc || 'No description'}

${currentCharacter.helloTip ? `Hello Message:\n${currentCharacter.helloTip}\n\n` : ''}
${'='.repeat(60)}

FULL SYSTEM PROMPT:
${'='.repeat(60)}

${formatPromptForCopy(currentCharacter.systemPrompt)}

${'='.repeat(60)}
Extracted from: aichattings.com
Date: ${new Date().toISOString().split('T')[0]}
`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentCharacter.name.replace(/[^a-z0-9]/gi, '_')}_prompt.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded TXT!', 'success');
}

// Toast
function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Global function
window.openCharacterModal = openCharacterModal;
