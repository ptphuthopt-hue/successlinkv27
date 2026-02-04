# Successlink - Quick Start Guide

## Running the Application

1. **Start the local server**:
   ```bash
   cd d:/@Github/CSL
   python -m http.server 8080
   ```

2. **Open in browser**: Navigate to `http://localhost:8080`

## Testing the Complete Flow

### Step 1: Onboarding
- Select teaching level (Tiểu học, THCS, or THPT)
- Choose subject from dropdown
- Click "Bắt đầu"

### Step 2: Create Lesson
- Enter lesson title (e.g., "Phép cộng trong phạm vi 100")
- Select content types (Slide, Infographic, Mindmap, Quiz)
- Click "TẠO BÀI GIẢNG"
- Wait for loading animation

### Step 3: View Results
- Navigate through slides using arrow buttons
- Switch between content types using floating dock
- View quiz with answer explanations
- Export quiz to image for Zalo

## Key Features

✅ **Ultra-minimalist UI** - Clean, focused interface
✅ **Level-based customization** - Content automatically adapted
✅ **Quiz with explanations** - Educational feedback for students
✅ **Zalo export** - Share quizzes as images
✅ **Persistent preferences** - Saved in localStorage

## Next Steps

To integrate with real AI:
1. Open `js/ai-service.js`
2. Replace mock functions with actual API calls
3. Add your API key and endpoint
4. Test with real content generation

## File Structure

```
d:/@Github/CSL/
├── index.html              # Main page
├── styles.css              # Design system
├── app.js                  # App initialization
└── js/
    ├── utils.js            # Utilities
    ├── ai-service.js       # AI integration
    ├── onboarding.js       # Onboarding flow
    ├── workspace.js        # Creation workspace
    └── dashboard.js        # Teaching dashboard
```

---

**Note**: The application currently uses a mock AI service for demonstration. All features are fully functional and ready for real AI integration.
