# 🏥 Medical YouTube Optimizer

Advanced AI-powered Chrome extension for analyzing and optimizing medical content on YouTube. Built with SeamlessM4T integration, comprehensive risk assessment, and specialized support for Tamil and Ayurvedic medicine.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome Extension](https://img.shields.io/badge/platform-Chrome%20Extension-yellow.svg)

## 🌟 Features

### 🤖 AI-Powered Analysis

- **SeamlessM4T Integration**: Multilingual speech-to-text and translation
- **Medical Entity Recognition**: Extract medical terms, symptoms, and treatments
- **Sentiment Analysis**: Analyze emotional tone of medical content
- **Content Classification**: Categorize medical content types
- **Risk Assessment**: 4-level risk evaluation (Safe, Caution, Warning, Dangerous)

### 🕉️ Specialized Medical Support

- **Ayurvedic Medicine Analysis**: Detect herbs, treatments, and traditional practices
- **Tamil Language Support**: Native Tamil content analysis and translation
- **Medical Terminology Preservation**: Maintain accuracy during translation
- **Traditional Medicine Integration**: Bridge modern and traditional healthcare

### 🎯 Real-Time Features

- **Auto-Analysis**: Automatic content analysis when videos load
- **Live Risk Indicators**: Visual badges showing content safety levels
- **Medical Term Highlighting**: Interactive highlighting of medical terminology
- **Context Menus**: Right-click analysis of selected text

### 🔧 Advanced Configuration

- **Multiple AI Models**: Choose from various Hugging Face models
- **Customizable Thresholds**: Adjust risk assessment sensitivity
- **Multi-language Settings**: Support for English, Tamil, and Hindi
- **Privacy Controls**: Local processing with optional cloud AI

## 🚀 Quick Start

### Prerequisites

- Google Chrome browser
- Hugging Face account (free) for AI features
- Internet connection for API calls

### Installation

1. **Download the Extension**

   ```bash
   git clone https://github.com/your-repo/medical-youtube-optimizer.git
   cd medical-youtube-optimizer
   ```

2. **Install in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)
   - Click "Load unpacked"
   - Select the extension folder

3. **Run Setup Script** (Windows)

   ```powershell
   .\setup_complete.ps1
   ```

4. **Configure API Key**
   - Get your free API key from [Hugging Face](https://huggingface.co/settings/tokens)
   - Open extension options
   - Enter API key in AI Settings tab
   - Test connection

## 📖 Usage Guide

### Basic Usage

1. **Navigate to YouTube**
   - Go to any YouTube video with medical content
   - The extension automatically detects medical content

2. **Manual Analysis**
   - Click the "🤖 AI Analysis" button in video controls
   - Or use keyboard shortcut: `Ctrl+Shift+M`
   - View comprehensive analysis in overlay

3. **View Results**
   - Risk level indicator appears
   - Medical terms are highlighted
   - Detailed analysis shown in popup

### Advanced Features

#### Tamil Content Analysis

```javascript
// Extension automatically detects Tamil content
// Translates to English while preserving medical terms
// Provides bilingual analysis results
```

#### Ayurvedic Medicine Detection

- Identifies traditional herbs and treatments
- Provides safety information and contraindications
- Links to trusted Ayurvedic sources

#### Risk Assessment Levels

- 🟢 **Safe**: Verified medical information
- 🟡 **Caution**: Requires professional verification
- 🟠 **Warning**: Potentially misleading content
- 🔴 **Dangerous**: Harmful medical advice detected

## ⚙️ Configuration

### General Settings

- **Auto-Analysis**: Enable/disable automatic analysis
- **Risk Warnings**: Show/hide risk indicators
- **Analysis Delay**: Configure auto-analysis timing
- **UI Elements**: Customize interface components

### AI Settings

```json
{
  "apiKey": "hf_your_api_key_here",
  "models": {
    "ner": "distilbert-base-uncased",
    "classification": "microsoft/DialoGPT-medium",
    "sentiment": "cardiffnlp/twitter-roberta-base-sentiment"
  }
}
```

### Language Settings

- **Primary Language**: Auto-detect, English, Tamil, Hindi
- **Translation Provider**: SeamlessM4T, Google, Microsoft
- **Tamil Support**: Enable specialized Tamil analysis

### Advanced Configuration

- **Cache Duration**: How long to store analysis results
- **Max Analysis Length**: Limit text length for processing
- **Debug Mode**: Enable detailed logging
- **Privacy Controls**: Anonymous usage statistics

## 🔧 Technical Architecture

### Core Components

#### Background Script (`background.js`)

- Service worker handling API calls
- Badge management and notifications
- Context menu integration
- Settings synchronization

#### Content Script (`content.js`)

- YouTube page interaction
- Video data extraction
- Real-time UI enhancement
- Medical term highlighting

#### AI Integration (`src/ai/`)

- **SeamlessM4T** (`seamlessM4T.js`): Multilingual translation
- **Medical Analyzer** (`medicalAnalyzer.js`): Content analysis pipeline

#### UI Components

- **Popup** (`popup.html`): Main interface with 6-tab design
- **Options** (`options_new.html`): Comprehensive settings page
- **Overlay**: In-page analysis display

### Data Flow

```
YouTube Video → Content Extraction → AI Analysis → Risk Assessment → User Display
     ↓              ↓                    ↓             ↓              ↓
Video Data    Text/Captions    Medical Entities   Risk Level    Visual Indicators
```

## 🔒 Privacy & Security

### Data Handling

- **Local Processing**: Settings stored locally in Chrome
- **API Calls**: Only content text sent to Hugging Face APIs
- **No Personal Data**: No user information collected or stored
- **Secure Communication**: HTTPS-only API connections

### API Security

- API keys encrypted in local storage
- Rate limiting and error handling
- Optional anonymous usage analytics
- GDPR compliant data processing

## 🧪 Development

### Project Structure

```
medical-youtube-optimizer/
├── manifest.json              # Extension manifest
├── background.js              # Service worker
├── content.js                 # Content script
├── popup.html/js/css         # Main UI
├── options_new.html/js       # Settings page
├── src/
│   ├── ai/
│   │   ├── seamlessM4T.js    # Translation engine
│   │   └── medicalAnalyzer.js # Analysis pipeline
│   └── utils/
│       ├── ayurvedicDatabase.js
│       ├── tamilTranslator.js
│       └── youtubeSourceVerifier.js
└── icons/                    # Extension icons
```

### Building from Source

1. Clone the repository
2. Install dependencies (if any)
3. Load unpacked in Chrome
4. Configure API credentials

### Testing

- Unit tests for AI components
- Integration tests for YouTube interaction
- Manual testing on various video types
- Performance testing with large transcripts

## 🤝 Contributing

### Guidelines

1. Follow existing code style and patterns
2. Add tests for new features
3. Update documentation
4. Test with various medical content types

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-repo/medical-youtube-optimizer.git

# Install development dependencies (if any)
npm install

# Load extension in Chrome
# chrome://extensions/ → Load unpacked
```

## 📋 Roadmap

### Current Version (1.0.0)

- ✅ Basic AI analysis pipeline
- ✅ SeamlessM4T integration
- ✅ Tamil language support
- ✅ Ayurvedic medicine detection
- ✅ Risk assessment system

### Upcoming Features (1.1.0)

- 🔄 Real-time transcript analysis
- 🔄 Voice analysis capabilities
- 🔄 Medical fact-checking
- 🔄 Doctor verification system
- 🔄 Community contributions

### Future Plans (2.0.0)

- 📱 Mobile app integration
- 🤖 Advanced AI models
- 🌍 Multi-platform support
- 📊 Analytics dashboard
- 🔗 Healthcare provider integration

## 🐛 Troubleshooting

### Common Issues

#### Extension Not Loading

- Check Chrome Developer mode is enabled
- Verify all required files are present
- Check console for error messages

#### API Connection Fails

- Verify Hugging Face API key is correct
- Check internet connection
- Ensure API quota is not exceeded

#### Analysis Not Working

- Confirm video has captions/transcript
- Check if content is in supported language
- Verify extension permissions

#### Performance Issues

- Reduce max analysis length in settings
- Clear cache periodically
- Disable auto-analysis for better performance

### Debug Mode

Enable Debug Mode in Advanced Settings for detailed logging:

```javascript
// Check console for detailed logs
console.log('Medical Optimizer Debug Info');
```

### Support Channels

- GitHub Issues for bug reports
- Documentation wiki for guides
- Chrome Web Store reviews for feedback

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hugging Face** for AI model hosting
- **SeamlessM4T** for multilingual capabilities
- **YouTube** for platform integration
- **Ayurvedic Medicine Community** for traditional knowledge
- **Tamil Language Experts** for linguistic support

## 📞 Contact

- **Issues**: GitHub Issues page
- **Documentation**: Project Wiki
- **Updates**: Chrome Web Store
- **Community**: Discussion forums

---

**⚠️ Medical Disclaimer**: This extension is for informational purposes only. Always consult qualified healthcare professionals for medical advice. The AI analysis should not replace professional medical consultation.

Built with ❤️ for the medical community
