import { PrismaClient, Role, SeatType, MovieStatus } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

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
  const defaultPassword = await bcrypt.hash('123456', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@seatify.com',
      password: defaultPassword,
      fullName: 'Sếp Tổng Seatify',
      role: Role.ADMIN,
      phone: '0901234567',
      birthDay: new Date('1990-01-01'),
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'user@gmail.com',
      password: defaultPassword,
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
      totalSeats: 180,
      cinemaId: cinema.id,
    },
  });
  console.log('🏢 Đã tạo Rạp và Phòng chiếu!');

  // 4. THUẬT TOÁN TẠO SƠ ĐỒ GHẾ HÀNG LOẠT (MA TRẬN 10x10)
  const seatData = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  for (const row of rows) {
    for (let number = 1; number <= 18; number++) {
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
      // --- PHIM ĐANG CHIẾU (NOW_PLAYING) ---
      {
        title: 'Lật Mặt 7: Một Điều Ước',
        trailerUrl: 'https://www.youtube.com/watch?v=QdtPQ0wV53M',
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
        trailerUrl: 'https://www.youtube.com/watch?v=lV1OOlGwExM',
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
        title: 'Mai',
        trailerUrl: 'https://youtu.be/Yz96EBNwMGw?si=7z2tesx1Lli-Uc7B',
        description:
          'Câu chuyện về cuộc đời của một người phụ nữ tên Mai, mang trong mình nhiều tổn thương trong quá khứ và khát khao hạnh phúc.',
        posterUrl:
          'https://cdn-images.vtv.vn/562122370168008704/2023/11/28/photo-1-17011453442011344132442.jpg',
        filmGenres: 'Tâm lý, Tình cảm',
        duration: 131,
        ageRating: 'C18',
        status: MovieStatus.NOW_PLAYING,
        director: 'Trấn Thành',
        cast: 'Phương Anh Đào, Tuấn Trần, Hồng Đào',
        country: 'Việt Nam',
        language: 'Tiếng Việt',
        releaseDate: new Date('2026-02-10'),
      },
      {
        title: 'Kung Fu Panda 4',
        trailerUrl: 'https://www.youtube.com/watch?v=_inKs4eeHiI',
        description:
          'Gấu trúc Po phải đối mặt với một kẻ thù mới có khả năng biến hình, trong khi đang tìm kiếm người kế vị cho ngôi vị Thần Long Đại Hiệp.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
        filmGenres: 'Hoạt hình, Hài, Gia đình',
        duration: 94,
        ageRating: 'K',
        status: MovieStatus.NOW_PLAYING,
        director: 'Mike Mitchell',
        cast: 'Jack Black, Awkwafina, Viola Davis',
        country: 'Hoa Kỳ',
        language: 'Lồng tiếng Việt',
        releaseDate: new Date('2026-03-08'),
      },
      {
        title: 'Dune: Hành Tinh Cát - Phần 2',
        trailerUrl: 'https://www.youtube.com/watch?v=U2Qp5pL3ovA',
        description:
          'Paul Atreides tiếp tục hành trình trả thù những kẻ đã hủy hoại gia đình mình, đồng thời phải lựa chọn giữa tình yêu và số phận của vũ trụ.',
        posterUrl:
          'https://upload.wikimedia.org/wikipedia/vi/9/94/Dune_2_VN_poster.jpg?utm_source=vi.wikipedia.org&utm_campaign=index&utm_content=original',
        filmGenres: 'Hành động, Viễn tưởng',
        duration: 166,
        ageRating: 'C16',
        status: MovieStatus.NOW_PLAYING,
        director: 'Denis Villeneuve',
        cast: 'Timothée Chalamet, Zendaya',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: new Date('2026-03-01'),
      },

      // --- PHIM SẮP CHIẾU (COMING_SOON) ---
      {
        title: 'Deadpool & Wolverine',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        description:
          'Hành trình bá đạo của gã lính đánh thuê lắm mồm và dị nhân Người Sói. Cả hai phải gạt bỏ hiềm khích để cứu lấy Đa vũ trụ.',
        posterUrl:
          'https://www.movieposters.com/cdn/shop/files/scan002_00e0a1a8-b4ad-49ff-861f-8dd64ac12a6d_1024x1024.jpg?v=1762977060',
        filmGenres: 'Hành động, Hài',
        duration: 120,
        ageRating: 'C18',
        status: MovieStatus.COMING_SOON,
        director: 'Shawn Levy',
        cast: 'Ryan Reynolds, Hugh Jackman',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: new Date('2026-07-26'),
      },
      {
        title: 'Kẻ Trộm Mặt Trăng 4',
        trailerUrl: 'https://youtu.be/S1dnnQsY0QU?si=z-UpSphQZMNB7o1I',
        description:
          'Gru và gia đình chào đón thành viên mới, nhưng sớm phải chạy trốn khỏi một ác nhân mới vượt ngục.',
        posterUrl:
          'https://cdn.galaxycine.vn/media/2024/6/20/despicable-me-4-500_1718865149847.jpg',
        filmGenres: 'Hoạt hình, Hài',
        duration: 95,
        ageRating: 'K',
        status: MovieStatus.COMING_SOON,
        director: 'Chris Renaud',
        cast: 'Steve Carell, Kristen Wiig',
        country: 'Hoa Kỳ',
        language: 'Lồng tiếng Việt',
        releaseDate: new Date('2026-07-05'),
      },
      {
        title: 'Venom: Kèo Cuối',
        trailerUrl: 'https://youtu.be/id1rfr_KZWg?si=l6WD5osdLS3-Ij03',
        description:
          'Eddie và Venom đang chạy trốn khỏi cả hai thế giới của họ. Khi lưới bủa vây thu hẹp, bộ đôi phải đưa ra quyết định tàn khốc.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/aosm8NMQ3UyoBVpSxyimorCQykC.jpg',
        filmGenres: 'Hành động, Viễn tưởng',
        duration: 110,
        ageRating: 'C16',
        status: MovieStatus.COMING_SOON,
        director: 'Kelly Marcel',
        cast: 'Tom Hardy, Chiwetel Ejiofor',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: new Date('2026-10-25'),
      },

      // --- PHIM ĐÃ GỠ (ARCHIVED) - DÙNG ĐỂ TEST CÚ LỌC CỦA BACKEND ---
      {
        title: 'Avatar: Dòng Chảy Của Nước',
        trailerUrl: 'https://youtu.be/gq2xKJXYZ80?si=3iBUsiSgPht9mm9G',
        description:
          'Jake Sully sống cùng gia đình mới ở hành tinh Pandora, cho đến khi một mối đe dọa cũ trở lại.',
        posterUrl: 'https://image.tmdb.org/t/p/w500/t6HIqrNDIGGLt38Aw1R48k88q4i.jpg',
        filmGenres: 'Hành động, Phiêu lưu',
        duration: 192,
        ageRating: 'C13',
        status: MovieStatus.ARCHIVED,
        director: 'James Cameron',
        cast: 'Sam Worthington, Zoe Saldaña',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: new Date('2022-12-16'),
      },
    ],
  });
  console.log('🎬 Đã thêm phim mẫu vào kho!');

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
    // 7. TẠO TẤT CẢ 100 VÉ CHO SUẤT CHIẾU
    // ==========================================
    // Lấy toàn bộ 100 ghế vật lý của Phòng 1
    const allPhysicalSeats = await prisma.seat.findMany({
      where: { roomId: room1.id },
    });

    const mockBookedNames = ['A1', 'D4', 'D5', 'E7', 'E8'];

    // Biến 100 ghế vật lý thành 100 vé (TicketSeat)
    const ticketSeatData = allPhysicalSeats.map((seat) => {
      const seatName = `${seat.row}${seat.number}`;
      const isBooked = mockBookedNames.includes(seatName);

      return {
        showtimeId: showtime.id,
        seatId: seat.id,
        price: seat.type === 'VIP' ? 120000 : 100000,
        // Nếu nằm trong mảng mock thì BOOKED, còn lại thì AVAILABLE
        status: isBooked ? 'BOOKED' : ('AVAILABLE' as any),
      };
    });

    // Bắn hàng loạt 100 vé xuống Database
    await prisma.ticketSeat.createMany({
      data: ticketSeatData,
    });

    console.log(`🎟️ Đã tạo thành công 100 vé cho suất chiếu (5 BOOKED, 95 AVAILABLE)!`);

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
