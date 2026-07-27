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
      password: 'hashed_password_123',
      fullName: 'Quản trị viên',
      role: Role.ADMIN,
      phone: '0901234567',
      birthDay: new Date('1990-01-01'),
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@gmail.com',
      password: 'hashed_password_123',
      fullName: 'Khách hàng thân thiết',
      role: Role.USER,
      phone: '0987654321',
      birthDay: new Date('2000-05-15'),
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
        description:
          'Câu chuyện kể về bà Hai, một người mẹ đơn thân tự mình nuôi 5 người con khôn lớn. Khi bà Hai gặp tai nạn, những người con đã trưởng thành, mỗi người một phương, phải đối mặt với trách nhiệm chăm sóc mẹ...',
        posterUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEr4X9oEtYmqSOZFz2qTl22jQ2pvvXXyXVtsSf9ORneLc2P_yYAb01Pto&s=10',
        filmGenres: 'Tâm lý, Gia đình',
        duration: 138,
        ageRating: 'K',
        status: MovieStatus.NOW_PLAYING,
        // DỮ LIỆU MỚI:
        director: 'Lý Hải',
        cast: 'Thanh Hiền, Trương Minh Cường, Đinh Y Nhung, Quách Ngọc Tuyên',
        country: 'Việt Nam',
        language: 'Tiếng Việt',
        releaseDate: new Date('2026-04-26'),
      },
      {
        title: 'Godzilla x Kong: Đế Chế Mới',
        description: 'Trận chiến hoành tráng giữa các siêu quái vật nhằm bảo vệ Trái Đất.',
        posterUrl:
          'https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/p/m/pm1067intl_excl_3d_1080x1350px_enguk_v2_r1.jpg',
        filmGenres: 'Hành động, Viễn tưởng',
        duration: 115,
        ageRating: 'C13',
        status: MovieStatus.NOW_PLAYING,
        director: 'Adam Wingard',
        cast: 'Rebecca Hall, Brian Tyree Henry, Dan Stevens',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: new Date('2026-03-29'),
      },
      {
        title: 'Deadpool & Wolverine',
        description: 'Hành trình bá đạo của gã lính đánh thuê lắm mồm và dị nhân Người Sói.',
        posterUrl:
          'https://www.movieposters.com/cdn/shop/files/scan002_00e0a1a8-b4ad-49ff-861f-8dd64ac12a6d_1024x1024.jpg?v=1762977060',
        filmGenres: 'Hành động, Hài',
        duration: 120,
        ageRating: 'C18',
        status: MovieStatus.COMING_SOON,
        director: 'Shawn Levy',
        cast: 'Ryan Reynolds, Hugh Jackman, Emma Corrin',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: new Date('2026-07-26'),
      },
    ],
  });
  console.log('🎬 Đã thêm 3 bộ phim mẫu vào kho!');

  // ==========================================
  // 6. TẠO SUẤT CHIẾU MẪU (SHOWTIME)
  // ==========================================
  // Lấy lại bộ phim Lật Mặt 7 vừa tạo để lấy cái ID của nó
  const latMat7 = await prisma.movie.findFirst({
    where: { title: { contains: 'Lật Mặt 7' } },
  });

  if (latMat7) {
    const showtime = await prisma.showtime.create({
      data: {
        movieId: latMat7.id,
        roomId: room1.id, // Biến room1 đã được tạo ở bước 3
        // Giờ chiếu: 20:00 ngày 30/07/2026 (Giờ VN) -> Trừ 7 tiếng ra giờ UTC là 13:00
        startTime: new Date('2026-07-30T13:00:00.000Z'),
        endTime: new Date('2026-07-30T15:30:00.000Z'),
      },
    });

    // In cái ID suất chiếu ra Terminal để xíu nữa copy cho dễ
    console.log(`\n=================================================`);
    console.log(`⏱️ ĐÃ TẠO SUẤT CHIẾU! MÃ ID LÀ:`);
    console.log(`👉 ${showtime.id} 👈`);
    console.log(`=================================================\n`);

    // ==========================================
    // 7. TẠO VÉ ĐÃ BÁN (TICKET SEAT) MÔ PHỎNG
    // ==========================================
    // Tìm ID của các ghế A1, D4, D5, E7, E8 trong Phòng 1
    const targetSeats = await prisma.seat.findMany({
      where: {
        roomId: room1.id,
        OR: [
          { row: 'A', number: 1 },
          { row: 'D', number: 4 },
          { row: 'D', number: 5 },
          { row: 'E', number: 7 },
          { row: 'E', number: 8 },
        ],
      },
    });

    // Tạo các vé với trạng thái BOOKED (Đã bán)
    const ticketSeatData = targetSeats.map((seat) => ({
      showtimeId: showtime.id,
      seatId: seat.id,
      price: seat.type === 'VIP' ? 120000 : 100000,
      status: 'BOOKED' as const, // Ép kiểu TypeScript
    }));

    // Bắn hàng loạt vé xuống Database
    await prisma.ticketSeat.createMany({
      data: ticketSeatData,
    });

    console.log(`🎟️ Đã mô phỏng bán thành công ${ticketSeatData.length} ghế!`);
  }

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
