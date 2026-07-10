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

export { getAllMovies };
