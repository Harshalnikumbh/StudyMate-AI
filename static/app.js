// Global variables
let aiCapabilities = {
    summarizer: false,
    writer: false,
    translator: false,
    proofreader: false
};

let currentFileText = '';
let lastGeneratedNotes = '';

// Initialize on page load
window.addEventListener('load', () => {
    checkAIAvailability();
    setupFileUpload();
});

// Check AI availability
async function checkAIAvailability() {
    const statusBanner = document.getElementById('statusBanner');
    const statusText = document.getElementById('statusText');
    
    try {
        // Check Summarizer API
        if (window.ai && window.ai.summarizer) {
            const available = await window.ai.summarizer.capabilities();
            aiCapabilities.summarizer = available.available === 'readily';
        }
        
        // Check Writer API
        if (window.ai && window.ai.writer) {
            const available = await window.ai.writer.capabilities();
            aiCapabilities.writer = available.available === 'readily';
        }
        
        // Check Translator API
        if (window.ai && window.ai.translator) {
            const available = await window.ai.translator.capabilities();
            aiCapabilities.translator = available.available === 'readily';
        }
        
        // Check Proofreader API (using languageModel)
        if (window.ai && window.ai.languageModel) {
            const available = await window.ai.languageModel.capabilities();
            aiCapabilities.proofreader = available.available === 'readily';
        }
        
        const availableCount = Object.values(aiCapabilities).filter(v => v).length;
        
        if (availableCount > 0) {
            statusBanner.className = 'status-banner success';
            statusText.textContent = `✅ Chrome AI Ready! ${availableCount}/4 APIs available`;
        } else {
            statusBanner.className = 'status-banner error';
            statusText.textContent = '⚠️ Chrome AI not available. Please use Chrome Canary/Dev with AI enabled.';
        }
    } catch (error) {
        statusBanner.className = 'status-banner error';
        statusText.textContent = '⚠️ Chrome AI not available. Please use Chrome Canary/Dev 127+ with flags enabled.';
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
    
    // CPU-friendly: Limit text length
    const maxChars = 50000;
    const textToSummarize = input.length > maxChars ? input.substring(0, maxChars) : input;
    
    if (input.length > maxChars) {
        showError(output, `Text truncated to ${maxChars} characters for CPU efficiency. Processing...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    showLoading(output);
    
    try {
        if (!window.ai || !window.ai.summarizer) {
            throw new Error('Summarizer API not available');
        }
        
        const summarizer = await window.ai.summarizer.create({
            type: type,
            length: length
        });
        
        let summary = await summarizer.summarize(textToSummarize);
        
        // Format as bullets if requested
        if (format === 'bullets' && !summary.includes('•') && !summary.includes('-')) {
            const sentences = summary.split(/[.!?]+/).filter(s => s.trim());
            summary = sentences.map(s => `• ${s.trim()}`).join('\n');
        }
        
        showResult(output, summary);
        summarizer.destroy();
        
    } catch (error) {
        showError(output, `Error: ${error.message}. Ensure Chrome AI is enabled.`);
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
        if (!window.ai || !window.ai.writer) {
            throw new Error('Writer API not available');
        }
        
        // Build enhanced prompt based on structure
        let enhancedPrompt = input;
        
        if (context.trim()) {
            enhancedPrompt += `\n\nAdditional context: ${context}`;
        }
        
        // Add structure guidance
        const structureGuides = {
            'intro-body-conclusion': '\n\nStructure: Start with an introduction, develop the main body with key points, and conclude with a summary.',
            'point-by-point': '\n\nStructure: Present information as clear, organized points with explanations.',
            'problem-solution': '\n\nStructure: Define the problem first, then present solutions and their benefits.'
        };
        
        enhancedPrompt += structureGuides[structure] || '';
        
        // Map tone to writer API options
        const toneMap = {
            'academic': 'formal',
            'professional': 'formal',
            'casual': 'casual',
            'detailed': 'formal'
        };
        
        const writer = await window.ai.writer.create({
            tone: toneMap[tone] || 'neutral',
            length: length
        });
        
        const notes = await writer.write(enhancedPrompt);
        lastGeneratedNotes = notes;
        
        showResult(output, notes);
        document.getElementById('writeActions').classList.remove('hidden');
        
        writer.destroy();
        
    } catch (error) {
        showError(output, `Error: ${error.message}. Ensure Chrome AI is enabled.`);
    }
}

// Expand Notes
async function expandNotes() {
    if (!lastGeneratedNotes) return;
    
    const output = document.getElementById('writeOutput');
    const input = document.getElementById('writeInput').value;
    
    showLoading(output);
    
    try {
        if (!window.ai || !window.ai.writer) {
            throw new Error('Writer API not available');
        }
        
        const writer = await window.ai.writer.create({
            tone: 'formal',
            length: 'long'
        });
        
        const expandedNotes = await writer.write(`Expand and elaborate on this: "${input}"\n\nCurrent notes: ${lastGeneratedNotes}\n\nAdd more details, examples, and explanations.`);
        lastGeneratedNotes = expandedNotes;
        
        showResult(output, expandedNotes);
        writer.destroy();
        
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
        if (!window.ai || !window.ai.translator) {
            throw new Error('Translator API not available');
        }
        
        const canTranslate = await window.ai.translator.canTranslate({
            sourceLanguage: sourceLang,
            targetLanguage: targetLang
        });
        
        if (canTranslate === 'no') {
            throw new Error('Translation not available for selected language pair');
        }
        
        const translator = await window.ai.translator.create({
            sourceLanguage: sourceLang,
            targetLanguage: targetLang
        });
        
        const translation = await translator.translate(input);
        showResult(output, translation);
        
        translator.destroy();
        
    } catch (error) {
        showError(output, `Error: ${error.message}. Try different language pair.`);
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
        if (!window.ai || !window.ai.languageModel) {
            throw new Error('Proofreader API not available');
        }
        
        // Build prompt based on check type
        let prompt = '';
        
        if (format === 'corrected') {
            if (checkType === 'comprehensive') {
                prompt = `Proofread and correct all grammar and spelling errors in this text. Return only the corrected text:\n\n"${input}"`;
            } else if (checkType === 'grammar') {
                prompt = `Fix only grammar errors in this text. Return the corrected text:\n\n"${input}"`;
            } else {
                prompt = `Fix only spelling errors in this text. Return the corrected text:\n\n"${input}"`;
            }
        } else {
            if (checkType === 'comprehensive') {
                prompt = `Review this text and provide a list of grammar and spelling corrections needed:\n\n"${input}"`;
            } else if (checkType === 'grammar') {
                prompt = `Review this text and list grammar errors found:\n\n"${input}"`;
            } else {
                prompt = `Review this text and list spelling errors found:\n\n"${input}"`;
            }
        }
        
        const session = await window.ai.languageModel.create({
            systemPrompt: 'You are an expert grammar and spelling checker. Be precise and helpful.'
        });
        
        const result = await session.prompt(prompt);
        showResult(output, result);
        
        session.destroy();
        
    } catch (error) {
        showError(output, `Error: ${error.message}. Ensure Chrome AI is enabled.`);
    }
}

// Helper Functions
function showLoading(element) {
    element.className = 'output visible loading';
    element.textContent = '⏳ Processing with AI...';
}

function showResult(element, text) {
    element.className = 'output visible';
    element.textContent = text;
}

function showError(element, message) {
    element.className = 'output visible error';
    element.textContent = '❌ ' + message;
}