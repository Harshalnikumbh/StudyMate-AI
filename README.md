# 🎓 StudyMate-AI

**Your Intelligent Study Companion Powered by Google Gemini**

StudyMate-AI is an all-in-one AI-powered study tool designed to help students summarize documents, write professional notes, translate text, and proofread essays—all in one place.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-3.0.0-green.svg)
![Gemini](https://img.shields.io/badge/Google-Gemini%20AI-orange.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

---

## 🌟 Features

### 📄 Smart Summarizer
- Upload PDF or TXT files (up to 10MB, 50 pages)
- Paste text directly for instant summarization
- Multiple summary types: Key Points, TL;DR, Teaser, Headline
- Adjustable length: Short, Medium, Long
- Output formats: Paragraphs or Bullet Points

### ✏️ Professional Note Writer
- Generate comprehensive study notes on any topic
- Multiple writing styles: Academic, Professional, Casual, Detailed
- Structured formats: Intro-Body-Conclusion, Point-by-Point, Problem-Solution
- Expand existing notes with one click
- Regenerate for different perspectives

### 🌐 Multi-Language Translator
- Translate text between 8+ languages
- Supports: English, Spanish, French, German, Chinese, Japanese, Hindi, Arabic
- Powered by Google Translator API
- Instant, accurate translations

### 🖊️ Grammar Proofreader
- Comprehensive grammar and spelling checks
- Choose check type: Comprehensive, Grammar Only, Spelling Only
- Output options: Corrected Text or Detailed Suggestions
- Perfect for essays and assignments

---

## 🚀 Live Demo

Check out the live application: [StudyMate-AI on Render](https://studymate-ai-a6v8.onrender.com)

---

## 🛠️ Tech Stack

- **Backend:** Flask (Python)
- **AI Model:** Google Gemini 2.0 Flash
- **Translation:** Google Translator (deep-translator)
- **PDF Processing:** PyPDF2
- **Frontend:** HTML, CSS, JavaScript
- **Deployment:** Render

---

## 📋 Prerequisites

- Python 3.8 or higher
- Google Gemini API Key (free tier available)
- Git

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/StudyMate-AI.git
cd StudyMate-AI
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up API Key

Get your free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

Create a `.env` file or set environment variable:

```bash
# Option 1: Environment Variable (Recommended for deployment)
export GEMINI_API_KEY='your_api_key_here'

# Option 2: Direct in app.py (for local testing only)
# Update line 18 in app.py with your key
```

### 5. Run the Application

```bash
python app.py
```

Visit `http://localhost:5000` in your browser.

---

## 📁 Project Structure

```
StudyMate-AI/
│
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── Procfile              # Deployment configuration
│
├── templates/
│   └── index.html        # Main HTML template
│
├── static/
│   ├── style.css         # Styling
│   └── app.js            # Frontend JavaScript
│
└── uploads/              # Temporary file storage (auto-created)
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API Key | Yes |
| `PORT` | Application port (default: 5000) | No |

### API Limits (Free Tier)

- **gemini-2.0-flash**: 15 requests/minute
- **Daily limit**: 1,500 requests
- **File size**: Max 10MB
- **PDF pages**: Max 50 pages

---

## 🚀 Deployment

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on [Render](https://render.com)
3. Connect your repository
4. Add environment variable: `GEMINI_API_KEY`
5. Deploy!

**Build Command:** `pip install -r requirements.txt`  
**Start Command:** `gunicorn app:app`

### Deploy to Other Platforms

The app is compatible with:
- Heroku
- Railway
- Fly.io (requires credit card)
- Any platform supporting Python/Flask

---

## 📱 Usage

### Summarize Documents

1. Navigate to **Smart Summarizer** tab
2. Upload PDF/TXT or paste text
3. Choose summary type, length, and format
4. Click **Generate Summary**

### Write Notes

1. Go to **Note Writer** tab
2. Enter topic and optional context
3. Select writing style and structure
4. Click **Generate Professional Notes**
5. Use **Expand** or **Regenerate** as needed

### Translate Text

1. Open **Translator** tab
2. Enter text to translate
3. Select source and target languages
4. Click **Translate**

### Proofread Essays

1. Visit **Proofreader** tab
2. Paste your essay or text
3. Choose check type and output format
4. Click **Check Grammar**

---

## 🎯 Features in Development

- [ ] Export summaries as PDF
- [ ] Save notes to cloud storage
- [ ] Multi-file batch processing
- [ ] Voice input support
- [ ] More language support
- [ ] Chrome extension integration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Harshal Nikumbh**

- GitHub: [@harshalnikumbh](https://github.com/harshalnikumbh)
- LinkedIn: [Harshal Ravindra Nikumbh](https://www.linkedin.com/in/harshalravindranikumbh)
- Instagram: [@harshalnikumbh._](https://www.instagram.com/harshalnikumbh._)

---

## 🙏 Acknowledgments

- Google Gemini AI for powerful language models
- Flask community for excellent documentation
- All contributors and users of StudyMate-AI

---

## 📞 Support

If you encounter any issues or have questions:

1. Check existing [Issues](https://github.com/yourusername/StudyMate-AI/issues)
2. Create a new issue with detailed description
3. Contact: harshalnikumbh305@gmail.com

---

## ⭐ Show Your Support

If you find this project helpful, please give it a ⭐️ on GitHub!

---

**Made with ❤️ by Harshal Nikumbh**
