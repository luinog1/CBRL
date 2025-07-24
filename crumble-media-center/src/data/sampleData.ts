import { MediaItem } from '@/types';

export const sampleMovies: MediaItem[] = [
  {
    id: '1',
    title: 'The Matrix',
    type: 'movie',
    year: 1999,
    poster: 'https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg',
    background: 'https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg',
    description: 'A computer programmer is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.',
    genres: ['Action', 'Sci-Fi'],
    imdbRating: 8.7,
    runtime: 136
  },
  {
    id: '2',
    title: 'Inception',
    type: 'movie',
    year: 2010,
    poster: 'https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
    background: 'https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
    description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    genres: ['Action', 'Thriller', 'Sci-Fi'],
    imdbRating: 8.8,
    runtime: 148
  },
  {
    id: '3',
    title: 'Interstellar',
    type: 'movie',
    year: 2014,
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    background: 'https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    imdbRating: 8.6,
    runtime: 169
  },
  {
    id: '4',
    title: 'Breaking Bad',
    type: 'series',
    year: 2008,
    poster: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
    background: 'https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg',
    description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
    genres: ['Crime', 'Drama', 'Thriller'],
    imdbRating: 9.5,
  },
  {
    id: '5',
    title: 'Stranger Things',
    type: 'series',
    year: 2016,
    poster: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
    background: 'https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/56v2KjBlU4XaOv9rVYEQypROD7P.jpg',
    description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.',
    genres: ['Drama', 'Fantasy', 'Horror'],
    imdbRating: 8.7,
  }
];

export const featuredMedia = sampleMovies[0];