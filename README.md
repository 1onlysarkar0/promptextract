# AI Characters System Prompt Extractor

A dynamic web application to browse, search, and extract system prompts from characters on aichattings.com.

## Features

- 🔍 **Dynamic Character Loading** - Automatically loads all characters from aichattings.com
- 🔎 **Search Functionality** - Search characters by name, description, or category
- 📋 **System Prompt Extraction** - Click any character to view and extract their system prompt
- 💾 **Export Options** - Download prompts as JSON or TXT files
- 📱 **Responsive Design** - Works on desktop and mobile devices
- ⚡ **Caching** - Fast loading with intelligent caching

## Installation

### Option 1: Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Option 2: Docker Deployment

**Using Docker Compose (Recommended):**
```bash
docker-compose up -d
```

**Using Docker directly:**
```bash
# Build image
docker build -t character-prompts .

# Run container
docker run -d -p 3000:3000 --name character-prompts character-prompts
```

The app will be available at `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Wait for characters to load (first load may take a few seconds)
3. Use the search bar to find specific characters
4. Click on any character card to view their details and system prompt
5. Use the action buttons to:
   - Copy the system prompt to clipboard
   - Download as JSON file
   - Download as TXT file

## API Endpoints

- `GET /api/characters` - Get all characters
- `GET /api/character/:id` - Get character details by ID
- `GET /api/search?q=query` - Search characters

## Project Structure

```
.
├── server.js              # Express backend server
├── package.json           # Dependencies and scripts
├── public/                # Frontend files
│   ├── index.html        # Main HTML file
│   ├── styles.css        # CSS styles
│   └── app.js            # Frontend JavaScript
└── README.md             # This file
```

## Features in Detail

### Character Grid
- Displays all characters in a responsive grid
- Shows character avatar, name, and description
- Star badge for featured characters

### Character Detail Modal
- Full character information
- Formatted system prompt display
- Hello message preview
- Export options

### Search
- Real-time search as you type
- Searches across name, description, and category
- Debounced for performance

### Caching
- Characters list cached for 1 hour
- Individual character details cached
- Reduces API calls and improves speed

## Technologies Used

- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **HTTP Client**: Axios
- **Caching**: node-cache

## Notes

- The application fetches data from aichattings.com's public API
- First load may take a few seconds to fetch all characters
- System prompts are cached to reduce API calls
- All data is fetched dynamically - no hardcoded characters

## License

MIT
