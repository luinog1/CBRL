import { MetaItem } from '../types'

// Mock data for development and fallback
export const mockMovies: MetaItem[] = [
  {
    id: 'tt0133093',
    type: 'movie',
    name: 'The Matrix',
    poster: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop',
    background: 'https://images.pexels.com/photos/7991579/pexels-photo-7991579.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop',
    description: 'A computer programmer is led to fight an underground war against powerful computers who have constructed his entire reality with a system called the Matrix.',
    releaseInfo: '1999',
    year: 1999,
    imdbRating: 8.7,
    genres: ['Action', 'Sci-Fi'],
    runtime: '136 min',
    director: ['Lana Wachowski', 'Lilly Wachowski'],
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss', 'Hugo Weaving']
  },
  {
    id: 'tt0468569',
    type: 'movie',
    name: 'The Dark Knight',
    poster: 'https://images.pexels.com/photos/7991225/pexels-photo-7991225.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop',
    background: 'https://images.pexels.com/photos/7991225/pexels-photo-7991225.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.',
    releaseInfo: '2008',
    year: 2008,
    imdbRating: 9.0,
    genres: ['Action', 'Crime', 'Drama'],
    runtime: '152 min',
    director: ['Christopher Nolan'],
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine']
  },
  {
    id: 'tt0110912',
    type: 'movie',
    name: 'Pulp Fiction',
    poster: 'https://images.pexels.com/photos/7991456/pexels-photo-7991456.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop',
    background: 'https://images.pexels.com/photos/7991456/pexels-photo-7991456.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.',
    releaseInfo: '1994',
    year: 1994,
    imdbRating: 8.9,
    genres: ['Crime', 'Drama'],
    runtime: '154 min',
    director: ['Quentin Tarantino'],
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson', 'Bruce Willis']
  }
]

export const mockSeries: MetaItem[] = [
  {
    id: 'tt0903747',
    type: 'series',
    name: 'Breaking Bad',
    poster: 'https://images.pexels.com/photos/7991123/pexels-photo-7991123.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop',
    background: 'https://images.pexels.com/photos/7991123/pexels-photo-7991123.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop',
    description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine.',
    releaseInfo: '2008-2013',
    year: 2008,
    imdbRating: 9.5,
    genres: ['Crime', 'Drama', 'Thriller'],
    cast: ['Bryan Cranston', 'Aaron Paul', 'Anna Gunn', 'RJ Mitte'],
    videos: [
      {
        id: 's01e01',
        title: 'Pilot',
        released: '2008-01-20',
        season: 1,
        episode: 1,
        overview: 'Walter White, a struggling high school chemistry teacher, is diagnosed with lung cancer.',
        thumbnail: 'https://images.pexels.com/photos/7991123/pexels-photo-7991123.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop'
      },
      {
        id: 's01e02',
        title: 'Cat\'s in the Bag...',
        released: '2008-01-27',
        season: 1,
        episode: 2,
        overview: 'Walt and Jesse attempt to tie up loose ends.',
        thumbnail: 'https://images.pexels.com/photos/7991123/pexels-photo-7991123.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop'
      }
    ]
  },
  {
    id: 'tt0944947',
    type: 'series',
    name: 'Game of Thrones',
    poster: 'https://images.pexels.com/photos/7991334/pexels-photo-7991334.jpeg?auto=compress&cs=tinysrgb&w=500&h=750&fit=crop',
    background: 'https://images.pexels.com/photos/7991334/pexels-photo-7991334.jpeg?auto=compress&cs=tinysrgb&w=1920&h=800&fit=crop',
    description: 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns.',
    releaseInfo: '2011-2019',
    year: 2011,
    imdbRating: 9.2,
    genres: ['Action', 'Adventure', 'Drama'],
    cast: ['Peter Dinklage', 'Lena Headey', 'Emilia Clarke', 'Kit Harington'],
    videos: [
      {
        id: 's01e01',
        title: 'Winter Is Coming',
        released: '2011-04-17',
        season: 1,
        episode: 1,
        overview: 'Eddard Stark is torn between his family and an old friend when asked to serve at the side of King Robert Baratheon.',
        thumbnail: 'https://images.pexels.com/photos/7991334/pexels-photo-7991334.jpeg?auto=compress&cs=tinysrgb&w=320&h=180&fit=crop'
      }
    ]
  }
]

export const getAllMockContent = (): MetaItem[] => {
  return [...mockMovies, ...mockSeries]
}