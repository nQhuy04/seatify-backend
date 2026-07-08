import { PrismaClient, Role, SeatType, MovieStatus } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

async function main() {
  console.log('(Seeding data)...');

  // 1. DỌN DẸP SẠCH SẼ NHÀ CỬA
  await prisma.ticketSeat.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.room.deleteMany();
  await prisma.cinema.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Đã dọn dẹp xong dữ liệu cũ!');

  // 2. TẠO TÀI KHOẢN MẪU (ADMIN & USER)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@seatify.com',
      password: 'hashed_password_123', // Ngày 4 chúng ta sẽ học mã hóa thật bằng bcrypt
      fullName: 'Quản trị viên',
      role: Role.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@gmail.com',
      password: 'hashed_password_123',
      fullName: 'Khách hàng thân thiết',
      role: Role.USER,
    },
  });
  console.log('👤 Đã tạo User mẫu!');

  // 3. TẠO RẠP & PHÒNG CHIẾU
  const cinema = await prisma.cinema.create({
    data: {
      name: 'Cinestar Quốc Thanh',
      location: '271 Nguyễn Trãi, Q.1',
      city: 'Hồ Chí Minh',
    },
  });

  const room1 = await prisma.room.create({
    data: {
      name: 'Phòng 1 (Standard)',
      totalSeats: 100,
      cinemaId: cinema.id,
    },
  });
  console.log('🏢 Đã tạo Rạp và Phòng chiếu!');

  // 4. THUẬT TOÁN TẠO SƠ ĐỒ GHẾ HÀNG LOẠT (MA TRẬN 10x10)
  const seatData = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  for (const row of rows) {
    for (let number = 1; number <= 10; number++) {
      // Logic phân loại ghế ảo ma:
      // Hàng A, B, C: Ghế thường
      // Hàng D đến H: Ghế VIP
      // Hàng I, J: Ghế Couple
      let type: SeatType = SeatType.NORMAL;
      if (['D', 'E', 'F', 'G', 'H'].includes(row)) type = SeatType.VIP;
      if (['I', 'J'].includes(row)) type = SeatType.COUPLE;

      seatData.push({
        roomId: room1.id,
        row: row,
        number: number,
        type: type,
      });
    }
  }

  // Bulk Insert: Đẩy 100 ghế vào DB trong 1 câu lệnh duy nhất
  await prisma.seat.createMany({ data: seatData });
  console.log(`💺 Đã tự động sinh ra ${seatData.length} ghế vật lý cho Phòng 1!`);

  // 5. TẠO DỮ LIỆU PHIM MẪU
  await prisma.movie.createMany({
    data: [
      {
        title: 'Lật Mặt 7: Một Điều Ước',
        description: 'Bộ phim cảm động về tình cảm gia đình của đạo diễn Lý Hải.',
        posterUrl: 'https://example.com/lat-mat-7.jpg',
        filmGenres: 'Tâm lý, Gia đình',
        duration: 138,
        ageRating: 'K',
        status: MovieStatus.NOW_PLAYING,
      },
      {
        title: 'Godzilla x Kong: Đế Chế Mới',
        description: 'Trận chiến hoành tráng giữa các siêu quái vật.',
        posterUrl: 'https://example.com/godzilla.jpg',
        filmGenres: 'Hành động, Viễn tưởng',
        duration: 115,
        ageRating: 'C13',
        status: MovieStatus.NOW_PLAYING,
      },
      {
        title: 'Deadpool & Wolverine',
        description: 'Hành trình bá đạo của gã lính đánh thuê lắm mồm.',
        posterUrl: 'https://example.com/deadpool.jpg',
        filmGenres: 'Hành động, Hài',
        duration: 120,
        ageRating: 'C18',
        status: MovieStatus.COMING_SOON,
      },
    ],
  });
  console.log('🎬 Đã thêm 3 bộ phim mẫu vào kho!');

  console.log('✅ HOÀN TẤT QUÁ TRÌNH SEEDING DATA!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
