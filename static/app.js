// Global variables
let currentFileText = '';
let lastGeneratedNotes = '';

// Initialize on page load
window.addEventListener('load', () => {
    checkAPIStatus();
    setupFileUpload();
});

// Check API Status
async function checkAPIStatus() {
    const statusBanner = document.getElementById('statusBanner');
    const statusText = document.getElementById('statusText');
    
    try {
        // Ping the backend to check if it's running
        const response = await fetch('/');
        if (response.ok) {
            statusBanner.className = 'status-banner success';
            statusText.textContent = '✅ StudyMate-AI Ready! Powered by Google Gemini';
        } else {
            throw new Error('Backend not responding');
        }
    } catch (error) {
        statusBanner.className = 'status-banner error';
        statusText.textContent = '⚠️ Backend server not available. Please start the Flask server.';
    }
}

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.closest('.tab').classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// File Upload Setup
function setupFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    // Click to upload
    uploadArea.addEventListener('click', (e) => {
        if (e.target !== uploadArea && !uploadArea.contains(e.target)) return;
        fileInput.click();
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileUpload(files[0]);
        }
    });
    
    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileUpload(e.target.files[0]);
        }
    });
}

// Handle file upload
async function handleFileUpload(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    const summarizeInput = document.getElementById('summarizeInput');
    
    // Validate file
    if (!file.name.match(/\.(pdf|txt)$/i)) {
        showError(document.getElementById('summarizeOutput'), 'Please upload a PDF or TXT file');
        return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
        showError(document.getElementById('summarizeOutput'), 'File size must be less than 10MB');
        return;
    }
    
    // Show loading
    fileName.textContent = `📤 Uploading ${file.name}...`;
    fileInfo.classList.remove('hidden');
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentFileText = result.text;
            summarizeInput.value = result.text;
            fileName.textContent = `✅ ${result.filename} (${Math.round(file.size / 1024)}KB)`;
            
            // Auto-scroll to textarea
            summarizeInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showError(document.getElementById('summarizeOutput'), `Upload failed: ${error.message}`);
        fileInfo.classList.add('hidden');
    }
}

// Clear uploaded file
function clearFile() {
    const fileInfo = document.getElementById('fileInfo');
    const fileInput = document.getElementById('fileInput');
    const summarizeInput = document.getElementById('summarizeInput');
    
    fileInfo.classList.add('hidden');
    fileInput.value = '';
    currentFileText = '';
    if (summarizeInput.value === currentFileText) {
        summarizeInput.value = '';
    }
}

// Summarize Text
async function summarizeText() {
    const input = document.getElementById('summarizeInput').value;
    const output = document.getElementById('summarizeOutput');
    const type = document.getElementById('summaryType').value;
    const length = document.getElementById('summaryLength').value;
    const format = document.getElementById('summaryFormat').value;
    
    if (!input.trim()) {
        showError(output, 'Please enter text or upload a file to summarize');
        return;
    }
    
    showLoading(output);
    
    try {
        const response = await fetch('/api/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: input,
                type: type,
                length: length,
                format: format
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResult(output, result.summary);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        showError(output, `Error: ${error.message}`);
    }
}

// Write Professional Notes
async function writeNotes() {
    const input = document.getElementById('writeInput').value;
    const context = document.getElementById('writeContext').value;
    const output = document.getElementById('writeOutput');
    const tone = document.getElementById('writeTone').value;
    const length = document.getElementById('writeLength').value;
    const structure = document.getElementById('writeStructure').value;
    
    if (!input.trim()) {
        showError(output, 'Please enter a topic or prompt');
        return;
    }
    
    showLoading(output);
    
    try {
        const response = await fetch('/api/write', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic: input,
                context: context,
                tone: tone,
                length: length,
                structure: structure
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            lastGeneratedNotes = result.notes;
            showResult(output, result.notes);
            document.getElementById('writeActions').classList.remove('hidden');
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        showError(output, `Error: ${error.message}`);
    }
}

// Expand Notes
async function expandNotes() {
    if (!lastGeneratedNotes) return;
    
    const output = document.getElementById('writeOutput');
    const input = document.getElementById('writeInput').value;
    
    showLoading(output);
    
    try {
        const response = await fetch('/api/expand', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic: input,
                notes: lastGeneratedNotes
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            lastGeneratedNotes = result.notes;
            showResult(output, result.notes);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        showError(output, `Error: ${error.message}`);
    }
}

// Regenerate Notes
function regenerateNotes() {
    writeNotes();
}

// Copy to Clipboard
function copyToClipboard(outputId) {
    const output = document.getElementById(outputId);
    const text = output.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
}

// Translate Text
async function translateText() {
    const input = document.getElementById('translateInput').value;
    const output = document.getElementById('translateOutput');
    const sourceLang = document.getElementById('sourceLanguage').value;
    const targetLang = document.getElementById('targetLanguage').value;
    
    if (!input.trim()) {
        showError(output, 'Please enter text to translate');
        return;
    }
    
    if (sourceLang === targetLang) {
        showError(output, 'Source and target languages must be different');
        return;
    }
    
    showLoading(output);
    
    try {
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: input,
                source: sourceLang,
                target: targetLang
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResult(output, result.translation);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        showError(output, `Error: ${error.message}`);
    }
}

// Proofread Text
async function proofreadText() {
    const input = document.getElementById('proofreadInput').value;
    const output = document.getElementById('proofreadOutput');
    const checkType = document.getElementById('proofreadType').value;
    const format = document.getElementById('proofreadFormat').value;
    
    if (!input.trim()) {
        showError(output, 'Please enter text to proofread');
        return;
    }
    
    showLoading(output);
    
    try {
        const response = await fetch('/api/proofread', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: input,
                type: checkType,
                format: format
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResult(output, result.result);
        } else {
            throw new Error(result.error);
        }
        
    } catch (error) {
        showError(output, `Error: ${error.message}`);
    }
}

// Helper Functions
function showLoading(element) {
    element.className = 'output visible loading';
    element.textContent = '⏳ Processing with Gemini AI...';
}

function showResult(element, text) {
    element.className = 'output visible';
    element.textContent = text;
}

function showError(element, message) {
    element.className = 'output visible error';
    element.textContent = '❌ ' + message;
}