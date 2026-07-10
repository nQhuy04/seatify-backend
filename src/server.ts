import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import movieRouter from './routes/movie.routes';
import cinemaRouter from './routes/cinema.routes';
import showtimeRouter from './routes/showtime.routes';

// Nạp biến môi trường từ file .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Cho phép Frontend gọi API không bị chặn
app.use(express.json()); // Cho phép Backend đọc data JSON từ Client gửi lên

// Route cơ bản để test
app.get('/', (req: Request, res: Response) => {
  res.send('Chào mừng đến với API Backend của Seatify!');
});

app.use('/api/auth', authRouter);
app.use('/api/movies', movieRouter);
app.use('/api/cinemas', cinemaRouter);
app.use('/api/showtimes', showtimeRouter);

app.listen(PORT, () => {
  console.log(`Server Seatify đang chạy thành công tại http://localhost:${PORT}`);
});
