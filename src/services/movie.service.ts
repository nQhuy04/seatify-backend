import { MovieStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllMovies = async () => {
  const movies = await prisma.movie.findMany({
    where: {
      status: {
        not: MovieStatus.ARCHIVED,
      },
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  return movies;
};

const getMovieById = async (id: string) => {
  const movie = await prisma.movie.findUnique({
    where: { id: id },
  });

  if (!movie) {
    throw new Error('Không tìm thấy bộ phim này!');
  }

  return movie;
};

const addMovie = async (data: any) => {
  // Lệnh tạo 1 bộ phim mới vào Database
  const newMovie = await prisma.movie.create({
    data: {
      title: data.title,
      description: data.description,
      posterUrl: data.posterUrl,
      trailerUrl: data.trailerUrl,
      filmGenres: data.filmGenres,
      duration: parseInt(data.duration), // Ép kiểu số
      ageRating: data.ageRating,
      status: data.status,
      director: data.director,
      cast: data.cast,
      country: data.country,
      language: data.language,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
    },
  });
  return newMovie;
};
export { getAllMovies, getMovieById, addMovie };
