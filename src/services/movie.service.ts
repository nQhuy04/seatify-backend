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
export { getAllMovies, getMovieById };
