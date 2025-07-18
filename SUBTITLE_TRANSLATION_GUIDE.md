# Medical YouTube Extension - Subtitle Extraction & Translation

## Overview

This extension now supports automatic subtitle extraction from YouTube videos with multi-language support. When transcripts are not available, the system will:

1. **Extract browser subtitles** using multiple fallback methods
2. **Detect the language** of the extracted content
3. **Translate to English** if needed using free Hugging Face models
4. **Perform medical analysis** on the English text
5. **Display personalized risk assessment** based on user health profile

## Key Features

### 🎬 Advanced Subtitle Extraction
- **Transcript Panel Detection** - Checks for existing YouTube transcript
- **Video Caption Extraction** - Captures live captions from video player
- **YouTube Internal Data** - Accesses internal caption tracks
- **Auto-Enable Captions** - Automatically enables captions if available
- **Multi-language Support** - Handles 16+ languages

### 🌍 Language Detection & Translation
- **Automatic Language Detection** using `facebook/fasttext-language-identification`
- **Free Translation** using `Helsinki-NLP/opus-mt-mul-en`
- **Fallback Handling** - Uses original text if translation fails
- **Translation Transparency** - Shows users what was translated

### 🏥 Medical Analysis
- **Medical Entity Recognition** using `d4data/biomedical-ner-all`
- **Health Claim Extraction** using `microsoft/BiomedNLP-PubMedBERT`
- **Personalized Risk Assessment** based on user health profile
- **Drug Interaction Checking** with user medications
- **Condition Contraindication** warnings

## Workflow

### 1. User Interaction
```javascript
// User clicks "Analyze Video" in popup
const analysisResult = await medicalAnalyzer.analyzeVideoTranscript(tabId);
```

### 2. Subtitle Extraction
```javascript
// Content script extracts subtitles with fallbacks
const subtitleData = await subtitleExtractor.extractSubtitles();
// Returns: { text, language, method, metadata }
```

### 3. Language Processing
```javascript
// Detect language if not already known
const detectedLang = await medicalAnalyzer.detectLanguage(transcript);

// Translate to English if needed
if (detectedLang !== 'en') {
  const translatedText = await medicalAnalyzer.translateToEnglish(transcript, detectedLang);
}
```

### 4. Medical Analysis
```javascript
// Extract medical entities and health claims
const healthClaims = await medicalAnalyzer.extractHealthClaims(englishTranscript);

// Assess personalized risk
const riskAssessment = medicalAnalyzer.assessPersonalizedRisk(healthClaims, userProfile);
```

### 5. Results Display
```javascript
// Show comprehensive analysis with translation info
return {
  healthClaims,
  riskAssessment,
  channelCredibility,
  translationInfo: { originalLanguage, translated: true },
  videoMetadata,
  subtitleMethod
};
```

## Hugging Face Models Used

### Medical Analysis
- **`d4data/biomedical-ner-all`** - Medical named entity recognition
- **`microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext`** - Medical text understanding

### Language Processing
- **`facebook/fasttext-language-identification`** - Language detection
- **`Helsinki-NLP/opus-mt-mul-en`** - Multi-language to English translation

## Configuration

### API Setup
1. Get free Hugging Face API token from [huggingface.co](https://huggingface.co)
2. Go to Settings → Access Tokens
3. Create new token with "Read" permissions
4. Enter token in extension settings

### Health Profile
1. Open extension popup
2. Go to "Profile" tab
3. Enter medications and conditions
4. Data is encrypted and stored locally

## Error Handling

### Subtitle Extraction Failures
- **No captions available** - Shows helpful message to user
- **Caption loading timeout** - Falls back to alternative methods
- **Content script errors** - Provides fallback suggestions

### Translation Failures
- **API errors** - Uses original text with warning
- **Unsupported language** - Attempts analysis in original language
- **Rate limiting** - Shows retry suggestion

### Medical Analysis Failures
- **Missing API key** - Directs user to setup
- **Model loading errors** - Shows status and retry option
- **Network issues** - Provides offline suggestions

## Privacy & Security

### Data Protection
- **Health data never leaves browser** - Only video transcripts sent to HF
- **Local encryption** - Health profile encrypted in browser storage
- **No tracking** - No user data collection or analytics
- **Open source models** - Transparent AI processing

### API Usage
- **Free tier friendly** - Optimized for HF free tier limits
- **Minimal data transfer** - Only necessary text sent for analysis
- **No data retention** - HF models don't store processed data

## Testing

### Manual Testing
1. Navigate to YouTube video with captions
2. Open extension popup
3. Set up health profile and API key
4. Click "Analyze Video"
5. Check results for translation info and medical analysis

### Console Testing
```javascript
// Load test script in browser console
// Run comprehensive test
medicalExtensionTest.runFullTest();
```

## Troubleshooting

### Common Issues

**"Could not extract subtitles"**
- Enable captions manually on YouTube
- Check if video has captions available
- Try refreshing the page

**"Translation failed"**
- Check Hugging Face API key
- Verify internet connection
- Try again (may be rate limited)

**"Medical analysis failed"**
- Ensure API key is configured
- Check if transcript was extracted
- Verify health profile is set up

### Debug Information
Extension provides detailed logging:
- Subtitle extraction method used
- Language detection results
- Translation success/failure
- Medical entity extraction results
- Risk assessment factors

## Future Enhancements

### Planned Features
- **More languages** - Expand translation support
- **Better models** - Upgrade to newer medical LLMs
- **Offline mode** - Local processing for basic analysis
- **Export reports** - Save analysis results
- **Community feedback** - User rating system

### Performance Optimizations
- **Caching** - Store translated content
- **Batch processing** - Handle multiple videos
- **Smart retries** - Intelligent error recovery
- **Model selection** - Choose optimal models per language

## Contributing

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Build extension: `npm run build`
4. Load in Chrome developer mode

### Adding Language Support
1. Update `supportedLanguages` in `subtitleExtractor.js`
2. Add language patterns in `detectLanguageFromCaptions`
3. Test with videos in target language
4. Update documentation

### Contributing Medical Data
1. Add trusted channels to `medicalDatabase.js`
2. Expand drug interaction database
3. Add condition contraindications
4. Test with medical content

## License

This project is open source under MIT license. All medical data should be verified with healthcare professionals.
