const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 7001;

// Enable CORS for all routes
app.use(cors());

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Helper function to validate TMDB API key
async function validateApiKey(apiKey) {
  try {
    // Use a simple endpoint to validate the API key
    const response = await axios.get('https://api.themoviedb.org/3/movie/popular', {
      params: { api_key: apiKey, page: 1 }
    });
    
    // If we get here, the API key is valid
    return { valid: true, data: response.data };
  } catch (error) {
    // Check if this is an API key error
    if (error.response && error.response.status === 401) {
      return { 
        valid: false, 
        error: error.response.data || { status_message: "Invalid API key" }
      };
    }
    
    // Other errors
    return { 
      valid: false, 
      error: error.response?.data || { status_message: "Connection error" }
    };
  }
}

// ───────────────────────────────────────────── 
// 1. Manifest 
// ───────────────────────────────────────────── 
const manifest = { 
  id: "org.crumble.tmdb", 
  version: "1.0.0", 
  name: "Crumble TMDB Addon", 
  description: "Fetches movies and TV shows from TMDB", 
  resources: ["catalog", "meta", "stream"], 
  types: ["movie", "series"], 
  catalogs: [ 
    { 
      type: "movie", 
      id: "tmdb_popular", 
      name: "Popular Movies" 
    },
    { 
      type: "series", 
      id: "tmdb_popular", 
      name: "Popular TV Shows" 
    } 
  ] 
}; 

app.get("/manifest.json", (req, res) => { 
  res.json(manifest); 
}); 

// ───────────────────────────────────────────── 
// 1.5 API Key Validation Endpoint
// ───────────────────────────────────────────── 
app.get("/validate-key", async (req, res) => {
  const apiKey = req.query.apikey;
  
  if (!apiKey) {
    return res.status(400).json({
      error: "Missing API key",
      detail: "Please provide your TMDB API key as a query parameter"
    });
  }
  
  const validation = await validateApiKey(apiKey);
  
  if (validation.valid) {
    return res.json({
      valid: true,
      message: "API key is valid"
    });
  } else {
    return res.status(401).json({
      valid: false,
      error: "Invalid TMDB API key",
      detail: validation.error.status_message || "The API key you provided is invalid or has expired"
    });
  }
});

// ───────────────────────────────────────────── 
// 2. Catalog Endpoint 
// ───────────────────────────────────────────── 
app.get("/catalog/:type/:id/:extra?.json", async (req, res) => { 
  const { type, id } = req.params; 
  const userApiKey = req.query.apikey;

  if (!userApiKey) {
    return res.status(400).json({ 
      error: "Missing API key", 
      detail: "Please provide your TMDB API key as a query parameter" 
    });
  }

  if (id === "tmdb_popular") { 
    try { 
      const mediaType = type === "movie" ? "movie" : "tv";
      const { data } = await axios.get(`https://api.themoviedb.org/3/${mediaType}/popular`, { 
        params: { api_key: userApiKey, language: "en-US", page: 1 } 
      }); 

      const metas = data.results.map(item => ({ 
        id: `tmdb:${mediaType}/${item.id}`, 
        type: type, 
        name: item.title || item.name, 
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null, 
        background: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : null, 
        year: parseInt(item.release_date?.slice(0, 4) || item.first_air_date?.slice(0, 4)) || null, 
        description: item.overview,
        releaseInfo: item.release_date || item.first_air_date
      })); 

      res.json({ metas }); 
    } catch (err) { 
      // Check if this is an API key error (401 Unauthorized)
      if (err.response && err.response.status === 401) {
        return res.status(401).json({ 
          error: "Invalid TMDB API key", 
          detail: "The TMDB API key you provided is invalid or has expired. Please check your API key in Settings > API Keys."
        });
      }
      
      // Handle other errors
      res.status(500).json({ error: "TMDB error", detail: err.message }); 
    } 
  } else { 
    res.json({ metas: [] }); 
  } 
}); 

// ───────────────────────────────────────────── 
// 3. Metadata Endpoint 
// ───────────────────────────────────────────── 
app.get("/meta/:type/:id.json", async (req, res) => { 
  const { type, id } = req.params; 
  const userApiKey = req.query.apikey;
  
  if (!userApiKey) {
    return res.status(400).json({ 
      error: "Missing API key", 
      detail: "Please provide your TMDB API key as a query parameter" 
    });
  }

  try { 
    // Extract TMDB ID from the format tmdb:movie/123 or tmdb:tv/123
    let mediaType, tmdbId;
    
    if (id.includes(':')) {
      const parts = id.split(':');
      const mediaInfo = parts[1].split('/');
      mediaType = mediaInfo[0] === 'series' ? 'tv' : mediaInfo[0];
      tmdbId = mediaInfo[1];
    } else if (id.includes('/')) {
      const parts = id.split('/');
      mediaType = parts[0] === 'series' ? 'tv' : parts[0];
      tmdbId = parts[1];
    } else {
      mediaType = type === 'series' ? 'tv' : type;
      tmdbId = id;
    }

    const { data } = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${tmdbId}`, { 
      params: { 
        api_key: userApiKey,
        language: "en-US",
        append_to_response: "videos,credits"
      } 
    }); 

    const meta = { 
      id: id, 
      type: type, 
      name: data.title || data.name, 
      poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null, 
      background: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null, 
      year: parseInt(data.release_date?.slice(0, 4) || data.first_air_date?.slice(0, 4)) || null, 
      description: data.overview, 
      runtime: data.runtime || (data.episode_run_time && data.episode_run_time.length > 0 ? data.episode_run_time[0] : null), 
      genres: data.genres?.map(g => g.name) || [], 
      cast: data.credits?.cast?.slice(0, 10).map(c => c.name) || [],
      director: data.credits?.crew?.filter(c => c.job === 'Director').map(c => c.name) || [],
      writers: data.credits?.crew?.filter(c => c.department === 'Writing').map(c => c.name) || [],
      trailers: data.videos?.results
        ?.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'))
        ?.map(v => ({
          source: v.site,
          id: v.key,
          url: `https://www.youtube.com/watch?v=${v.key}`,
        })) || [],
      imdbRating: data.vote_average ? data.vote_average.toFixed(1) : null,
      releaseInfo: data.release_date || data.first_air_date
    }; 

    res.json({ meta }); 
  } catch (err) { 
    // Check if this is an API key error (401 Unauthorized)
    if (err.response && err.response.status === 401) {
      return res.status(401).json({ 
        error: "Invalid TMDB API key", 
        detail: "The TMDB API key you provided is invalid or has expired. Please check your API key in Settings > API Keys."
      });
    }
    
    // Handle other errors
    res.status(500).json({ error: "Metadata fetch failed", detail: err.message }); 
  } 
}); 

// ───────────────────────────────────────────── 
// 4. Stream Endpoint (Mocked) 
// ───────────────────────────────────────────── 
app.get("/stream/:type/:id.json", (req, res) => { 
  const { id } = req.params; 

  // Replace this with actual debrid / playback logic
  res.json({ 
    streams: [ 
      { 
        title: "Demo HLS Stream", 
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" 
      } 
    ] 
  }); 
}); 

// ───────────────────────────────────────────── 
app.listen(PORT, () => { 
  console.log(`Crumble TMDB addon running on http://localhost:${PORT}`); 
});