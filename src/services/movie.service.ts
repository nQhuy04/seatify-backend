import { MovieStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getAllMovies = async () => {
  const movies = await prisma.movie.findMany({
    orderBy: { title: 'asc' },
  });

  //AUTO-STATUS: Tính toán trạng thái ngay lúc gọi API
  const now = new Date(); // Lấy thời gian hiện tại của máy chủ
  const processedMovies = movies.map((movie) => {
    let computedStatus = 'COMING_SOON'; // Mặc định là sắp chiếu

    // Nếu phim có set ngày ra mắt và ngày kết thúc
    if (movie.releaseDate && movie.endDate) {
      if (now >= movie.releaseDate && now <= movie.endDate) {
        computedStatus = 'NOW_PLAYING';
      } else if (now > movie.endDate) {
        computedStatus = 'ARCHIVED';
      }
    }

    // Đóng gói lại, bổ sung thêm biến status giả vào cục JSON để Frontend hiển thị
    return {
      ...movie,
      status: computedStatus,
    };
  });

  return processedMovies;
};

const getMovieById = async (id: string) => {
  const movie = await prisma.movie.findUnique({
    where: { id: id },
  });

  if (!movie) {
    throw new Error('Không tìm thấy bộ phim này!');
  }

  // ---AUTO-STATUS---
  const now = new Date();
  let computedStatus = 'COMING_SOON';

  if (movie.releaseDate && movie.endDate) {
    if (now >= movie.releaseDate && now <= movie.endDate) {
      computedStatus = 'NOW_PLAYING';
    } else if (now > movie.endDate) {
      computedStatus = 'ARCHIVED';
    }
  }

  return {
    ...movie,
    status: computedStatus,
  };
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

const updateMovie = async (id: string, data: any) => {
  const updatedMovie = await prisma.movie.update({
    where: { id: id },
    data: {
      title: data.title,
      description: data.description,
      posterUrl: data.posterUrl,
      trailerUrl: data.trailerUrl,
      filmGenres: data.filmGenres,
      duration: parseInt(data.duration),
      ageRating: data.ageRating,
      status: data.status,
      director: data.director,
      cast: data.cast,
      country: data.country,
      language: data.language,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null, // Thêm ngày kết thúc
    },
  });
  return updatedMovie;
};

export { getAllMovies, getMovieById, addMovie, updateMovie };
