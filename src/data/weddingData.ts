import { WeddingCouple, StoryMilestone, WeddingStory, WeddingEvent, GalleryPhoto } from '../types/wedding';

export const weddingCoupleData: WeddingCouple = {
  groom: {
    name: 'Phan Long',
    fullName: 'Lê Đức Phan Long',
    title: 'Chú Rể',
    fatherName: 'Lê Đức Minh',
    motherName: 'Trần Thị Mai',
    address: 'Quận Ba Đình, TP. Hà Nội',
    phone: '0912 345 678',
    bankInfo: {
      bankName: 'Vietcombank - Chi nhánh Thăng Long',
      accountNumber: '1029384756',
      accountName: 'LE DUC PHAN LONG',
      qrCodeUrl: 'https://img.vietqr.io/image/VCB-1029384756-compact2.png?amount=0&addInfo=Mung%20cuoi%20Phan%20Long%20Thuy%20Linh&accountName=LE%20DUC%20PHAN%20LONG'
    }
  },
  bride: {
    name: 'Thùy Linh',
    fullName: 'Nguyễn Thị Thùy Linh',
    title: 'Cô Dâu',
    fatherName: 'Nguyễn Văn Hùng',
    motherName: 'Hoàng Thị Lan',
    address: 'Quận 1, TP. Hồ Chí Minh',
    phone: '0987 654 321',
    bankInfo: {
      bankName: 'Techcombank - Chi nhánh Bến Thành',
      accountNumber: '19038472910015',
      accountName: 'NGUYEN THI THUY LINH',
      qrCodeUrl: 'https://img.vietqr.io/image/TCB-19038472910015-compact2.png?amount=0&addInfo=Mung%20cuoi%20Phan%20Long%20Thuy%20Linh&accountName=NGUYEN%20THI%20THUY%20LINH'
    }
  },
  // Wedding date: 24th December 2026, 18:00
  weddingDate: '2026-12-24T18:00:00+07:00',
  lunarDate: 'Ngày 16 tháng 11 năm Bính Ngọ'
};

export const weddingStoryData: WeddingStory = {
  title: 'Chuyện Chúng Mình',
  subtitle: 'Our Love Story',
  quote: 'Gặp gỡ là duyên phận, nắm tay là định mệnh, và cùng nhau già đi là lời hứa trọn đời.',
  paragraphs: [
    'Mọi điều kỳ diệu đều bắt đầu từ một khoảnh khắc ngỡ như vô tình. Một buổi chiều thu trong lành dịu mát, ánh mắt vô tình chạm nhau và câu chuyện tình yêu của chúng mình bắt đầu nảy nở từ những trang sách yêu thích, từ nụ cười ấm áp và sự đồng điệu kỳ lạ trong tâm hồn.',
    'Những ngày tháng sau đó là chuỗi ngày ngọt ngào khi cả hai cùng nhau sẻ chia mọi vui buồn trong cuộc sống. Từ những buổi hẹn hò dưới tán cây rợp bóng, những chuyến vi vu ngắm bình minh và sương mờ cao nguyên, cho đến những buổi tối bình dị lắng nghe nhau tâm sự sau một ngày dài làm việc mỏi mệt.',
    'Tình yêu của chúng mình không ồn ào hay phô trương, mà bền bỉ, chân thành và sâu lắng qua từng năm tháng. Mỗi ngày trôi qua, chúng mình càng thấu hiểu, trân quý và nhận ra đối phương chính là mảnh ghép hoàn hảo nhất mà cuộc đời đã mang lại.',
    'Và rồi, dưới ánh hoàng hôn vàng rực rỡ bên bờ biển sóng vỗ dập dềnh, chiếc nhẫn đính hôn đã được trao cùng lời hẹn ước thiêng liêng mãi mãi. Hôm nay, trước sự chứng kiến và chúc phúc của hai bên gia đình cùng những người bạn thân thương, chúng mình chính thức nắm chặt tay nhau bước vào ngưỡng cửa hôn nhân — mở ra một chương mới trọn vẹn yêu thương và hạnh phúc.'
  ],
  signature: 'Phan Long & Thùy Linh',
  featuredImages: [
    {
      url: '/images/wedding/optimized/_DSC3182.jpg',
      alt: 'Phan Long & Thùy Linh ngày chung đôi',
      caption: 'Khoảnh khắc thiêng liêng'
    },
    {
      url: '/images/wedding/optimized/_DSC2387.jpg',
      alt: 'Khung trời hạnh phúc',
      caption: 'Bên nhau bình yên'
    },
    {
      url: '/images/wedding/optimized/_DSC2007.jpg',
      alt: 'Nụ cười rạng rỡ của đôi uyên ương',
      caption: 'Hạnh phúc trọn vẹn'
    }
  ]
};

// Kept for backward compatibility
export const storyMilestones: StoryMilestone[] = [];

export const weddingEvents: WeddingEvent[] = [
  {
    id: 'event-ceremony',
    type: 'ceremony',
    title: 'LỄ ĂN HỎI & ĐÍNH HÔN',
    subtitle: 'Nghi thức trao duyên & trao tráp truyền thống hai họ',
    date: 'Thứ Tư, 23 Tháng 12, 2026',
    time: '09:00 Sáng',
    lunarTime: 'Nhằm ngày 15 tháng 11 năm Bính Ngọ (Rằm tháng 11)',
    venueName: 'Tư Gia Nhà Gái',
    address: 'Quận 1, TP. Hồ Chí Minh',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.863855881389!2d105.83852037596958!3d21.03813278745591!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135aba8c430e335%3A0x6a256a084c7e638!2zUGhhbiDEkMOsbmggUGjDuW5nLCBRdcOhbiBUaMOhbmgsIEJhIMSQw6xuaCwgSMOgIE7hu5lp!5e0!3m2!1svi!2s!4v1700000000000',
    mapDirectUrl: 'https://maps.google.com/?q=Quan+1+TP+Ho+Chi+Minh',
    calendarEvent: {
      title: 'Lễ Ăn Hỏi & Đính Hôn - Phan Long & Thùy Linh',
      details: 'Kính mời quý khách tới tham dự Lễ Ăn Hỏi & Đính Hôn trang trọng của Phan Long & Thùy Linh.',
      location: 'Tư Gia Nhà Gái, Quận 1, TP. Hồ Chí Minh',
      startTime: '20261223T020000Z',
      endTime: '20261223T043000Z'
    }
  },
  {
    id: 'event-reception',
    type: 'reception',
    title: 'TIỆC CƯỚI MỪNG HẠNH PHÚC',
    subtitle: 'Đón tiếp khách quý & tiệc rượu chúc phúc',
    date: 'Thứ Năm, 24 Tháng 12, 2026',
    time: '18:00 Tối (Đón khách: 17:30)',
    lunarTime: 'Nhằm ngày 16 tháng 11 năm Bính Ngọ',
    venueName: 'Trung Tâm Hội Nghị Tiệc Cưới White Palace',
    address: 'Sảnh Grand Ballroom, 194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP. Hồ Chí Minh',
    mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.186638841443!2d106.67382027582522!3d10.796985058814769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528d7d9f67a21%3A0x6b2e1bf35b2e3292!2sWhite%20Palace%20Hoang%20Van%20Thu!5e0!3m2!1svi!2s!4v1700000000001',
    mapDirectUrl: 'https://maps.google.com/?q=White+Palace+Hoang+Van+Thu+Phu+Nhuan',
    calendarEvent: {
      title: 'Tiệc Cưới Mừng Hạnh Phúc - Phan Long & Thùy Linh',
      details: 'Trân trọng kính mời quý khách tới chung vui tiệc cưới cùng Phan Long & Thùy Linh tại White Palace.',
      location: 'Sảnh Grand Ballroom, White Palace, 194 Hoàng Văn Thụ, Phú Nhuận, TP.HCM',
      startTime: '20261224T110000Z',
      endTime: '20261224T143000Z'
    }
  }
];

export const galleryPhotos: GalleryPhoto[] = [
  {
    id: 'photo-1',
    title: 'Ánh Mắt Yêu Thương',
    subtitle: 'Nắm tay đi qua năm tháng thanh xuân',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC1879.jpg',
    fullUrl: '/images/wedding/optimized/_DSC1879.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-2',
    title: 'Nụ Cười Rạng Rỡ',
    subtitle: 'Ngày hạnh phúc nhất cuộc đời',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC1929.jpg',
    fullUrl: '/images/wedding/optimized/_DSC1929.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-3',
    title: 'Bình Yên Bên Nhau',
    subtitle: 'Khoảnh khắc ngọt ngào ấm áp',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC1982.jpg',
    fullUrl: '/images/wedding/optimized/_DSC1982.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-4',
    title: 'Lời Hẹn Ước Trăm Năm',
    subtitle: 'Ánh mắt trao nhau niềm tin vẹn nguyên',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC2007.jpg',
    fullUrl: '/images/wedding/optimized/_DSC2007.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-5',
    title: 'Nắm Chặt Tay Nhau',
    subtitle: 'Cùng nhau đi qua bao mùa giông bão',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC2014.jpg',
    fullUrl: '/images/wedding/optimized/_DSC2014.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-6',
    title: 'Khoảnh Khắc Hân Hoan',
    subtitle: 'Nụ cười tỏa nắng trong ngày vui',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC2101.jpg',
    fullUrl: '/images/wedding/optimized/_DSC2101.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-7',
    title: 'Dịu Dàng Sánh Đôi',
    subtitle: 'Tình yêu đơm hoa kết trái',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC2145.jpg',
    fullUrl: '/images/wedding/optimized/_DSC2145.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-8',
    title: 'Khung Trời Hạnh Phúc',
    subtitle: 'Không gian ngập tràn sắc hoa và tình yêu',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC2387.jpg',
    fullUrl: '/images/wedding/optimized/_DSC2387.jpg',
    aspectRatio: 'landscape'
  },
  {
    id: 'photo-9',
    title: 'Trao Nhau Nụ Cười',
    subtitle: 'Hạnh phúc giản dị mà thiêng liêng',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC2517.jpg',
    fullUrl: '/images/wedding/optimized/_DSC2517.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-10',
    title: 'Tình Yêu Viên Mãn',
    subtitle: 'Hai trái tim chung một nhịp đập',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC2695.jpg',
    fullUrl: '/images/wedding/optimized/_DSC2695.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-11',
    title: 'Giai Điệu Hạnh Phúc',
    subtitle: 'Từng phút giây bên em đều quý giá',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC2797.jpg',
    fullUrl: '/images/wedding/optimized/_DSC2797.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-12',
    title: 'Hương Sắc Tình Nồng',
    subtitle: 'Mỗi ngày yêu em nhiều hơn hôm qua',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC2926.jpg',
    fullUrl: '/images/wedding/optimized/_DSC2926.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-13',
    title: 'Vẻ Đẹp Tinh Khôi',
    subtitle: 'Nàng dâu Thùy Linh xinh đẹp rạng ngời',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC2943.jpg',
    fullUrl: '/images/wedding/optimized/_DSC2943.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-14',
    title: 'Nét Duyên Dáng',
    subtitle: 'Ánh mắt rạng ngời hạnh phúc',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC3000.jpg',
    fullUrl: '/images/wedding/optimized/_DSC3000.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-15',
    title: 'Chú Rể Lịch Lãm',
    subtitle: 'Phan Long phong độ trong âu phục cưới',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC3109.jpg',
    fullUrl: '/images/wedding/optimized/_DSC3109.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-16',
    title: 'Ngày Chung Đôi',
    subtitle: 'Khởi đầu cho một tổ ấm ngập tràn tiếng cười',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC3182.jpg',
    fullUrl: '/images/wedding/optimized/_DSC3182.jpg',
    aspectRatio: 'landscape'
  },
  {
    id: 'photo-17',
    title: 'Thanh Xuân Có Nhau',
    subtitle: 'Cùng nhau đi khắp những nẻo đường yêu dấu',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC3216.jpg',
    fullUrl: '/images/wedding/optimized/_DSC3216.jpg',
    aspectRatio: 'landscape'
  },
  {
    id: 'photo-18',
    title: 'Nguyện Ước Trọn Đời',
    subtitle: 'Bên nhau đến đầu bạc răng long',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC3261.jpg',
    fullUrl: '/images/wedding/optimized/_DSC3261.jpg',
    aspectRatio: 'landscape'
  },
  {
    id: 'photo-19',
    title: 'Hạnh Phúc Giản Đơn',
    subtitle: 'Chỉ cần có anh trong đời',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC3306.jpg',
    fullUrl: '/images/wedding/optimized/_DSC3306.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-20',
    title: 'Bên Nhau Mãi Mãi',
    subtitle: 'Tình yêu vĩnh cửu qua bao năm tháng',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC3388.jpg',
    fullUrl: '/images/wedding/optimized/_DSC3388.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-21',
    title: 'Hoàng Hôn Tình Yêu',
    subtitle: 'Ánh chiều tà bên người thương',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC3447.jpg',
    fullUrl: '/images/wedding/optimized/_DSC3447.jpg',
    aspectRatio: 'landscape'
  },
  {
    id: 'photo-22',
    title: 'Nụ Cười Chú Rể',
    subtitle: 'Hân hoan ngày rước nàng về dinh',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC3538.jpg',
    fullUrl: '/images/wedding/optimized/_DSC3538.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-23',
    title: 'Ngọt Ngào Từng Phút Giây',
    subtitle: 'Sự chở che và quan tâm ấm áp',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC3551.jpg',
    fullUrl: '/images/wedding/optimized/_DSC3551.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-24',
    title: 'Trọn Vẹn Yêu Thương',
    subtitle: 'Mảnh ghép hoàn hảo của đời nhau',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC3563.jpg',
    fullUrl: '/images/wedding/optimized/_DSC3563.jpg',
    aspectRatio: 'portrait'
  },
  {
    id: 'photo-25',
    title: 'Hành Trình Mới Bắt Đầu',
    subtitle: 'Cùng nhau viết tiếp những trang hạnh phúc',
    category: 'all',
    thumbnailUrl: '/images/wedding/thumbs/_DSC3660.jpg',
    fullUrl: '/images/wedding/optimized/_DSC3660.jpg',
    aspectRatio: 'portrait'
  }
];
