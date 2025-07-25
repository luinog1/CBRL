export {};

const response = await fetch('https://94c8cb9f702d-tmdb-addon.baby-beamup.club/manifest.json', {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Your-App-Name/1.0'
  }
});