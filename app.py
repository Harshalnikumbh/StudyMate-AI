from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import PyPDF2
from werkzeug.utils import secure_filename
import google.generativeai as genai
from deep_translator import GoogleTranslator

app = Flask(__name__, static_folder='static', template_folder='templates')

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'txt'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

GEMINI_API_KEY = 'AIzaSyDRv4lCHDLyHdhUTL3_Q-e-w7mSI_Ijk90'

# Initialize Gemini AI
genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel('gemini-2.0-flash')

# Create necessary directories
# if not os.path.exists('templates'):
#     os.makedirs('templates')
# if not os.path.exists('static/css'):
#     os.makedirs('static/css')
# if not os.path.exists('static/js'):
#     os.makedirs('static/js')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF file efficiently"""
    try:
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            max_pages = min(len(pdf_reader.pages), 50)
            
            for page_num in range(max_pages):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
                
        return text.strip()
    except Exception as e:
        return f"Error reading PDF: {str(e)}"

def extract_text_from_txt(file_path):
    """Extract text from TXT file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except Exception as e:
        return f"Error reading TXT: {str(e)}"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    """Handle file upload and text extraction"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file type. Only PDF and TXT allowed'}), 400
    
    try:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        if filename.lower().endswith('.pdf'):
            text = extract_text_from_pdf(file_path)
        else:
            text = extract_text_from_txt(file_path)
        
        os.remove(file_path)
        
        return jsonify({
            'success': True,
            'text': text,
            'filename': filename
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/summarize', methods=['POST'])
def summarize_text():
    """Summarize text using Gemini API"""
    try:
        data = request.json
        text = data.get('text', '')
        summary_type = data.get('type', 'key-points')
        length = data.get('length', 'medium')
        format_type = data.get('format', 'paragraph')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Limit text length
        max_chars = 30000
        text = text[:max_chars]
        
        # Build prompt based on parameters
        length_map = {
            'short': '3-4 sentences',
            'medium': '1-2 paragraphs',
            'long': '3-4 paragraphs'
        }
        
        if summary_type == 'key-points':
            prompt = f"Extract the key points from the following text in {length_map[length]}:\n\n{text}"
        elif summary_type == 'tl;dr':
            prompt = f"Provide a TL;DR (too long; didn't read) summary in {length_map[length]}:\n\n{text}"
        else:
            prompt = f"Summarize the following text in {length_map[length]}:\n\n{text}"
        
        if format_type == 'bullets':
            prompt += "\n\nFormat the summary as bullet points."
        
        response = model.generate_content(prompt)
        summary = response.text
        
        return jsonify({
            'success': True,
            'summary': summary
        })
        
    except Exception as e:
        return jsonify({'error': f'Summarization failed: {str(e)}'}), 500

@app.route('/api/write', methods=['POST'])
def write_notes():
    """Generate professional notes using Gemini API"""
    try:
        data = request.json
        topic = data.get('topic', '')
        context = data.get('context', '')
        tone = data.get('tone', 'professional')
        length = data.get('length', 'medium')
        structure = data.get('structure', 'intro-body-conclusion')
        
        if not topic:
            return jsonify({'error': 'No topic provided'}), 400
        
        # Build comprehensive prompt
        tone_descriptions = {
            'academic': 'academic and scholarly',
            'professional': 'professional and business-like',
            'casual': 'casual and conversational',
            'detailed': 'detailed and comprehensive'
        }
        
        length_map = {
            'short': '200-300 words',
            'medium': '400-600 words',
            'long': '800-1000 words'
        }
        
        structure_guides = {
            'intro-body-conclusion': 'with a clear introduction, detailed body sections, and a conclusion',
            'point-by-point': 'organized as clear, numbered points with explanations',
            'problem-solution': 'following a problem-solution structure'
        }
        
        prompt = f"""Write {tone_descriptions[tone]} notes about: {topic}

Length: {length_map[length]}
Structure: {structure_guides[structure]}"""
        
        if context:
            prompt += f"\n\nAdditional context: {context}"
        
        prompt += "\n\nProvide well-organized, informative notes suitable for studying or reference."
        
        response = model.generate_content(prompt)
        notes = response.text
        
        return jsonify({
            'success': True,
            'notes': notes
        })
        
    except Exception as e:
        return jsonify({'error': f'Note generation failed: {str(e)}'}), 500

@app.route('/api/expand', methods=['POST'])
def expand_notes():
    """Expand existing notes using Gemini API"""
    try:
        data = request.json
        topic = data.get('topic', '')
        current_notes = data.get('notes', '')
        
        if not current_notes:
            return jsonify({'error': 'No notes provided'}), 400
        
        prompt = f"""Expand and elaborate on these notes about "{topic}":

{current_notes}

Add more details, examples, explanations, and insights. Make it more comprehensive while maintaining the same tone and structure."""
        
        response = model.generate_content(prompt)
        expanded = response.text
        
        return jsonify({
            'success': True,
            'notes': expanded
        })
        
    except Exception as e:
        return jsonify({'error': f'Expansion failed: {str(e)}'}), 500

@app.route('/api/translate', methods=['POST'])
def translate_text():
    """Translate text using Google Translator (free)"""
    try:
        data = request.json
        text = data.get('text', '')
        source_lang = data.get('source', 'en')
        target_lang = data.get('target', 'es')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        if source_lang == target_lang:
            return jsonify({'error': 'Source and target languages must be different'}), 400
        
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        translation = translator.translate(text)
        
        return jsonify({
            'success': True,
            'translation': translation
        })
        
    except Exception as e:
        return jsonify({'error': f'Translation failed: {str(e)}'}), 500

@app.route('/api/proofread', methods=['POST'])
def proofread_text():
    """Proofread text using Gemini API"""
    try:
        data = request.json
        text = data.get('text', '')
        check_type = data.get('type', 'comprehensive')
        format_type = data.get('format', 'suggestions')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Build prompt based on check type
        if format_type == 'corrected':
            if check_type == 'comprehensive':
                prompt = f"Proofread and correct all grammar and spelling errors in this text. Return only the corrected text without explanations:\n\n{text}"
            elif check_type == 'grammar':
                prompt = f"Fix only grammar errors in this text. Return the corrected text:\n\n{text}"
            else:
                prompt = f"Fix only spelling errors in this text. Return the corrected text:\n\n{text}"
        else:
            if check_type == 'comprehensive':
                prompt = f"Review this text and provide a detailed list of grammar and spelling corrections needed:\n\n{text}"
            elif check_type == 'grammar':
                prompt = f"Review this text and list all grammar errors found with suggestions:\n\n{text}"
            else:
                prompt = f"Review this text and list all spelling errors found with corrections:\n\n{text}"
        
        response = model.generate_content(prompt)
        result = response.text
        
        return jsonify({
            'success': True,
            'result': result
        })
        
    except Exception as e:
        return jsonify({'error': f'Proofreading failed: {str(e)}'}), 500

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 StudyMate-AI (Cloud API Version) Starting...")
    print("="*60)
    print("📚 AI Backend: Google Gemini Pro")
    print("🌐 Translation: Google Translator (Free)")
    print("="*60)
    
    # Check if API key is the default placeholder
    if GEMINI_API_KEY == 'YOUR_GEMINI_API_KEY_HERE' or not GEMINI_API_KEY:
        print("\n⚠️  WARNING: GEMINI_API_KEY NOT SET!")
        print("="*60 + "\n")
    else:
        print(f"✅ API Key configured! (Key: {GEMINI_API_KEY[:20]}...)")
        print("="*60 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)