# Quick Start Guide

## Installation & Setup

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Server
```bash
npm start
```

Server will start on `http://localhost:3000`

### Step 3: Open in Browser
Open your browser and go to: `http://localhost:3000`

## How to Use

1. **Browse Characters**: All characters will automatically load when you open the page
2. **Search**: Type in the search bar to find characters by name or description
3. **View Details**: Click on any character card to see their full details
4. **Extract Prompt**: The system prompt will be displayed in a formatted view
5. **Export**: Use the buttons to:
   - Copy prompt to clipboard
   - Download as JSON
   - Download as TXT

## Features

✅ Dynamic character loading from aichattings.com
✅ Real-time search functionality
✅ System prompt extraction
✅ Export options (JSON/TXT)
✅ Responsive design
✅ Caching for faster loads

## Troubleshooting

**Port already in use?**
- Change PORT in server.js (default: 3000)

**Characters not loading?**
- Check your internet connection
- Verify aichattings.com API is accessible
- Check browser console for errors

**CORS errors?**
- Make sure you're accessing via localhost
- Server includes CORS middleware

## Development

For development with auto-reload:
```bash
npm run dev
```
