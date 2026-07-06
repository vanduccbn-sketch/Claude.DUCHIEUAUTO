/* =========================================================
   CATALOG DATA - NGUỒN DỮ LIỆU DUY NHẤT
   =========================================================
   Cấu trúc:
   - services: các dịch vụ (poster + danh sách thương hiệu + sản phẩm)
   - productCategories: các danh mục sản phẩm (poster + danh sách thương hiệu + sản phẩm)
   - products: TỪ ĐIỂN DUY NHẤT chứa mọi sản phẩm theo "id".
     -> Cả services và productCategories chỉ THAM CHIẾU tới id này,
        không copy dữ liệu ra 2 nơi => không bao giờ trùng folder ảnh.
     -> Folder ảnh tương ứng: assets/images/products/<id>/

   Tên danh mục/thương hiệu/model bên dưới lấy từ thông tin công bố
   công khai của chính các hãng (brand, tên dòng sản phẩm) - đây là dữ
   liệu công khai/factual, không phải nội dung sáng tạo hay hình ảnh
   của bên nào. Ảnh, mô tả chi tiết, giá: bạn gửi sau, mình sẽ điền vào
   đúng field "image", "desc", "price" của từng sản phẩm.
   ========================================================= */

const CATALOG = {

  services: [
    {
      id: "phu-ceramic",
      name: "Phủ Ceramic",
      poster: "assets/images/service/phu-ceramic/poster.jpg",
      brands: [
        { id: "ceramic-pro", name: "Ceramic Pro", products: ["ceramic-pro-9h"] },
        { id: "gtechniq", name: "Gtechniq", products: ["gtechniq-crystal-serum"] },
        { id: "carpro", name: "CarPro", products: ["carpro-cquartz"] }
      ]
    },
    {
      id: "dan-phim-cach-nhiet",
      name: "Dán Phim Cách Nhiệt",
      poster: "assets/images/service/dan-phim-cach-nhiet/poster.jpg",
      brands: [
        { id: "3m-film", name: "3M", products: ["3m-crystalline"] },
        { id: "titan-film", name: "Titan", products: ["titan-premium"] },
        { id: "global-film", name: "Global", products: ["global-ceramic-film"] }
      ]
    },
    {
      id: "do-den",
      name: "Độ Đèn Tăng Sáng",
      poster: "assets/images/service/do-den/poster.jpg",
      brands: [
        { id: "fogway", name: "Fogway", products: ["fogway-led-x1"] },
        { id: "gtr-light", name: "GTR", products: ["gtr-laser-v2"] },
        { id: "x-light", name: "X-Light", products: ["x-light-v20"] },
        { id: "naoevo", name: "NAOEVO", products: ["naoevo-p60"] }
      ]
    },
    {
      id: "decal-doi-mau-xe",
      name: "Decal Đổi Màu / Tem Xe",
      poster: "assets/images/service/decal-doi-mau-xe/poster.jpg",
      brands: [
        { id: "3m-wrap", name: "3M", products: ["3m-2080-series"] },
        { id: "oracal", name: "Oracal", products: ["oracal-970ra"] },
        { id: "avery", name: "Avery Dennison", products: ["avery-scs"] }
      ]
    },
    {
      id: "ppf-bao-ve-son-xe",
      name: "PPF - Phim Bảo Vệ Sơn Xe",
      poster: "assets/images/service/ppf-bao-ve-son-xe/poster.jpg",
      brands: [
        { id: "xpel", name: "XPEL", products: ["xpel-ultimate-plus"] },
        { id: "ax-film", name: "AX Film", products: ["ax-film-tpu"] }
      ]
    },
    {
      id: "cach-am-oto",
      name: "Cách Âm Ô Tô",
      poster: "assets/images/service/cach-am-oto/poster.jpg",
      brands: [
        { id: "drartex", name: "DrArtex", products: ["drartex-standard"] },
        { id: "vibrofiltr", name: "Vibrofiltr", products: ["vibrofiltr-premium"] }
      ]
    },
    {
      id: "phu-gam-oto",
      name: "Phủ Gầm Ô Tô",
      poster: "assets/images/service/phu-gam-oto/poster.jpg",
      brands: [
        { id: "dinitrol", name: "Dinitrol", products: ["dinitrol-4941"] },
        { id: "noxudol", name: "Noxudol", products: ["noxudol-750"] }
      ]
    },
    {
      id: "do-mam-xe",
      name: "Độ Mâm Xe Thể Thao",
      poster: "assets/images/service/do-mam-xe/poster.jpg",
      brands: [
        { id: "enkei", name: "Enkei", products: ["enkei-rpf1"] },
        { id: "rays", name: "Rays", products: ["rays-gram-lights"] },
        { id: "bbs", name: "BBS", products: ["bbs-ch-r"] }
      ]
    },
    {
      id: "do-bodykit",
      name: "Độ Bodykit",
      poster: "assets/images/service/do-bodykit/poster.jpg",
      brands: [
        { id: "bodykit-nhap-khau", name: "Bodykit Nhập Khẩu", products: ["bodykit-nk-sport"] },
        { id: "bodykit-fiber", name: "Bodykit Fiber Glass Thủ Công", products: ["bodykit-fiber-custom"] }
      ]
    }
  ],

  productCategories: [
    {
      id: "man-hinh-o-to",
      name: "Màn Hình Ô Tô",
      poster: "assets/images/products-category/man-hinh-o-to/poster.jpg",
      brands: [
        { id: "gotech", name: "Gotech", products: ["gotech-gt2k", "gotech-gts4"] },
        { id: "zestech", name: "Zestech", products: ["zestech-z18", "zestech-zx10"] },
        { id: "kovar", name: "Kovar", products: ["kovar-t2"] },
        { id: "teyes", name: "Teyes", products: ["teyes-cc3"] },
        { id: "safeview", name: "Safeview", products: ["safeview-elite-360"] }
      ]
    },
    {
      id: "camera-hanh-trinh",
      name: "Camera Hành Trình",
      poster: "assets/images/products-category/camera-hanh-trinh/poster.jpg",
      brands: [
        { id: "utour", name: "UTOUR", products: ["utour-x5"] },
        { id: "vietmap-cam", name: "VIETMAP", products: ["vietmap-h9"] },
        { id: "70mai", name: "70mai", products: ["70mai-a810"] },
        { id: "finevu", name: "FINEVU", products: ["finevu-gx4"] },
        { id: "blackvue", name: "BlackVue", products: ["blackvue-dr770x"] }
      ]
    },
    {
      id: "loa-am-thanh",
      name: "Loa & Âm Thanh",
      poster: "assets/images/products-category/loa-am-thanh/poster.jpg",
      brands: [
        { id: "infinity", name: "Infinity", products: ["infinity-reference"] },
        { id: "jbl", name: "JBL", products: ["jbl-club-6520"] },
        { id: "pioneer", name: "Pioneer", products: ["pioneer-dmh-z6350"] },
        { id: "german-maestro", name: "German-Maestro", products: ["german-maestro-m-line"] },
        { id: "audiotec-fischer", name: "Audiotec Fischer (BRAX / HELIX / MATCH)", products: ["helix-dsp-pro"] }
      ]
    },
    {
      id: "phuoc-hieu-nang-cao",
      name: "Phuộc Hiệu Năng Cao",
      poster: "assets/images/products-category/phuoc-hieu-nang-cao/poster.jpg",
      brands: [
        { id: "kyb", name: "KYB", products: ["kyb-excel-g"] },
        { id: "tein", name: "Tein", products: ["tein-flex-z"] },
        { id: "gforce", name: "G-Force", products: ["gforce-sport"] }
      ]
    },
    {
      id: "mam-do",
      name: "Mâm Độ",
      poster: "assets/images/products-category/mam-do/poster.jpg",
      brands: [
        { id: "enkei-p", name: "Enkei", products: ["enkei-rpf1"] },
        { id: "rays-p", name: "Rays", products: ["rays-gram-lights"] },
        { id: "bbs-p", name: "BBS", products: ["bbs-ch-r"] }
      ]
    }
  ],

  /* =========================================================
     TỪ ĐIỂN SẢN PHẨM DUY NHẤT
     Folder ảnh tương ứng: assets/images/products/<id>/
     Điền "image", "desc", "price" sau khi có thông tin thật.
     ========================================================= */
  products: {
    "ceramic-pro-9h":        { name: "Ceramic Pro 9H",              brand: "Ceramic Pro",      image: "", price: "", desc: "" },
    "gtechniq-crystal-serum":{ name: "Gtechniq Crystal Serum",       brand: "Gtechniq",         image: "", price: "", desc: "" },
    "carpro-cquartz":        { name: "CarPro CQuartz",              brand: "CarPro",           image: "", price: "", desc: "" },

    "3m-crystalline":        { name: "3M Crystalline",              brand: "3M",               image: "", price: "", desc: "" },
    "titan-premium":         { name: "Titan Premium",               brand: "Titan",            image: "", price: "", desc: "" },
    "global-ceramic-film":   { name: "Global Ceramic Film",         brand: "Global",           image: "", price: "", desc: "" },

    "fogway-led-x1":         { name: "Fogway LED X1",               brand: "Fogway",           image: "", price: "", desc: "" },
    "gtr-laser-v2":          { name: "GTR Laser V2",                brand: "GTR",              image: "", price: "", desc: "" },
    "x-light-v20":           { name: "X-Light Bi-LED V20",          brand: "X-Light",          image: "", price: "", desc: "" },
    "naoevo-p60":            { name: "NAOEVO P60",                  brand: "NAOEVO",           image: "", price: "", desc: "" },

    "3m-2080-series":        { name: "3M 2080 Series",              brand: "3M",               image: "", price: "", desc: "" },
    "oracal-970ra":          { name: "Oracal 970RA",                brand: "Oracal",           image: "", price: "", desc: "" },
    "avery-scs":             { name: "Avery Dennison SCS",          brand: "Avery Dennison",   image: "", price: "", desc: "" },

    "xpel-ultimate-plus":    { name: "XPEL Ultimate Plus",          brand: "XPEL",             image: "", price: "", desc: "" },
    "ax-film-tpu":           { name: "AX Film TPU",                 brand: "AX Film",          image: "", price: "", desc: "" },

    "drartex-standard":      { name: "DrArtex Standard",            brand: "DrArtex",          image: "", price: "", desc: "" },
    "vibrofiltr-premium":    { name: "Vibrofiltr Premium",          brand: "Vibrofiltr",       image: "", price: "", desc: "" },

    "dinitrol-4941":         { name: "Dinitrol 4941",               brand: "Dinitrol",         image: "", price: "", desc: "" },
    "noxudol-750":           { name: "Noxudol 750",                 brand: "Noxudol",          image: "", price: "", desc: "" },

    "enkei-rpf1":            { name: "Enkei RPF1",                  brand: "Enkei",            image: "", price: "", desc: "" },
    "rays-gram-lights":      { name: "Rays Gram Lights 57DR",       brand: "Rays",             image: "", price: "", desc: "" },
    "bbs-ch-r":              { name: "BBS CH-R",                    brand: "BBS",              image: "", price: "", desc: "" },

    "bodykit-nk-sport":      { name: "Bodykit Nhập Khẩu - Sport",   brand: "Nhập Khẩu",        image: "", price: "", desc: "" },
    "bodykit-fiber-custom":  { name: "Bodykit Fiber Glass Custom",  brand: "Thủ Công",         image: "", price: "", desc: "" },

    "gotech-gt2k":           { name: "Gotech GT2K",                 brand: "Gotech",           image: "https://cdn.chungauto.vn/uploads/man-hinh-gotech/gotech-gt-2k.jpg", price: "8.900.000₫", desc: "Màn hình Android ô tô Gotech GT2K, tấm nền QLED 2K (2000x1200), RAM 4GB/ROM 32GB, chip 7862 Octa Core, hệ điều hành Android 12. Hỗ trợ Wifi, 4G, Bluetooth, điều khiển giọng nói qua trợ lý Gotech Assistant & Kiki, tích hợp 3 phần mềm bản đồ Carmap/Google Maps/Navitel. Có bản GT2K 360 kèm camera 360 độ (giá 14.900.000₫). Bảo hành 2 năm 1 đổi 1." },
    "gotech-gts4":           { name: "Gotech GT2K Pro",             brand: "Gotech",           image: "", price: "11.900.000₫", desc: "Màn hình Android ô tô Gotech GT2K Pro, màn hình 10 inch tấm nền 2K, tích hợp DSP chỉnh âm thanh chuyên sâu, hỗ trợ CarPlay/Android Auto không dây. Cấu hình mạnh, đa nhiệm mượt, kho ứng dụng CH Play, trợ lý ảo GotechGPT. Phù hợp nâng cấp cho các dòng xe phổ thông." },
    "zestech-z18":           { name: "Zestech ZT360G",              brand: "Zestech",          image: "https://zestech.com.vn/wp-content/uploads/2023/04/ZT-360-1-247x247.jpg", price: "11.900.000₫", desc: "Màn hình Android Zestech ZT360G, thiết kế tràn viền, tích hợp hệ điều hành Android mượt mà, hỗ trợ Wifi/4G, CarPlay/Android Auto, kết nối camera hành trình và cảm biến áp suất lốp. Đại lý chính hãng Zestech tại TP.HCM - Thành Phát Auto." },
    "zestech-zx10":          { name: "Zestech ZX10 Bản Cao Cấp",    brand: "Zestech",          image: "https://zestech.com.vn/wp-content/uploads/2023/09/ZX10-ban-cao-cap-247x247.jpg", price: "11.900.000₫", desc: "Màn hình Android Zestech ZX10 bản cao cấp, cấu hình mạnh, màn hình sắc nét, hỗ trợ đầy đủ Wifi/4G/Bluetooth, CarPlay/Android Auto không dây. Có bản kèm camera 360 độ Sony (giá 13.900.000₫) và bản giới hạn cao cấp hơn (13.900.000₫)." },
    "kovar-t2":              { name: "Kovar T2",                    brand: "Kovar",            image: "", price: "Liên hệ", desc: "Màn hình Android ô tô Kovar T2, thương hiệu quen thuộc trong phân khúc màn hình thông minh tại Việt Nam. Tích hợp GPS dẫn đường, kết nối 4G/Wifi/Bluetooth, hỗ trợ CarPlay/Android Auto, kho ứng dụng giải trí đa dạng. Liên hệ Đức Hiếu Auto để được báo giá theo dòng xe cụ thể." },
    "teyes-cc3":             { name: "Teyes CC3",                   brand: "Teyes",            image: "", price: "Liên hệ", desc: "Màn hình Android ô tô Teyes CC3, sử dụng chip Qualcomm Snapdragon hiệu năng cao, màn hình QLED sắc nét, hỗ trợ CarPlay/Android Auto không dây, DSP chỉnh âm thanh 32-band, camera 360 tùy chọn. Thương hiệu màn hình ô tô phổ biến trên thị trường quốc tế." },
    "safeview-elite-360":    { name: "Safeview Elite 360",          brand: "Safeview",         image: "", price: "Liên hệ", desc: "Camera 360 độ Safeview Elite 360 hỗ trợ quan sát toàn cảnh quanh xe, hình ảnh Full HD sắc nét, chống chói ngược sáng, tương thích với đa số màn hình Android ô tô hiện có trên xe. Giúp hạn chế điểm mù khi đỗ/lùi xe trong không gian hẹp." },

    "utour-x5":              { name: "UTOUR X5",                    brand: "UTOUR",            image: "", price: "Liên hệ", desc: "Camera hành trình UTOUR X5, ghi hình Full HD/2K góc rộng, tích hợp GPS, cảm biến va chạm G-Sensor, ghi hình vòng lặp và chế độ giám sát đỗ xe. UTOUR là thương hiệu camera hành trình được phân phối phổ biến tại Việt Nam." },
    "vietmap-h9":            { name: "VIETMAP H9S",                 brand: "VIETMAP",          image: "", price: "2.450.000₫ - 3.190.000₫", desc: "Camera hành trình VIETMAP H9S, ống kính góc rộng 170°, ghi hình Full HD 1080p sắc nét ngày & đêm, cảm biến G-Sensor tự động khóa video khi va chạm, kết nối Wifi xem/chia sẻ video qua app VIETMAP REC. VIETMAP là thương hiệu Việt Nam nổi bật với dữ liệu cảnh báo biển báo giao thông chi tiết." },
    "70mai-a810":            { name: "70mai T800 4K",               brand: "70mai",            image: "https://70maivietnam.store/wp-content/uploads/2026/02/combo-anh-dai-dien-T800-2-580x580.jpg", price: "7.900.000₫", desc: "Camera hành trình 70mai T800 ghi hình 3 kênh HDR (trước - trong - sau), cảm biến Sony STARVIS 2 kép, độ phân giải 4K 60FPS, tích hợp 4G LTE giám sát xe từ xa, GPS & ADAS, ghi hình khẩn cấp có bộ đệm, siêu tụ điện bền bỉ -40°C đến 85°C, điều khiển giọng nói. Phân phối chính hãng bởi 70mai Việt Nam." },
    "finevu-gx4":            { name: "FINEVU GX4",                  brand: "FINEVU",           image: "", price: "Liên hệ", desc: "Camera hành trình FINEVU GX4 (Hàn Quốc), ghi hình 2 kênh trước-sau độ phân giải cao, chế độ giám sát đỗ xe thông minh, cảnh báo an toàn ADAS, giao diện điều khiển qua ứng dụng di động. Thương hiệu camera hành trình cao cấp đến từ Hàn Quốc." },
    "blackvue-dr770x":       { name: "BlackVue DR770X",             brand: "BlackVue",         image: "", price: "Liên hệ", desc: "Camera hành trình BlackVue DR770X (Hàn Quốc), ghi hình Full HD/2K Cloud, kết nối Wifi & ứng dụng BlackVue giám sát từ xa, chế độ Parking Mode giám sát khi đỗ xe, thiết kế nhỏ gọn kín đáo. Một trong những thương hiệu camera hành trình cao cấp được ưa chuộng toàn cầu." },

    "infinity-reference":    { name: "Infinity Reference 6530CX",   brand: "Infinity",         image: "https://bizweb.dktcdn.net/thumb/medium/100/445/498/products/infinity-ref-6530cx-system.jpg?v=1665989143183", price: "5.520.000₫", desc: "Bộ loa phân tần ô tô Infinity Reference 6530CX 6.5 inch (loa mid + tweeter + phân tần rời), âm thanh cân bằng, chi tiết, phù hợp nâng cấp dàn âm thanh nguyên bản cho hầu hết các dòng xe phổ thông. Hàng chính hãng Harman - phân phối bởi PGI." },
    "jbl-club-6520":         { name: "JBL Club 605CSQ",             brand: "JBL",              image: "https://bizweb.dktcdn.net/thumb/medium/100/445/498/products/jbl-club-605csq-hero-main-0021-x1.jpg?v=1745232088377", price: "6.290.000₫", desc: "Loa phân tần ô tô JBL Club 605CSQ 6.5 inch, công nghệ màng loa PolyPlas, âm thanh sống động đặc trưng JBL, dễ dàng lắp đặt thay thế loa zin. Hàng chính hãng JBL - phân phối bởi PGI." },
    "pioneer-dmh-z6350":     { name: "Pioneer TS-Z65CH",            brand: "Pioneer",          image: "https://bizweb.dktcdn.net/thumb/medium/100/445/498/products/ts-z65ch-1.png?v=1740134783670", price: "11.990.000₫", desc: "Loa phân tần cao cấp Pioneer TS-Z65CH 6.5 inch, thuộc dòng Z-series, màng loa sợi carbon, tái tạo âm thanh chi tiết và mạnh mẽ, phù hợp cho dàn âm thanh độ chuyên sâu. Hàng chính hãng Pioneer - phân phối bởi PGI." },
    "german-maestro-m-line": { name: "German-Maestro M-Line",       brand: "German-Maestro",   image: "", price: "Liên hệ", desc: "Loa ô tô German-Maestro dòng M-Line, thương hiệu loa cao cấp sản xuất tại Đức, nổi tiếng với chất âm mộc, trung thực, được giới chơi âm thanh xe hơi chuyên nghiệp đánh giá cao. Phù hợp cho hệ thống âm thanh độ cao cấp." },
    "helix-dsp-pro":         { name: "HELIX DSP PRO MK2",           brand: "Audiotec Fischer", image: "https://www.audiotec-fischer.de/media/image/a4/ca/82/HELIX-DSP-PRO-MK2_pers_Outputs_1280x849px_16-04-20_600x600.jpg", price: "Liên hệ", desc: "Bộ xử lý âm thanh (DSP) HELIX DSP PRO MK2 - sản xuất tại Đức bởi Audiotec Fischer, xử lý tín hiệu 10 kênh, độ phân giải 96kHz/32-bit, DSP 64-bit 1.2 tỷ phép tính/giây, ngõ vào High-level/RCA/Optical/Coaxial. Giải pháp chỉnh âm chuyên sâu cho dàn âm thanh ô tô cao cấp." },

    "kyb-excel-g":           { name: "KYB Excel-G",                 brand: "KYB",              image: "", price: "", desc: "" },
    "tein-flex-z":           { name: "Tein Flex Z",                 brand: "Tein",             image: "", price: "", desc: "" },
    "gforce-sport":          { name: "G-Force Sport",               brand: "G-Force",          image: "", price: "", desc: "" }
  }
};

window.CATALOG = CATALOG;
