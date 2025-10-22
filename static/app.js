// Check AI availability on page load
let aiCapabilities = {
    summarizer: false,
    writer: false,
    translator: false,
    proofreader: false
};

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
        
        // Check Proofreader API (using languageModel as fallback)
        if (window.ai && window.ai.languageModel) {
            const available = await window.ai.languageModel.capabilities();
            aiCapabilities.proofreader = available.available === 'readily';
        }
        
        const availableCount = Object.values(aiCapabilities).filter(v => v).length;
        
        if (availableCount > 0) {
            statusBanner.className = 'status-banner success';
            statusText.textContent = `✅ Chrome AI Ready! (${availableCount}/4 APIs available)`;
        } else {
            statusBanner.className = 'status-banner error';
            statusText.textContent = '⚠️ Chrome AI not available. Please use Chrome Canary/Dev with AI enabled.';
        }
    } catch (error) {
        statusBanner.className = 'status-banner error';
        statusText.textContent = '⚠️ Chrome AI not available. Please use Chrome Canary/Dev 127+ with AI enabled.';
    }
}

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// Summarize Text
async function summarizeText() {
    const input = document.getElementById('summarizeInput').value;
    const output = document.getElementById('summarizeOutput');
    const type = document.getElementById('summaryType').value;
    const length = document.getElementById('summaryLength').value;
    
    if (!input.trim()) {
        showError(output, 'Please enter text to summarize');
        return;
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
        
        const summary = await summarizer.summarize(input);
        showResult(output, summary);
        
        summarizer.destroy();
    } catch (error) {
        showError(output, `Error: ${error.message}. Try using Chrome Canary/Dev 127+ with AI enabled.`);
    }
}

// Write Notes
async function writeNotes() {
    const input = document.getElementById('writeInput').value;
    const output = document.getElementById('writeOutput');
    const tone = document.getElementById('writeTone').value;
    const length = document.getElementById('writeLength').value;
    
    if (!input.trim()) {
        showError(output, 'Please enter a topic or prompt');
        return;
    }
    
    showLoading(output);
    
    try {
        if (!window.ai || !window.ai.writer) {
            throw new Error('Writer API not available');
        }
        
        const writer = await window.ai.writer.create({
            tone: tone,
            length: length
        });
        
        const notes = await writer.write(input);
        showResult(output, notes);
        
        writer.destroy();
    } catch (error) {
        showError(output, `Error: ${error.message}. Try using Chrome Canary/Dev with AI enabled.`);
    }
}

// Translate Text
async function translateText() {
    const input = document.getElementById('translateInput').value;
    const output = document.getElementById('translateOutput');
    const targetLang = document.getElementById('targetLanguage').value;
    
    if (!input.trim()) {
        showError(output, 'Please enter text to translate');
        return;
    }
    
    showLoading(output);
    
    try {
        if (!window.ai || !window.ai.translator) {
            throw new Error('Translator API not available');
        }
        
        const canTranslate = await window.ai.translator.canTranslate({
            sourceLanguage: 'en',
            targetLanguage: targetLang
        });
        
        if (canTranslate === 'no') {
            throw new Error('Translation not available for selected language');
        }
        
        const translator = await window.ai.translator.create({
            sourceLanguage: 'en',
            targetLanguage: targetLang
        });
        
        const translation = await translator.translate(input);
        showResult(output, translation);
        
        translator.destroy();
    } catch (error) {
        showError(output, `Error: ${error.message}. Try using Chrome Canary/Dev with AI enabled.`);
    }
}

// Proofread Text
async function proofreadText() {
    const input = document.getElementById('proofreadInput').value;
    const output = document.getElementById('proofreadOutput');
    
    if (!input.trim()) {
        showError(output, 'Please enter text to proofread');
        return;
    }
    
    showLoading(output);
    
    try {
        // Use languageModel API for proofreading
        if (!window.ai || !window.ai.languageModel) {
            throw new Error('Proofreader API not available');
        }
        
        const session = await window.ai.languageModel.create({
            systemPrompt: 'You are a grammar and spelling checker. Fix all errors and return only the corrected text without explanations.'
        });
        
        const corrected = await session.prompt(`Proofread and correct this text: "${input}"`);
        showResult(output, corrected);
        
        session.destroy();
    } catch (error) {
        showError(output, `Error: ${error.message}. Try using Chrome Canary/Dev with AI enabled.`);
    }
}

// Helper functions
function showLoading(element) {
    element.className = 'output visible loading';
    element.textContent = '⏳ Processing...';
}

function showResult(element, text) {
    element.className = 'output visible';
    element.textContent = text;
}

function showError(element, message) {
    element.className = 'output visible error';
    element.textContent = message;
}

// Initialize on page load
window.addEventListener('load', checkAIAvailability);