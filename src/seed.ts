import { PrismaClient, Role, SeatType, MovieStatus } from '@prisma/client';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});

async function main() {
  console.log('🌱 (Seeding data)...');

  // 1. DỌN DẸP SẠCH SẼ NHÀ CỬA
  await prisma.ticketSeat.deleteMany();
  await prisma.showtime.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.room.deleteMany();
  await prisma.cinema.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Đã dọn dẹp dữ liệu cũ');

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

  // ==========================================
  // 3. TẠO RẠP & PHÒNG CHIẾU (ĐÃ SỬA LỖI Ở ĐÂY)
  // ==========================================
  const cinema = await prisma.cinema.create({
    data: { name: 'Cinestar Quốc Thanh', location: '271 Nguyễn Trãi, Q.1', city: 'Hồ Chí Minh' },
  });

  // Tạo thêm Rạp số 2 để có chỗ nhét room3
  const cinema2 = await prisma.cinema.create({
    data: { name: 'Cinestar Landmark 81', location: 'Vincom Landmark 81', city: 'Hồ Chí Minh' },
  });

  const room1 = await prisma.room.create({
    data: { name: 'Phòng 1 (Standard)', totalSeats: 180, cinemaId: cinema.id },
  });
  const room2 = await prisma.room.create({
    data: { name: 'Phòng 2 (IMAX)', totalSeats: 180, cinemaId: cinema.id },
  });
  const room3 = await prisma.room.create({
    data: { name: 'Phòng 1 (VIP)', totalSeats: 180, cinemaId: cinema2.id },
  });

  console.log('🏢 Đã tạo Rạp và Phòng chiếu');

  // 4. THUẬT TOÁN TẠO SƠ ĐỒ GHẾ HÀNG LOẠT (180 ghế)
  const seatData = [];
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const allRooms = [room1, room2, room3];

  for (const room of allRooms) {
    for (const row of rows) {
      for (let number = 1; number <= 18; number++) {
        let type: SeatType = SeatType.NORMAL;
        if (['D', 'E', 'F', 'G', 'H', 'I'].includes(row)) type = SeatType.VIP;
        if (['J'].includes(row)) type = SeatType.COUPLE;

        seatData.push({
          roomId: room.id,
          row: row,
          number: number,
          type: type,
        });
      }
    }
  }

  await prisma.seat.createMany({ data: seatData });
  console.log(`💺 Đã tự động sinh ra ${seatData.length} ghế vật lý cho tất cả các phòng`);

  // ==========================================
  // 5. TẠO DỮ LIỆU PHIM MẪU
  // ==========================================
  // --- THUẬT TOÁN NGÀY TƯƠNG ĐỐI ---

  const today = new Date();

  // Phim Đang chiếu: Ra mắt 5 ngày trước, kết thúc 15 ngày sau
  const nowPlayingStart = new Date(today);
  nowPlayingStart.setDate(today.getDate() - 5);
  const nowPlayingEnd = new Date(today);
  nowPlayingEnd.setDate(today.getDate() + 15);

  // Phim Sắp chiếu: Ra mắt 10 ngày sau, kết thúc 30 ngày sau
  const comingSoonStart = new Date(today);
  comingSoonStart.setDate(today.getDate() + 10);
  const comingSoonEnd = new Date(today);
  comingSoonEnd.setDate(today.getDate() + 30);

  // Phim Đã gỡ: Ra mắt 60 ngày trước, kết thúc 20 ngày trước
  const archivedStart = new Date(today);
  archivedStart.setDate(today.getDate() - 60);
  const archivedEnd = new Date(today);
  archivedEnd.setDate(today.getDate() - 20);

  // 5. TẠO DỮ LIỆU PHIM MẪU
  await prisma.movie.createMany({
    data: [
      // ================= PHIM ĐANG CHIẾU =================
      {
        title: 'Inside Out 2',
        trailerUrl: 'https://www.youtube.com/watch?v=LEjhY15eCx0',
        posterUrl: 'https://m.media-amazon.com/images/I/81do41OmwiL.jpg',
        backdropUrl:
          'https://www.realmomofsfv.com/wp-content/uploads/2024/09/Inside-Out-2-Digital-2-Banner.png',
        description:
          'Những cảm xúc mới xuất hiện trong tâm trí của Riley khi cô bé bước vào tuổi dậy thì, mang theo vô vàn rắc rối và tình huống dở khóc dở cười.',
        filmGenres: 'Hoạt hình, Hài, Tâm lý',
        duration: 96,
        ageRating: 'P',
        director: 'Kelsey Mann',
        cast: 'Amy Poehler, Maya Hawke',
        country: 'Hoa Kỳ',
        language: 'Lồng tiếng Việt',
        releaseDate: nowPlayingStart,
        endDate: nowPlayingEnd,
      },
      {
        title: 'Nhà Bà Nữ',
        trailerUrl: 'https://www.youtube.com/watch?v=IkaP0KJWTsQ',
        posterUrl:
          'https://cdn-i.doisongphapluat.com.vn/media/dang-nhat-duy/2022/12/03/poster-phim-tran-thanh-nha-ba-nu-dspl-31220221.jpg',
        backdropUrl:
          'https://static2.vieon.vn/vieplay-image/thumbnail_big_v4_ntc/2025/12/22/0c18rjie_nhabanu_1920x1080_nott_1267_712.jpg',
        description:
          'Câu chuyện xoay quanh gia đình ba thế hệ của bà Nữ, người bán bánh canh cua khét tiếng. Mâu thuẫn thế hệ bùng nổ khi con gái út quyết định đi theo tình yêu đời mình.',
        filmGenres: 'Tâm lý, Gia đình',
        duration: 120,
        ageRating: 'T16',
        director: 'Trấn Thành',
        cast: 'Lê Giang, Uyển Ân, Trấn Thành, Khả Như',
        country: 'Việt Nam',
        language: 'Tiếng Việt',
        releaseDate: nowPlayingStart,
        endDate: nowPlayingEnd,
      },
      {
        title: 'Oppenheimer',
        trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
        posterUrl:
          'https://www.tallengestore.com/cdn/shop/products/Oppenheimer-CillianMurphy-ChristopherNolan-HollywoodMoviePoster_5aaacf8f-5d5d-4728-8869-0192bd4e1d9a.jpg?v=1691369039',
        backdropUrl:
          'https://images.squarespace-cdn.com/content/v1/5d781378751c4a68f33aecfc/1690454948409-LS94DMCQKQVAIZVQP2OH/facebook-banner.jpg?format=2500w',
        description:
          'Câu chuyện sử thi về J. Robert Oppenheimer và quá trình chế tạo bom nguyên tử trong Thế chiến II, đánh đổi bằng cả lương tâm và sự giằng xé nội tâm.',
        filmGenres: 'Tâm lý, Lịch sử',
        duration: 180,
        ageRating: 'T18',
        director: 'Christopher Nolan',
        cast: 'Cillian Murphy, Robert Downey Jr., Emily Blunt',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: nowPlayingStart,
        endDate: nowPlayingEnd,
      },
      {
        title: 'Kung Fu Panda 4',
        trailerUrl: 'https://www.youtube.com/watch?v=_inKs4eeHiI',
        posterUrl: 'https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg',
        backdropUrl:
          'https://www.showtimeattractions.com.au/wp-content/uploads/KFP4-1100x390-banner.jpg',
        description:
          'Gấu trúc Po phải đối mặt với một kẻ thù mới có khả năng biến hình, trong khi đang tìm kiếm người kế vị cho ngôi vị Thần Long Đại Hiệp.',
        filmGenres: 'Hoạt hình, Hài, Gia đình',
        duration: 94,
        ageRating: 'P',
        director: 'Mike Mitchell',
        cast: 'Jack Black, Awkwafina',
        country: 'Hoa Kỳ',
        language: 'Lồng tiếng Việt',
        releaseDate: nowPlayingStart,
        endDate: nowPlayingEnd,
      },
      {
        title: 'Mật Vụ Ong',
        trailerUrl: 'https://www.youtube.com/watch?v=SzINZZ6iqxY',
        posterUrl: 'https://image.tmdb.org/t/p/original/A7EByudX0eOzlkQ2FIbogzyazm2.jpg',
        backdropUrl:
          'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2024/01/mat-vu-ong-thumbnail.jpg',
        description:
          'Hành trình trả thù đẫm máu của một cựu đặc vụ thuộc tổ chức ngầm The Beekeepers sau khi người hàng xóm duy nhất của ông bị lừa đảo dẫn đến tự sát.',
        filmGenres: 'Hành động, Giật gân',
        duration: 105,
        ageRating: 'T18',
        director: 'David Ayer',
        cast: 'Jason Statham, Josh Hutcherson',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: nowPlayingStart,
        endDate: nowPlayingEnd,
      },
      {
        title: 'Lật Mặt 7: Một Điều Ước',
        trailerUrl: 'https://www.youtube.com/watch?v=1VbL7E_1gSg',
        posterUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEr4X9oEtYmqSOZFz2qTl22jQ2pvvXXyXVtsSf9ORneLc2P_yYAb01Pto&s=10',
        backdropUrl:
          'https://kenh14cdn.com/203336854389633024/2024/4/29/facebookavatarcopy62b3beb1d-ee48-4863-846a-a2f9b675a79d-1714370044049179847251.jpg',
        description:
          'Câu chuyện kể về bà Hai, một người mẹ đơn thân tự mình nuôi 5 người con khôn lớn. Khi bà Hai gặp tai nạn, những người con đã trưởng thành phải đối mặt với trách nhiệm chăm sóc mẹ...',
        filmGenres: 'Tâm lý, Gia đình',
        duration: 138,
        ageRating: 'P',
        director: 'Lý Hải',
        cast: 'Thanh Hiền, Trương Minh Cường',
        country: 'Việt Nam',
        language: 'Tiếng Việt',
        releaseDate: nowPlayingStart,
        endDate: nowPlayingEnd,
      },
      {
        title: 'Godzilla x Kong: Đế Chế Mới',
        trailerUrl: 'https://www.youtube.com/watch?v=lV1OOlGwExM',
        posterUrl:
          'https://iguov8nhvyobj.vcdn.cloud/media/catalog/product/cache/1/image/c5f0a1eff4c394a251036189ccddaacd/p/m/pm1067intl_excl_3d_1080x1350px_enguk_v2_r1.jpg',
        backdropUrl:
          'https://images2.thanhnien.vn/528068263637045248/2024/2/15/1-1707975462316602481176.png',
        description: 'Trận chiến hoành tráng giữa các siêu quái vật nhằm bảo vệ Trái Đất.',
        filmGenres: 'Hành động, Viễn tưởng',
        duration: 115,
        ageRating: 'T13',
        director: 'Adam Wingard',
        cast: 'Rebecca Hall, Brian Tyree Henry',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: nowPlayingStart,
        endDate: nowPlayingEnd,
      },
      {
        title: 'Mai',
        trailerUrl: 'https://www.youtube.com/watch?v=O112mF4EexY',
        posterUrl:
          'https://cdn-images.vtv.vn/562122370168008704/2023/11/28/photo-1-17011453442011344132442.jpg',
        backdropUrl:
          'https://www.homepaylater.vn/static/fc0abcb71153ebfcde03d85678908601/c579c/00_phim_mai_banner_3e0051cdd7.webp',
        description:
          'Câu chuyện về cuộc đời của một người phụ nữ tên Mai, mang trong mình nhiều tổn thương trong quá khứ và khát khao hạnh phúc.',
        filmGenres: 'Tâm lý, Tình cảm',
        duration: 131,
        ageRating: 'T18',
        director: 'Trấn Thành',
        cast: 'Phương Anh Đào, Tuấn Trần',
        country: 'Việt Nam',
        language: 'Tiếng Việt',
        releaseDate: nowPlayingStart,
        endDate: nowPlayingEnd,
      },
      {
        title: 'Dune: Hành Tinh Cát - Phần 2',
        trailerUrl: 'https://www.youtube.com/watch?v=U2Qp5pL3ovA',
        posterUrl:
          'https://upload.wikimedia.org/wikipedia/vi/9/94/Dune_2_VN_poster.jpg?utm_source=vi.wikipedia.org&utm_campaign=index&utm_content=original',
        backdropUrl:
          'https://cdn-media.sforum.vn/storage/app/media/wp-content/uploads/2023/10/dune-hanh-tinh-cat-2023-thumb.jpg',
        description:
          'Paul Atreides tiếp tục hành trình trả thù những kẻ đã hủy hoại gia đình mình, đồng thời phải lựa chọn giữa tình yêu và số phận của vũ trụ.',
        filmGenres: 'Hành động, Viễn tưởng',
        duration: 166,
        ageRating: 'T16',
        director: 'Denis Villeneuve',
        cast: 'Timothée Chalamet, Zendaya',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: nowPlayingStart,
        endDate: nowPlayingEnd,
      },

      // ================= PHIM SẮP CHIẾU =================
      {
        title: 'Avatar: Fire and Ash',
        trailerUrl: 'https://www.youtube.com/watch?v=nb_fFj_0rq8',
        posterUrl:
          'https://m.media-amazon.com/images/M/MV5BZDYxY2I1OGMtN2Y4MS00ZmU1LTgyNDAtODA0MzAyYjI0N2Y2XkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg',
        backdropUrl: 'https://coolmusicltd.com/wp-content/uploads/2025/07/Avatar.jpeg',
        description:
          "Gia đình Sully đối mặt với một tộc người Na'vi tàn bạo đại diện cho lửa và tro tàn. Cuộc chiến sinh tồn trên hành tinh Pandora bước sang trang mới.",
        filmGenres: 'Hành động, Viễn tưởng',
        duration: 190,
        ageRating: 'T13',
        director: 'James Cameron',
        cast: 'Sam Worthington, Zoe Saldaña',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: comingSoonStart,
        endDate: comingSoonEnd,
      },
      {
        title: 'Avengers: Doomsday',
        trailerUrl: 'https://www.youtube.com/watch?v=irVNGjRFZGk',
        posterUrl:
          'https://preview.redd.it/avengers-doomsday-poster-featuring-the-confirmed-cast-so-v0-b8a68egs9n2f1.jpeg?width=1080&crop=smart&auto=webp&s=084b76fd6c5ce580d9c3a94081595b48137d0314',
        backdropUrl:
          'https://preview.redd.it/fanmade-poster-of-avengers-doomsday-hope-yall-like-it-v0-v5iuhwce8ahd1.jpeg?auto=webp&s=b6c88495fb47e1a7ef2733189ad6d75e0ea5537d',
        description:
          'Biệt đội siêu anh hùng Avengers phải tập hợp lại để đối mặt với một mối đe dọa đa vũ trụ mới cực kỳ tàn bạo mang tên Doctor Doom.',
        filmGenres: 'Hành động, Viễn tưởng',
        duration: 150,
        ageRating: 'T13',
        director: 'The Russo Brothers',
        cast: 'Robert Downey Jr.',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: comingSoonStart,
        endDate: comingSoonEnd,
      },
      {
        title: 'Mickey 17',
        trailerUrl: 'https://www.youtube.com/watch?v=osYpGSz_0i4',
        posterUrl: 'https://image.tmdb.org/t/p/original/zmNHgN6fQQgXgqqALjjRYtgjiQi.jpg',
        backdropUrl:
          'https://movieswetextedabout.com/wp-content/uploads/2025/03/Mickey-17-Movie-Review.webp',
        description:
          'Nhân viên nhân bản Mickey 17 thực hiện một nhiệm vụ tự sát trên hành tinh băng giá. Mỗi khi anh ta chết, một phiên bản mới sẽ được tạo ra.',
        filmGenres: 'Khoa học viễn tưởng, Tâm lý',
        duration: 139,
        ageRating: 'T16',
        director: 'Bong Joon-ho',
        cast: 'Robert Pattinson',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: comingSoonStart,
        endDate: comingSoonEnd,
      },
      {
        title: 'Zootopia 2',
        trailerUrl: 'https://www.youtube.com/watch?v=BjkIOU5PhyQ',
        posterUrl: 'https://i.ebayimg.com/images/g/7qwAAOSwDyhgBjDv/s-l1200.jpg',
        backdropUrl: 'https://thedisinsider.com/wp-content/uploads/2021/03/scale-5.jpeg',
        description:
          'Cô cảnh sát thỏ Judy Hopps và anh cáo Nick Wilde trở lại với một vụ án bí ẩn mới làm rung chuyển toàn bộ thành phố thú Zootopia.',
        filmGenres: 'Hoạt hình, Hài',
        duration: 100,
        ageRating: 'P',
        director: 'Jared Bush',
        cast: 'Ginnifer Goodwin',
        country: 'Hoa Kỳ',
        language: 'Lồng tiếng Việt',
        releaseDate: comingSoonStart,
        endDate: comingSoonEnd,
      },
      {
        title: 'Deadpool & Wolverine',
        trailerUrl: 'https://www.youtube.com/watch?v=73_1biulkYk',
        posterUrl:
          'https://www.movieposters.com/cdn/shop/files/scan002_00e0a1a8-b4ad-49ff-861f-8dd64ac12a6d_1024x1024.jpg?v=1762977060',
        backdropUrl:
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS__A1Dba42OoHby-SIG_yD-8Wkcr8jA7SfrZrfVs8gq3kRcbnkgIp8Z4o&s=10',
        description:
          'Hành trình bá đạo của gã lính đánh thuê lắm mồm và dị nhân Người Sói. Cả hai phải gạt bỏ hiềm khích để cứu lấy Đa vũ trụ.',
        filmGenres: 'Hành động, Hài',
        duration: 120,
        ageRating: 'T18',
        director: 'Shawn Levy',
        cast: 'Ryan Reynolds, Hugh Jackman',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: comingSoonStart,
        endDate: comingSoonEnd,
      },
      {
        title: 'Kẻ Trộm Mặt Trăng 4',
        trailerUrl: 'https://www.youtube.com/watch?v=qQlr9-rF32A',
        posterUrl:
          'https://cdn.galaxycine.vn/media/2024/6/20/despicable-me-4-500_1718865149847.jpg',
        backdropUrl:
          'https://baodongnai.com.vn/file/e7837c02876411cd0187645a2551379f/072024/14_3_20240704213209.jpg',
        description:
          'Gru và gia đình chào đón thành viên mới, nhưng sớm phải chạy trốn khỏi một ác nhân mới vượt ngục.',
        filmGenres: 'Hoạt hình, Hài',
        duration: 95,
        ageRating: 'P',
        director: 'Chris Renaud',
        cast: 'Steve Carell',
        country: 'Hoa Kỳ',
        language: 'Lồng tiếng Việt',
        releaseDate: comingSoonStart,
        endDate: comingSoonEnd,
      },
      {
        title: 'Venom: Kèo Cuối',
        trailerUrl: 'https://www.youtube.com/watch?v=__2bjWbetsA',
        posterUrl: 'https://image.tmdb.org/t/p/w500/aosm8NMQ3UyoBVpSxyimorCQykC.jpg',
        backdropUrl:
          'https://simg.zalopay.com.vn/travel/2024/movie/venom-keo-cuoi-3vGP6pK4zXxH.jpg',
        description:
          'Eddie và Venom đang chạy trốn khỏi cả hai thế giới của họ. Khi lưới bủa vây thu hẹp, bộ đôi phải đưa ra quyết định tàn khốc.',
        filmGenres: 'Hành động, Viễn tưởng',
        duration: 110,
        ageRating: 'T16',
        director: 'Kelly Marcel',
        cast: 'Tom Hardy',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: comingSoonStart,
        endDate: comingSoonEnd,
      },

      // ================= PHIM ĐÃ GỠ (ARCHIVED) =================
      {
        title: 'Avatar: Dòng Chảy Của Nước',
        trailerUrl: 'https://www.youtube.com/watch?v=d9MyW72ELq0',
        posterUrl:
          'https://upload.wikimedia.org/wikipedia/vi/e/e0/Avatar_D%C3%B2ng_ch%E1%BA%A3y_c%E1%BB%A7a_n%C6%B0%E1%BB%9Bc_-_Poster_ch%C3%ADnh_th%E1%BB%A9c.jpg?utm_source=vi.wikipedia.org&utm_campaign=index&utm_content=original',
        backdropUrl:
          'https://simg.zalopay.com.vn/travel/2025/movie/chieu-lai-avatar-dong-chay-cua-nuoc-mA7EkH0TSjTf.jpg',
        description:
          'Jake Sully sống cùng gia đình mới ở hành tinh Pandora, cho đến khi một mối đe dọa cũ trở lại.',
        filmGenres: 'Hành động, Phiêu lưu',
        duration: 192,
        ageRating: 'T13',
        director: 'James Cameron',
        cast: 'Sam Worthington, Zoe Saldaña',
        country: 'Hoa Kỳ',
        language: 'Phụ đề Tiếng Việt',
        releaseDate: archivedStart,
        endDate: archivedEnd,
      },
    ],
  });
  console.log('🎬 Đã thêm phim mẫu vào kho');

  // ==========================================
  // 6. SUẤT CHIẾU & MÁY IN VÉ (DYNAMIC)
  // ==========================================
  const latMat = await prisma.movie.findFirst({ where: { title: { contains: 'Lật Mặt 7' } } });
  const godzilla = await prisma.movie.findFirst({ where: { title: { contains: 'Godzilla' } } });
  const mai = await prisma.movie.findFirst({ where: { title: { contains: 'Mai' } } });
  const deadpool = await prisma.movie.findFirst({ where: { title: { contains: 'Deadpool' } } });

  if (latMat && godzilla && mai && deadpool) {
    const today = new Date();
    const day0 = new Date(today);
    const day1 = new Date(today);
    day1.setDate(today.getDate() + 1);
    const day2 = new Date(today);
    day2.setDate(today.getDate() + 2);

    const createTime = (dateBase: Date, hourVN: number, minVN: number) => {
      const d = new Date(dateBase);
      d.setUTCHours(hourVN - 7, minVN, 0, 0);
      return d;
    };

    const showtimesData = [
      // HÔM NAY
      {
        movieId: latMat.id,
        roomId: room1.id,
        start: createTime(day0, 18, 0),
        end: createTime(day0, 20, 30),
      },
      {
        movieId: latMat.id,
        roomId: room2.id,
        start: createTime(day0, 20, 0),
        end: createTime(day0, 22, 30),
      },
      {
        movieId: godzilla.id,
        roomId: room3.id,
        start: createTime(day0, 19, 0),
        end: createTime(day0, 21, 0),
      },
      {
        movieId: mai.id,
        roomId: room1.id,
        start: createTime(day0, 21, 0),
        end: createTime(day0, 23, 15),
      },
      // NGÀY MAI
      {
        movieId: deadpool.id,
        roomId: room2.id,
        start: createTime(day1, 19, 30),
        end: createTime(day1, 21, 30),
      },
      {
        movieId: latMat.id,
        roomId: room1.id,
        start: createTime(day1, 20, 0),
        end: createTime(day1, 22, 30),
      },
      // NGÀY MỐT
      {
        movieId: godzilla.id,
        roomId: room1.id,
        start: createTime(day2, 18, 0),
        end: createTime(day2, 20, 0),
      },
      {
        movieId: deadpool.id,
        roomId: room3.id,
        start: createTime(day2, 20, 15),
        end: createTime(day2, 22, 15),
      },
    ];

    console.log('\n⚙️ Đang lên lịch chiếu và in vé...');

    for (const st of showtimesData) {
      const showtime = await prisma.showtime.create({
        data: { movieId: st.movieId, roomId: st.roomId, startTime: st.start, endTime: st.end },
      });

      const physicalSeats = await prisma.seat.findMany({ where: { roomId: st.roomId } });
      const mockBookedNames = ['A1', 'A2', 'E11', 'E12', 'J1', 'J2']
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      const ticketSeatData = physicalSeats.map((seat) => {
        const seatName = `${seat.row}${seat.number}`;
        return {
          showtimeId: showtime.id,
          seatId: seat.id,
          price: seat.type === 'VIP' ? 20000 : seat.type === 'COUPLE' ? 25000 : 0,
          status: mockBookedNames.includes(seatName) ? 'BOOKED' : ('AVAILABLE' as any),
        };
      });

      await prisma.ticketSeat.createMany({ data: ticketSeatData });
    }
    console.log(`🎟️ Đã tạo ra ${showtimesData.length} suất chiếu và in hàng ngàn vé`);
  }

  console.log('✅ HOÀN TẤT QUÁ TRÌNH SEEDING DATA');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
