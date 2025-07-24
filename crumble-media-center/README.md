# CBRL Media Center

A complete modular media center web application inspired by Stremio, Apple TV+, and VIDI. Built with modern web technologies and designed for extensibility, integrated playback, and a sleek dark-mode UI.

## Features

### 🎬 Content Discovery
- **Stremio-compatible addons** - Load content from any Stremio addon via manifest.json URLs
- **Rich metadata** - Display detailed information including cast, crew, ratings, and descriptions
- **Smart search** - Search across all loaded addons with filtering by type and genre
- **Dynamic catalogs** - Browse popular movies, series, and custom categories

### 🎥 Advanced Playback
- **Multiple player engines** - HLS.js, Shaka Player, and native HTML5 video support
- **External subtitle support** - Load .srt and .vtt subtitles with customizable styling
- **HDR support** - HDR10, HDR10+, and Dolby Vision when supported by browser
- **External player integration** - Launch streams in VLC, Infuse, MX Player, and more
- **Progress tracking** - Local storage with future Trakt.tv/Supabase sync support

### 🎨 Modern UI/UX
- **Dark theme** - Sleek, modern interface optimized for media consumption
- **Responsive design** - Works perfectly on desktop, tablet, and mobile
- **Smooth animations** - Thoughtful micro-interactions and transitions
- **Intuitive navigation** - Clean sidebar with Home, Search, Library, and Settings

### 🔧 Technical Excellence
- **React 18** with TypeScript for type safety and modern development
- **Vite** for lightning-fast development and optimized builds
- **Tailwind CSS** for consistent, maintainable styling
- **Modular architecture** - Clean separation of concerns and reusable components

## Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cbrl-media-center.git
   cd cbrl-media-center
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main app layout with sidebar
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── MediaCard.tsx   # Content card component
│   ├── MediaCarousel.tsx # Horizontal content carousel
│   └── HeroSection.tsx # Featured content banner
├── pages/              # Main application pages
│   ├── Home.tsx        # Homepage with featured content
│   ├── Search.tsx      # Search and filtering
│   ├── Library.tsx     # Watch history and progress
│   ├── Settings.tsx    # App configuration
│   ├── Details.tsx     # Content details page
│   └── Player.tsx      # Video player with controls
├── contexts/           # React contexts for state management
│   ├── AddonContext.tsx # Addon loading and management
│   └── ProgressContext.tsx # Watch progress tracking
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
│   ├── addonApi.ts     # Stremio addon API integration
│   ├── deepLinks.ts    # External player integration
│   └── subtitles.ts    # Subtitle parsing and display
└── types/              # TypeScript type definitions
```

## Configuration

### Adding Addons

Edit `public/addons.json` to add or remove Stremio-compatible addons:

```json
[
  {
    "name": "Cinemeta",
    "url": "https://v3-cinemeta.strem.io/manifest.json",
    "description": "Official Stremio catalog addon"
  }
]
```

### Customizing Appearance

The app uses Tailwind CSS with a custom dark theme. Modify `tailwind.config.js` to customize colors, fonts, and spacing.

## Deployment

### GitHub Pages / Vercel / Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your preferred hosting service

### Docker

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Lint code

### Adding New Features

1. **Components** - Add reusable UI components in `src/components/`
2. **Pages** - Add new routes in `src/pages/` and update `App.tsx`
3. **Hooks** - Create custom hooks in `src/hooks/`
4. **Utils** - Add utility functions in `src/utils/`

### Testing

```bash
npm run test
```

Tests are written using Vitest and React Testing Library.

## Browser Support

- **Modern browsers** - Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile browsers** - iOS Safari 14+, Chrome Mobile 90+
- **Features** - ES2020, WebAssembly, Fetch API, Local Storage

## Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Ensure responsive design works on all screen sizes

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Stremio** - For the addon ecosystem and API design
- **Apple TV+** - For UI/UX inspiration
- **VIDI** - For feature and design inspiration
- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework

## Support

- **Issues** - Report bugs and request features on [GitHub Issues](https://github.com/your-username/cbrl-media-center/issues)
- **Discussions** - Join the community on [GitHub Discussions](https://github.com/your-username/cbrl-media-center/discussions)
- **Documentation** - Full documentation available in the [Wiki](https://github.com/your-username/cbrl-media-center/wiki)

---

**CBRL Media Center** - A modern, extensible media center for the web. Built with ❤️ using React, TypeScript, and Tailwind CSS.