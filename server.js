const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// Cache for 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static('public'));

// API endpoint to get all characters
app.get('/api/characters', async (req, res) => {
  try {
    const cacheKey = 'all_characters';
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Fetch characters from aichattings.com API
    const response = await axios.get('https://sapi.aichattings.com/vapi/role/list', {
      params: {
        locale: 'en',
        pageSize: 1000
      }
    });

    if (response.data.code === 1 && response.data.data) {
      // Handle different response formats
      let dataArray = response.data.data;
      
      // If data is not an array, check if it's wrapped
      if (!Array.isArray(dataArray)) {
        if (dataArray.data && Array.isArray(dataArray.data)) {
          dataArray = dataArray.data;
        } else if (dataArray.list && Array.isArray(dataArray.list)) {
          dataArray = dataArray.list;
        } else {
          console.error('Unexpected data format:', typeof dataArray);
          return res.status(500).json({ success: false, error: 'Unexpected API response format' });
        }
      }
      
      const characters = dataArray.map(char => ({
        id: char.id,
        rawId: char.attributes?.rawId || char.rawId,
        name: char.attributes?.name || char.name,
        shortDesc: char.attributes?.shortDesc || char.shortDesc,
        desc: char.attributes?.desc || char.desc,
        helloTip: char.attributes?.helloTip || char.helloTip,
        avatar: char.attributes?.avatar?.data?.attributes?.url || char.avatar || null,
        isStar: char.attributes?.isStar || char.isStar || false
      }));

      cache.set(cacheKey, characters);
      res.json({ success: true, data: characters, cached: false });
    } else {
      res.status(500).json({ success: false, error: 'Failed to fetch characters', details: response.data });
    }
  } catch (error) {
    console.error('Error fetching characters:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API endpoint to get character details and system prompt
app.get('/api/character/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `character_${id}`;
    const cached = cache.get(cacheKey);
    
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    // Try different API endpoints
    let characterData = null;
    
    // First try with id parameter
    try {
      const response = await axios.get('https://sapi.aichattings.com/vapi/role/detail', {
        params: { id: id },
        timeout: 30000 // 30 second timeout
      });
      
      if (response.data.code === 1 && response.data.data) {
        const prompt = response.data.data.attributes.prompt || '';
        characterData = {
          id: response.data.data.id,
          rawId: response.data.data.attributes.rawId,
          name: response.data.data.attributes.name,
          shortDesc: response.data.data.attributes.shortDesc,
          desc: response.data.data.attributes.desc,
          helloTip: response.data.data.attributes.helloTip,
          systemPrompt: prompt, // FULL PROMPT - no truncation
          promptLength: prompt.length, // Track length for verification
          avatar: response.data.data.attributes.avatar?.data?.attributes?.url || null,
          isStar: response.data.data.attributes.isStar || false
        };
        console.log(`✅ Loaded character ${id}: ${characterData.name} - Prompt length: ${prompt.length} chars`);
      }
    } catch (e) {
      console.log(`Failed with id=${id}, trying rawId... Error: ${e.message}`);
    }

    // If failed, try with rawId
    if (!characterData) {
      try {
        const response = await axios.get('https://sapi.aichattings.com/vapi/role/detail', {
          params: { rawId: id },
          timeout: 30000 // 30 second timeout
        });
        
        if (response.data.code === 1 && response.data.data) {
          const prompt = response.data.data.attributes.prompt || '';
          characterData = {
            id: response.data.data.id,
            rawId: response.data.data.attributes.rawId,
            name: response.data.data.attributes.name,
            shortDesc: response.data.data.attributes.shortDesc,
            desc: response.data.data.attributes.desc,
            helloTip: response.data.data.attributes.helloTip,
            systemPrompt: prompt, // FULL PROMPT - no truncation
            promptLength: prompt.length, // Track length for verification
            avatar: response.data.data.attributes.avatar?.data?.attributes?.url || null,
            isStar: response.data.data.attributes.isStar || false
          };
          console.log(`✅ Loaded character ${id} (rawId): ${characterData.name} - Prompt length: ${prompt.length} chars`);
        }
      } catch (e) {
        console.error(`Error fetching character details for ${id}:`, e.message);
      }
    }

    if (characterData) {
      cache.set(cacheKey, characterData);
      res.json({ success: true, data: characterData, cached: false });
    } else {
      res.status(404).json({ success: false, error: 'Character not found' });
    }
  } catch (error) {
    console.error('Error fetching character:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search characters endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json({ success: true, data: [] });
    }

    const cacheKey = 'all_characters';
    let characters = cache.get(cacheKey);

    if (!characters) {
      const response = await axios.get('https://sapi.aichattings.com/vapi/role/list', {
        params: {
          locale: 'en',
          pageSize: 1000
        }
      });

      if (response.data.code === 1 && response.data.data) {
        characters = response.data.data.map(char => ({
          id: char.id,
          rawId: char.attributes.rawId,
          name: char.attributes.name,
          shortDesc: char.attributes.shortDesc,
          desc: char.attributes.desc,
          helloTip: char.attributes.helloTip,
          avatar: char.attributes.avatar?.data?.attributes?.url || null,
          isStar: char.attributes.isStar || false
        }));
        cache.set(cacheKey, characters);
      }
    }

    if (characters) {
      const searchTerm = q.toLowerCase();
      const filtered = characters.filter(char => 
        char.name.toLowerCase().includes(searchTerm) ||
        char.shortDesc.toLowerCase().includes(searchTerm) ||
        char.desc.toLowerCase().includes(searchTerm)
      );
      res.json({ success: true, data: filtered });
    } else {
      res.json({ success: true, data: [] });
    }
  } catch (error) {
    console.error('Error searching characters:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on http://${HOST}:${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET /api/characters - Get all characters`);
  console.log(`   GET /api/character/:id - Get character details`);
  console.log(`   GET /api/search?q=query - Search characters`);
});
