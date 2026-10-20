import { WeddingCouple, StoryMilestone, WeddingEvent, GalleryPhoto } from '../types/wedding';

export const weddingCoupleData: WeddingCouple = {
  groom: {
    name: 'Phan Anh',
    fullName: 'Lê Đức Phan Anh',
    title: 'Chú Rể',
    fatherName: 'Lê Đức Minh',
    motherName: 'Trần Thị Mai',
    address: 'Quận Ba Đình, TP. Hà Nội',
    phone: '0912 345 678',
    bankInfo: {
      bankName: 'Vietcombank - Chi nhánh Thăng Long',
      accountNumber: '1029384756',
      accountName: 'LE DUC PHAN ANH',
      qrCodeUrl: 'https://img.vietqr.io/image/VCB-1029384756-compact2.png?amount=0&addInfo=Mung%20cuoi%20Phan%20Anh%20Ngoc%20Yen&accountName=LE%20DUC%20PHAN%20ANH'
    }
  },
  bride: {
    name: 'Ngọc Yến',
    fullName: 'Nguyễn Ngọc Yến',
    title: 'Cô Dâu',
    fatherName: 'Nguyễn Văn Hùng',
    motherName: 'Hoàng Thị Lan',
    address: 'Quận 1, TP. Hồ Chí Minh',
    phone: '0987 654 321',
    bankInfo: {
      bankName: 'Techcombank - Chi nhánh Bến Thành',
      accountNumber: '19038472910015',
      accountName: 'NGUYEN NGOC YEN',
      qrCodeUrl: 'https://img.vietqr.io/image/TCB-19038472910015-compact2.png?amount=0&addInfo=Mung%20cuoi%20Phan%20Anh%20Ngoc%20Yen&accountName=NGUYEN%20NGOC%20YEN'
    }
  },
  // Wedding date: 28th November 2026, 18:00
  weddingDate: '2026-11-28T18:00:00+07:00',
  lunarDate: 'Ngày 20 tháng 10 năm Bính Ngọ'
};

export const storyMilestones: StoryMilestone[] = [
  {
    id: 'story-1',
    year: '2021',
    date: '15 Tháng 10, 2021',
    title: 'Lần Đầu Gặp Gỡ',
    description: 'Một buổi chiều thu trong lành, ánh mắt vô tình chạm nhau và câu chuyện tình yêu bắt đầu từ một cuốn sách chúng mình cùng yêu thích.',
    imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Lần đầu gặp gỡ',
    location: 'Hà Nội'
  },
  {
    id: 'story-2',
    year: '2022',
    date: '14 Tháng 02, 2022',
    title: 'Lời Tỏ Tình Ngọt Ngào',
    description: 'Sau chuỗi ngày cùng nhau sẻ chia mọi vui buồn, chàng đã lấy hết can đảm ngỏ lời yêu nàng với một bó hoa tươi tinh khôi.',
    imageUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Lời tỏ tình ngọt ngào',
    location: 'Phố Cổ'
  },
  {
    id: 'story-3',
    year: '2023',
    date: '20 Tháng 07, 2023',
    title: 'Chuyến Đi Xa Đầu Tiên',
    description: 'Chuyến vi vu khám phá cung đường sương mù Đà Lạt. Cùng nhau ngắm bình minh và nhận ra người ấy chính là mảnh ghép trọn vẹn của cuộc đời mình.',
    imageUrl: 'https://images.unsplash.com/photo-1529636798458-92182e662485?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Chuyến đi đáng nhớ',
    location: 'Đà Lạt'
  },
  {
    id: 'story-4',
    year: '2025',
    date: '24 Tháng 12, 2025',
    title: 'She Said "YES!"',
    description: 'Dưới ánh hoàng hôn vàng rực rỡ bên bờ biển, trong tiếng sóng vỗ và tiếng violin du dương, chiếc nhẫn đính hôn đã được trao cùng lời hẹn ước mãi mãi.',
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Khoảnh khắc cầu hôn',
    location: 'Bờ Biển Phú Quốc'
  },
  {
    id: 'story-5',
    year: '2026',
    date: '28 Tháng 11, 2026',
    title: 'Ngày Chung Đôi',
    description: 'Hành trình 5 năm yêu thương đơm hoa kết trái. Chúng mình chính thức nắm tay nhau bước vào ngưỡng cửa hôn nhân thiêng liêng trước sự chứng kiến của hai họ và bạn bè.',
    imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    imageAlt: 'Ngày cưới thiêng liêng',
    location: 'White Palace Convention Center'
  }
];

export const weddingEvents: WeddingEvent[] = [
  {
    id: 'event-ceremony',
    type: 'ceremony',
    title: 'LỄ THÀNH HÔN',
    subtitle: 'Nghi thức cưới truyền thống gia đình hai họ',
    date: 'Thứ Bảy, 28 Tháng 11, 2026',
    time: '09:00 Sáng',
    lunarTime: 'Giờ Hoàng Đạo (Tỵ)',
    venueName: 'Tư Gia Nhà Trai',
    address: 'Số 68 Đường Phan Đình Phùng, Quán Thánh, Ba Đình, Hà Nội',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.863855881389!2d105.83852037596958!3d21.03813278745591!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135aba8c430e335%3A0x6a256a084c7e638!2zUGhhbiDEkMOsbmggUGjDuW5nLCBRdcOhbiBUaMOhbmgsIEJhIMSQw6xuaCwgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1700000000000',
    mapDirectUrl: 'https://maps.google.com/?q=Phan+Dinh+Phung+Ba+Dinh+Ha+Noi',
    calendarEvent: {
      title: 'Lễ Thành Hôn - Phan Anh & Ngọc Yến',
      details: 'Kính mời quý khách tới tham dự Lễ Thành Hôn trang trọng của Phan Anh & Ngọc Yến tại tư gia.',
      location: 'Số 68 Đường Phan Đình Phùng, Ba Đình, Hà Nội',
      startTime: '20261128T020000Z',
      endTime: '20261128T043000Z'
    }
  },
  {
    id: 'event-reception',
    type: 'reception',
    title: 'TIỆC CƯỚI MỪNG HẠNH PHÚC',
    subtitle: 'Đón tiếp khách quý & tiệc rượu chúc phúc',
    date: 'Thứ Bảy, 28 Tháng 11, 2026',
    time: '18:00 Tối (Đón khách: 17:30)',
    lunarTime: 'Nhằm ngày 20 tháng 10 năm Bính Ngọ',
    venueName: 'Trung Tâm Hội Nghị Tiệc Cưới White Palace',
    address: 'Sảnh Grand Ballroom, 194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. Hồ Chí Minh',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.186638841443!2d106.67382027582522!3d10.796985058814769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528d7d9f67a21%3A0x6b2e1bf35b2e3292!2sWhite%20Palace%20Hoang%20Van%20Thu!5e0!3m2!1svi!2s!4v1700000000001',
    mapDirectUrl: 'https://maps.google.com/?q=White+Palace+Hoang+Van+Thu+Phu+Nhuan',
    calendarEvent: {
      title: 'Tiệc Cưới Mừng Hạnh Phúc - Phan Anh & Ngọc Yến',
      details: 'Trân trọng kính mời quý khách tới chung vui tiệc cưới cùng Phan Anh & Ngọc Yến tại White Palace.',
      location: 'Sảnh Grand Ballroom, White Palace, 194 Hoàng Văn Thụ, Phú Nhuận, TP.HCM',
      startTime: '20261128T110000Z',
      endTime: '20261128T143000Z'
    }
  }
];

export const galleryPhotos: GalleryPhoto[] = [
  // 1. ẢNH CHỤP CHUNG (COUPLE)
  {
    id: 'couple-1',
    title: 'Bên Nhau Mãi Mãi',
    subtitle: 'Nắm tay đi qua thanh xuân',
    category: 'couple',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'landscape'
  },
  {
    id: 'couple-2',
    title: 'Khoảnh Khắc Ngọt Ngào',
    subtitle: 'Ánh mắt trao nhau lời hẹn ước',
    category: 'couple',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'portrait'
  },
  {
    id: 'couple-3',
    title: 'Hoàng Hôn Hẹn Ước',
    subtitle: 'Chỉ cần có anh trong đời',
    category: 'couple',
    thumbnailUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'landscape'
  },
  {
    id: 'couple-4',
    title: 'Bình Yên Bên Nhau',
    subtitle: 'Mỗi ngày đều là ngày hạnh phúc',
    category: 'couple',
    thumbnailUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'landscape'
  },
  {
    id: 'couple-5',
    title: 'Hạnh Phúc Viên Mãn',
    subtitle: 'Khi chúng ta về chung một nhà',
    category: 'couple',
    thumbnailUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'square'
  },
  {
    id: 'couple-6',
    title: 'Nhẫn Cưới Định Mệnh',
    subtitle: 'Gắn kết hai trái tim',
    category: 'couple',
    thumbnailUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'portrait'
  },

  // 2. ẢNH CÔ DÂU (BRIDE)
  {
    id: 'bride-1',
    title: 'Nàng Dâu Ngọc Yến',
    subtitle: 'Vẻ đẹp dịu dàng và tinh khôi',
    category: 'bride',
    thumbnailUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'portrait'
  },
  {
    id: 'bride-2',
    title: 'Nụ Cười Rạng Rỡ',
    subtitle: 'Ngày hạnh phúc nhất cuộc đời',
    category: 'bride',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'square'
  },
  {
    id: 'bride-3',
    title: 'Váy Cưới Lộng Lẫy',
    subtitle: 'Tinh khôi trong tà áo cưới',
    category: 'bride',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'landscape'
  },
  {
    id: 'bride-4',
    title: 'Hoa Cầm Tay Tươi Thắm',
    subtitle: 'Hương thơm tình yêu ngọt ngào',
    category: 'bride',
    thumbnailUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'portrait'
  },
  {
    id: 'bride-5',
    title: 'Nét Duyên Dáng',
    subtitle: 'Ánh mắt chan chứa yêu thương',
    category: 'bride',
    thumbnailUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'square'
  },

  // 3. ẢNH CHÚ RỂ (GROOM)
  {
    id: 'groom-1',
    title: 'Chú Rể Phan Anh',
    subtitle: 'Lịch lãm trong âu phục cưới',
    category: 'groom',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'portrait'
  },
  {
    id: 'groom-2',
    title: 'Phong Độ & Tự Tin',
    subtitle: 'Sẵn sàng đón nàng về dinh',
    category: 'groom',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'square'
  },
  {
    id: 'groom-3',
    title: 'Ánh Nhìn Quyết Đoán',
    subtitle: 'Điểm tựa bình yên cho em',
    category: 'groom',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'landscape'
  },
  {
    id: 'groom-4',
    title: 'Nụ Cười Chú Rể',
    subtitle: 'Hân hoan ngày trọng đại',
    category: 'groom',
    thumbnailUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'portrait'
  },
  {
    id: 'groom-5',
    title: 'Hoa Cài Áo Chú Rể',
    subtitle: 'Sự trang trọng và tinh tế',
    category: 'groom',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    fullUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=90',
    aspectRatio: 'landscape'
  }
];
