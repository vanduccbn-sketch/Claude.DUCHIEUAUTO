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
        {
          id: "zestech", name: "Zestech",
          types: [
            { id: "co-camera-360", name: "Có Camera 360", products: ["zestech-zt360-base","zestech-zt360g","zestech-z18-360","zestech-zt3-360-vf3","zestech-zx-adas-cc-360","zestech-zx-adas-tc-360"] },
            { id: "khong-camera-360", name: "Không Camera 360", products: ["zestech-z18","zestech-zx10-gioi-han","zestech-zx10-cao-cap","zestech-zx-adas-tc","zestech-zx-adas-gioi-han","zestech-zt5-vf5"] }
          ]
        },
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
        { id: "vietmap-cam", name: "VIETMAP", products: ["vietmap-sc620","vietmap-v740","vietmap-l110","vietmap-s720","vietmap-r440","vietmap-s860","vietmap-speedmap-m2","vietmap-ts-c1l","vietmap-ts-5k","vietmap-ts-3k","vietmap-ts-2k-lite","vietmap-ts-c1"] },
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
        {
          id: "jbl", name: "JBL",
          types: [
            { id: "loa-o-to", name: "Loa Ô Tô", products: ["jbl-club-64","jbl-club-64c","jbl-club-64csq","jbl-club-605csq","jbl-club-64sq","jbl-stage1-62cf","jbl-stadium-62cf","jbl-basspro-hub","jbl-basspro-sl2","jbl-stage3-x637f","jbl-stage2-634","jbl-stage3-607cf"] },
            { id: "loa-sub", name: "Loa Sub", products: ["jbl-club-marine-10-sub","jbl-stage-1200d","jbl-club-1000ssl","jbl-club-122sl","jbl-club-102sl","jbl-basspro-lite","jbl-sub-st82","jbl-basspro-go","jbl-basspro-nano"] },
            { id: "am-ly", name: "Âm Ly", products: ["jbl-dsp-k86","jbl-dsp-3544","jbl-ms8","jbl-club-a754","jbl-gto1201-1-ii","jbl-dsp-4086","jbl-stadium-4","jbl-stadium-1000","jbl-ampcb-a600","jbl-marine-ma4505"] }
          ]
        },
        {
          id: "infinity", name: "Infinity",
          types: [
            { id: "loa-o-to", name: "Loa Ô Tô", products: ["infinity-spkka203s","infinity-kap-60-11cs","infinity-ref-1070","infinity-primus-603cf","infinity-infspkka603cf","infinity-spkka63xf","infinity-primus-693c","infinity-beta-be621","infinity-ref-375tx","infinity-perfect-300m","infinity-kappa-20mx"] },
            { id: "loa-sub", name: "Loa Sub", products: ["infinity-ref-1220de","infinity-primus-1270b","infinity-kappa-1000w","infinity-kappa-800w","infinity-ref1000s","infinity-subrf123w","infinity-reference-1000ssl","infinity-basslink-dc-blk","infinity-basslink-sm2","infinity-basslink-mini"] },
            { id: "am-ly", name: "Âm Ly", products: ["infinity-primus60041a","infinity-kappa-four","infinity-kappa-onek","infinity-reference-3004a","infinity-kappa-five","infinity-sdp4425"] }
          ]
        },
        {
          id: "harman-kardon", name: "Harman/Kardon",
          types: [
            { id: "loa-o-to", name: "Loa Ô Tô", products: ["hk-f6cf","hk-f6f","hk-flow75t","hk-flow-300s","hk-flow-600cf"] },
            { id: "loa-sub", name: "Loa Sub", products: ["hk-feel-700","hk-flow-80"] },
            { id: "am-ly", name: "Âm Ly", products: ["hk-ca-5250","hk-ca-280"] }
          ]
        },
        {
          id: "pioneer", name: "Pioneer",
          types: [
            { id: "loa-o-to", name: "Loa Ô Tô", products: ["pioneer-ts-z65ch","pioneer-ts-a1608c","pioneer-ts-g1620f-2"] },
            { id: "loa-sub", name: "Loa Sub", products: ["pioneer-ts-a30s4","pioneer-ts-wx140da"] },
            { id: "am-ly", name: "Âm Ly", products: ["pioneer-gm-a6704","pioneer-gm-d8704"] }
          ]
        },
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
    /* ---------- Zestech - Có Camera 360 ---------- */
    "zestech-zt360-base": { name: "Zestech ZT360 Base", brand: "Zestech", price: "13.900.000₫", desc: "Màn hình Android tích hợp Camera 360 độ với màn hình 2K sắc nét, khung nguyên khối hợp kim titan tản nhiệt tốt. Hỗ trợ trợ lý giọng nói Kiki, cảnh báo tốc độ, tra cứu phạt nguội và tích hợp các ứng dụng dẫn đường Vietmap, Google Maps, Navitel.", specs: [["RAM/ROM","4GB/32GB"],["Chip xử lý","UIS7862S 8 nhân (ARM Cortex-A55)"],["Màn hình","9/10.1 inch 2K (2000x1200), IPS, kính cường lực 2.5D"],["Hệ điều hành","Android 10"],["Kết nối","Wifi, Bluetooth, SIM 4G"],["Camera 360","Có (4 mắt camera: trước, sau, 2 gương)"],["Bảo hành","2 năm, 1 đổi 1 trong năm đầu, dùng thử 7 ngày"]] },
    "zestech-zt360g": { name: "Zestech ZT360G", brand: "Zestech", price: "11.900.000₫", desc: "Màn hình Android tích hợp Camera 360 độ ghi lại hành trình thời gian thực, hỗ trợ điều khiển giọng nói và bản đồ Vietmap, Google Maps, Navitel. Tặng kèm Vietmap S1 trọn đời, SIM 4G, USB 32GB, cảm biến áp suất lốp.", specs: [["RAM/ROM","3GB/32GB"],["Chip xử lý","UIS8581, ARM Cortex-A55 8x1.6GHz"],["Màn hình","9/10 inch, 1024x600px IPS, kính cường lực 2.5D"],["Hệ điều hành","Android 10"],["Kết nối","Wifi, Bluetooth, SIM 4G"],["Camera 360","Có"],["Bảo hành","2 năm, 1 đổi 1 trong năm đầu, dùng thử 7 ngày"]] },
    "zestech-z18-360": { name: "Zestech Z18 360", brand: "Zestech", price: "9.500.000₫", desc: "Lựa chọn hoàn hảo cho chủ xe cần giải pháp lái xe thông minh với Camera 360 độ tích hợp. Trợ lý giọng nói Kiki hỗ trợ đa vùng miền, theo dõi hành trình qua app Zestech, tự động tra cứu phạt nguội bằng giọng nói và cập nhật OTA.", specs: [["RAM/ROM","4GB/32GB"],["Chip xử lý","UIS7862S 8 nhân"],["Màn hình","9 inch hoặc 10.1 inch, HD 1280x720"],["Hệ điều hành","Android 10"],["Camera 360","Có"],["Tản nhiệt","Tản nhiệt khí"],["Bảo hành","2 năm, 1 đổi 1 trong năm đầu"]] },
    "zestech-zt3-360-vf3": { name: "Zestech ZT3 Tích Hợp Camera 360 (VinFast VF3)", brand: "Zestech", price: "13.900.000₫", desc: "Màn hình Android chuyên dụng dành riêng cho VinFast VF3, tích hợp Camera 360 độ và hệ điều hành kép Android + VinFast OS. Trang bị trợ lý AI Kiki, kết nối 4G/Wifi/Bluetooth, tặng kèm SIM 4G miễn phí 1 năm.", specs: [["RAM/ROM","3GB/32GB"],["Chip xử lý","Qualcomm SDM450"],["Màn hình","9/10 inch IPS LED"],["Hệ điều hành","Android + VinFast OS (song song)"],["Kết nối","Wifi, Bluetooth, khe SIM 4G"],["Camera 360","Có"],["Bảo hành","2 năm, 1 đổi 1 trong năm đầu, dùng thử 7 ngày"]] },
    "zestech-zx-adas-cc-360": { name: "Zestech ZX ADAS Cao Cấp Có Camera 360", brand: "Zestech", price: "19.900.000₫", desc: "Màn hình Android cao cấp kết hợp màn hình QLED 2K độ phân giải cao với công nghệ Camera 360 (8 mắt camera AI) và hệ thống hỗ trợ lái ADAS: cảnh báo va chạm, cảnh báo lệch làn, nhận diện biển báo. Hỗ trợ CarPlay/Android Auto không dây.", specs: [["RAM/ROM","8GB/128GB"],["Chip xử lý","UIS7870SC 8 nhân, tiến trình 6nm"],["GPU","ARM Mali-M57"],["Màn hình","QLED 2K (2000x1200), 9/10 inch"],["Hệ điều hành","Android 13"],["Kết nối","CarPlay/Android Auto không dây, Bluetooth, Wifi, 4G"],["Camera 360","Có (8 mắt camera, xử lý AI)"],["ADAS","Cảnh báo va chạm (FCW), cảnh báo lệch làn (LDWS), nhận diện biển báo"],["Âm thanh","Chip AKM7738, 5.1 surround, 32 hiệu ứng"],["Bảo hành","2 năm, 1 đổi 1 trong năm đầu, dùng thử 7 ngày"]] },
    "zestech-zx-adas-tc-360": { name: "Zestech ZX ADAS Tiêu Chuẩn Có Camera 360", brand: "Zestech", price: "17.900.000₫", desc: "Màn hình Android tích hợp Camera 360 (4 mắt camera góc rộng) cùng hệ thống hỗ trợ lái ADAS với NPU AI 8 TOPS: cảnh báo va chạm, cảnh báo lệch làn, nhận diện biển báo giao thông. Hỗ trợ CarPlay/Android Auto không dây, xem Youtube không quảng cáo.", specs: [["RAM/ROM","6GB/128GB"],["Chip xử lý","UIS7862 8 nhân, tiến trình 6nm"],["GPU","ARM Mali-M57"],["AI (NPU)","8 TOPS"],["Màn hình","9/10 inch HD (1280x720)"],["Hệ điều hành","Android 13"],["Kết nối","CarPlay/Android Auto không dây, Wifi 5G, 4G, GPS"],["Camera 360","Có (4 mắt camera góc rộng)"],["Bảo hành","2 năm, 1 đổi 1 trong năm đầu"]] },

    /* ---------- Zestech - Không Camera 360 ---------- */
    "zestech-z18": { name: "Zestech Z18", brand: "Zestech", price: "4.900.000₫", desc: "Màn hình Android giải trí cảm ứng với thiết kế 10 inch Full HD, kết nối 4G và kho ứng dụng giải trí phong phú (Youtube, Spotify, Netflix). Cập nhật phần mềm tự động OTA, trợ lý giọng nói Kiki hỗ trợ 3 miền, tra cứu phạt nguội. Không tích hợp Camera 360.", specs: [["RAM/ROM","2GB/32GB"],["Chip xử lý","UIS8581, GPU GE8322 (tới 550MHz)"],["Màn hình","10 inch, 1280x720px, IPS Full HD, kính cường lực 2.5D"],["Hệ điều hành","Android 10"],["Kết nối","Wifi, Bluetooth, SIM 4G"],["Camera 360","Không"],["Bảo hành","18 tháng, 1 đổi 1 trong năm đầu, dùng thử 7 ngày"]] },
    "zestech-zx10-gioi-han": { name: "Zestech ZX10 Bản Giới Hạn", brand: "Zestech", price: "13.900.000₫", desc: "Phiên bản nâng cấp mạnh mẽ của dòng ZX10, kết hợp độ phân giải 2K sắc nét, chip UIS7862S mới và hệ thống tản nhiệt Titan độc quyền. Hỗ trợ trợ lý AI Kiki, đa nhiệm chia màn hình, cập nhật OTA tự động. Tương thích lắp thêm camera 360 (tùy chọn).", specs: [["RAM/ROM","8GB/128GB"],["Chip xử lý","UIS7862S 8 nhân"],["Màn hình","2K (2000x1200), 9-10.1 inch"],["Hệ điều hành","Android 10"],["Kết nối","Wifi, 4G"],["Camera 360","Không (tương thích lắp thêm)"],["Bảo hành","2 năm, 1 đổi 1 trong năm đầu"]] },
    "zestech-zx10-cao-cap": { name: "Zestech ZX10 Bản Cao Cấp", brand: "Zestech", price: "11.900.000₫", desc: "Màn hình Android cao cấp với chip UIS7862S xử lý nhanh, khung hợp kim titan tản nhiệt, điều khiển giọng nói AI Kiki. Hỗ trợ đa nhiệm chia màn hình, cảnh báo tốc độ/bắn tốc độ, tích hợp Vietmap, Google Maps, Navitel. Không tích hợp Camera 360.", specs: [["RAM/ROM","4GB/64GB"],["Chip xử lý","UIS7862S 8 nhân (ARM Cortex-A75 + A55)"],["Màn hình","9/10.1 inch IPS, 1280x720"],["Hệ điều hành","Android 10"],["Kết nối","Wifi, Bluetooth, SIM 4G"],["Camera 360","Không"],["Bảo hành","2 năm, 1 đổi 1 trong năm đầu"]] },
    "zestech-zx-adas-tc": { name: "Zestech ZX ADAS Tiêu Chuẩn", brand: "Zestech", price: "13.900.000₫", desc: "Màn hình Android trang bị hệ thống hỗ trợ lái ADAS: nhận diện biển báo giao thông, cảnh báo va chạm, cảnh báo lệch làn với NPU AI 8 TOPS. Hỗ trợ CarPlay/Android Auto không dây, Wifi 5G và 4G tốc độ cao. Không tích hợp Camera 360.", specs: [["RAM/ROM","6GB/128GB"],["Chip xử lý","UIS7862 8 nhân, tiến trình 6nm"],["GPU","ARM Mali-M57"],["AI (NPU)","8 TOPS"],["Màn hình","9/10 inch HD (1280x720)"],["Hệ điều hành","Android 13"],["Kết nối","CarPlay/Android Auto không dây, Wifi 5G, 4G"],["Camera 360","Không"],["Bảo hành","2 năm, 1 đổi 1 trong năm đầu"]] },
    "zestech-zx-adas-gioi-han": { name: "Zestech ZX ADAS Giới Hạn (RAM 12GB/ROM 512GB)", brand: "Zestech", price: "19.900.000₫", desc: "Phiên bản cao cấp nhất của Zestech năm 2025 với chip AI ZT-A86 hiệu năng vượt trội, màn hình QLED 2K chống chói. Hệ thống ADAS thế hệ mới: cảnh báo va chạm, cảnh báo lệch làn, nhận diện biển báo, phát hiện người đi bộ. Không tích hợp Camera 360 sẵn (tặng kèm camera hành trình ADAS).", specs: [["RAM/ROM","12GB/512GB"],["Chip xử lý","ZT-A86 AI chip (8 nhân)"],["Màn hình","2K (2000x1200), 9-10.1 inch, QLED chống chói"],["Hệ điều hành","Android 13"],["Kết nối","4G LTE, Wifi 5G, CarPlay/Android Auto"],["Camera 360","Không (tặng kèm camera hành trình ADAS)"],["Âm thanh","AI DSP AKM7738, chỉnh EQ 32 dải"],["Tản nhiệt","3 lớp hợp kim Titan"],["Bảo hành","2 năm, 1 đổi 1 trong năm đầu"]] },
    "zestech-zt5-vf5": { name: "Zestech ZT5 13 Inch (VinFast VF5)", brand: "Zestech", price: "12.400.000₫", desc: "Màn hình Android thiết kế riêng cho VinFast VF5 với màn hình lớn 13 inch độ phân giải 2K, kính cường lực 2.5D. Trợ lý giọng nói Kiki đa vùng miền, âm thanh DSP 16 kênh chỉnh EQ 32 dải, theo dõi hành trình qua app Zestech. Không tích hợp Camera 360 sẵn (tặng kèm camera lùi).", specs: [["RAM/ROM","4GB/64GB"],["Chip xử lý","7862 TS10, 8 nhân"],["Màn hình","13 inch, 2000x1200px, kính cường lực 2.5D"],["Hệ điều hành","Android 10"],["Kết nối","Wifi, Bluetooth, SIM 4G"],["Camera 360","Không (tặng kèm camera lùi)"],["Âm thanh","DSP 16 kênh, chỉnh EQ 32 dải"],["Bảo hành","2 năm, 1 đổi 1 trong năm đầu"]] },

    "kovar-t2":              { name: "Kovar T2",                    brand: "Kovar",            image: "", price: "Liên hệ", desc: "Màn hình Android ô tô Kovar T2, thương hiệu quen thuộc trong phân khúc màn hình thông minh tại Việt Nam. Tích hợp GPS dẫn đường, kết nối 4G/Wifi/Bluetooth, hỗ trợ CarPlay/Android Auto, kho ứng dụng giải trí đa dạng. Liên hệ Đức Hiếu Auto để được báo giá theo dòng xe cụ thể." },
    "teyes-cc3":             { name: "Teyes CC3",                   brand: "Teyes",            image: "", price: "Liên hệ", desc: "Màn hình Android ô tô Teyes CC3, sử dụng chip Qualcomm Snapdragon hiệu năng cao, màn hình QLED sắc nét, hỗ trợ CarPlay/Android Auto không dây, DSP chỉnh âm thanh 32-band, camera 360 tùy chọn. Thương hiệu màn hình ô tô phổ biến trên thị trường quốc tế." },
    "safeview-elite-360":    { name: "Safeview Elite 360",          brand: "Safeview",         image: "", price: "Liên hệ", desc: "Camera 360 độ Safeview Elite 360 hỗ trợ quan sát toàn cảnh quanh xe, hình ảnh Full HD sắc nét, chống chói ngược sáng, tương thích với đa số màn hình Android ô tô hiện có trên xe. Giúp hạn chế điểm mù khi đỗ/lùi xe trong không gian hẹp." },

    "utour-x5":              { name: "UTOUR X5",                    brand: "UTOUR",            image: "", price: "Liên hệ", desc: "Camera hành trình UTOUR X5, ghi hình Full HD/2K góc rộng, tích hợp GPS, cảm biến va chạm G-Sensor, ghi hình vòng lặp và chế độ giám sát đỗ xe. UTOUR là thương hiệu camera hành trình được phân phối phổ biến tại Việt Nam." },
    /* ---------- VIETMAP - Camera Hành Trình ---------- */
    "vietmap-sc620": { name: "VIETMAP SC620", brand: "VIETMAP", price: "8.990.000₫", desc: "Hệ thống gương chiếu hậu điện tử 2 bên với màn hình cảm ứng 5 inch và 2 camera Full HD 1080P, giúp quan sát toàn cảnh điểm mù xe. Tích hợp cảnh báo điểm mù (BSD) nhận diện xe/người đi bộ, chống chói WDR và quay đêm rõ nét, chuẩn chống nước bụi IP68.", specs: [["Cảm biến","MIS2031 (bản 25FPS) / Sony IMX462 (bản 50FPS)"],["Độ phân giải","1920×1080 Full HD"],["Tốc độ khung hình","25FPS hoặc 50FPS"],["Chống chói WDR","100dB (25FPS) / 120dB (50FPS)"],["Chuẩn chống nước/bụi","IP68"],["Thẻ nhớ tối đa","256GB"],["Bảo hành","18 tháng phần cứng, đổi mới trong 30 ngày"]] },
    "vietmap-v740": { name: "VIETMAP V740", brand: "VIETMAP", price: "7.690.000₫", desc: "Màn hình gương Android đa năng tích hợp camera hành trình, dẫn đường và giám sát từ xa, trang bị chip UIS 7861 8 nhân, RAM 4GB, bộ nhớ 64GB và màn hình cảm ứng IPS 11.26 inch. Hỗ trợ định vị VIETMAP LIVE cảnh báo tốc độ/bắn tốc độ, trợ lý giọng nói AI MIMI và cảnh báo an toàn ADAS.", specs: [["Camera trước","Full HD 1080P, góc rộng 150°"],["Camera sau","Full HD 1080P + HDR, góc rộng 140°"],["Màn hình","IPS cảm ứng 11.26 inch"],["Chip xử lý","UIS 7861, 8 nhân, 1.6GHz"],["Bộ nhớ","RAM 4GB + ROM 64GB"],["Hệ điều hành","Android 12"],["Kết nối","4G, WiFi, Bluetooth 5.1"],["Tính năng ADAS","Cảnh báo va chạm, cảnh báo lệch làn"],["Bảo hành","12 tháng phần cứng, đổi mới trong 30 ngày"]] },
    "vietmap-l110": { name: "VIETMAP L110", brand: "VIETMAP", price: "3.590.000₫", desc: "Camera hành trình 4G ghi hình 2K siêu nét kèm cảnh báo biển báo giao thông bằng giọng nói. Kết nối 4G cho phép quản lý xe từ xa qua livestream, định vị GPS và thông báo va chạm tức thời, bảo vệ xe 24/7.", specs: [["Độ phân giải ghi hình","2K (2560×1440P)"],["Ống kính","Góc rộng 140°"],["Màn hình","IPS 0.96 inch"],["Kết nối WiFi","WiFi 6 (2.4GHz)"],["G-Sensor / GPS","Có"],["Thẻ nhớ hỗ trợ","microSD tối đa 128GB"],["Chế độ đỗ xe","Giám sát 24/7, phát hiện va chạm thông minh"],["Bảo hành","12 tháng phần cứng, đổi 1-1 trong 30 ngày"]] },
    "vietmap-s720": { name: "VIETMAP S720", brand: "VIETMAP", price: "3.890.000₫", desc: "Camera hành trình 2 kênh ghi hình 4K siêu nét, tích hợp cảnh báo giao thông bằng giọng nói và điều khiển bằng giọng nói tiếng Việt. Hỗ trợ chế độ đỗ xe time-lapse và kết nối nhanh qua ứng dụng VIETMAP REC.", specs: [["Độ phân giải trước","4K (3840×2160P) hoặc 2K 60FPS"],["Góc nhìn ống kính","150°"],["Màn hình","IPS 2.4 inch"],["Kết nối WiFi","WiFi 6, 2.4GHz"],["GPS / G-Sensor","Có"],["Thẻ nhớ tối đa","256GB"],["Camera sau","Full HD 1080p (tùy chọn mua thêm)"],["Bảo hành","12 tháng phần cứng, đổi mới trong 30 ngày"]] },
    "vietmap-r440": { name: "VIETMAP R440", brand: "VIETMAP", price: "3.990.000₫", desc: "Camera hành trình kiêm gương chiếu hậu điện tử với màn hình cảm ứng IPS 9.66 inch, ghi hình 4K phía trước và Full HD phía sau. Tích hợp cảnh báo giao thông bằng giọng nói và tự động hiển thị camera lùi khi vào số de.", specs: [["Độ phân giải camera trước","4K"],["Độ phân giải camera sau","Full HD"],["Màn hình","IPS cảm ứng 9.66 inch"],["Góc nhìn trước/sau","150° mỗi camera"],["Thẻ nhớ hỗ trợ","microSD tối đa 128GB"],["WiFi / GPS / G-Sensor","Có"],["Camera sau chống nước","Có"],["Bảo hành","12 tháng phần cứng, đổi mới trong 30 ngày"]] },
    "vietmap-s860": { name: "VIETMAP S860", brand: "VIETMAP", price: "4.590.000₫", desc: "Camera hành trình 2 kênh với camera trước độ phân giải 3K 1944p dùng cảm biến Sony Starvis 2 IMX675 và camera sau Full HD 1080p. Có cảnh báo biển báo giao thông và kết nối WiFi để tải video nhanh qua ứng dụng VIETMAP REC.", specs: [["Độ phân giải trước","3K 2592×1944p 30fps"],["Độ phân giải sau","Full HD 1920×1080p 30fps"],["Cảm biến hình ảnh","Sony Starvis 2 IMX675"],["Góc nhìn trước/sau","150°"],["GPS / G-Sensor","Có"],["Thẻ nhớ hỗ trợ","microSD tối đa 256GB"],["WiFi","Băng tần 5GHz"],["Điều khiển giọng nói","Có"],["Bảo hành","12 tháng"]] },
    "vietmap-speedmap-m2": { name: "VIETMAP SPEEDMAP M2", brand: "VIETMAP", price: "8.980.000₫", desc: "Camera hành trình cao cấp dùng cảm biến Sony Starvis 2 IMX675, kết nối 4G và lưu trữ đám mây. Camera trước 2K, camera sau Full HD, tích hợp đầy đủ cảnh báo giao thông và định vị GPS.", specs: [["Cảm biến hình ảnh","Sony Starvis 2 IMX675"],["Độ phân giải","Trước: 2K / Sau: Full HD"],["Chuẩn nén video","H.265"],["Góc nhìn trước/sau","150°"],["Màn hình","IPS 4 inch (400×960p)"],["WiFi","2.4GHz / 5GHz"],["GPS / G-Sensor","Có"],["Thẻ nhớ hỗ trợ","microSD tối đa 256GB, chuẩn U3"],["Kết nối 4G","Có"],["Lưu trữ đám mây","Có"]] },
    "vietmap-ts-c1l": { name: "VIETMAP TS-C1L", brand: "VIETMAP", price: "Liên hệ", desc: "Camera hành trình nhỏ gọn ghi hình góc rộng 140° độ phân giải 1.5K 1296p, kết nối WiFi để chuyển video nhanh sang điện thoại qua ứng dụng VIETMAP REC. Thiết kế tối giản không màn hình, phù hợp lắp đặt kín đáo.", specs: [["Ống kính","Góc rộng 140°"],["Độ phân giải video","1.5K 1296p (2304×1296)"],["G-Sensor","Có"],["Màn hình","Không có"],["Thẻ nhớ hỗ trợ","microSD tối đa 128GB"],["Phụ kiện kèm theo","Giá đỡ 3M, sạc xe hơi, thẻ nhớ 64GB, sách hướng dẫn"],["Chế độ đỗ xe","Hỗ trợ (cần cấp nguồn trực tiếp)"]] },
    "vietmap-ts-5k": { name: "VIETMAP TS-5K", brand: "VIETMAP", price: "4.990.000₫", desc: "Camera hành trình 2 kênh cao cấp thiết kế nhỏ gọn dạng thỏi son, ghi hình 4K Ultra HD phía trước, độ nét gấp 4 lần Full HD giúp nhìn rõ biển số và biển báo. Hỗ trợ cảnh báo ADAS và điều khiển bằng giọng nói tiếng Việt.", specs: [["Độ phân giải trước/sau","4K Ultra HD / Full HD 1080p"],["Cảm biến hình ảnh","Sony Starvis IMX415"],["Góc nhìn ống kính","150° (cả trước và sau)"],["GPS / G-Sensor","Có"],["Thẻ nhớ tối đa","256GB"],["WiFi","Băng tần 5GHz"],["Tính năng ADAS","Cảnh báo lệch làn, cảnh báo va chạm phía trước"],["Chế độ đỗ xe","Time-Lapse (cần dây nguồn ACC riêng)"]] },
    "vietmap-ts-3k": { name: "VIETMAP TS-3K", brand: "VIETMAP", price: "Liên hệ", desc: "Camera hành trình nâng cấp độ phân giải từ 2K 1440p lên 3K 1944p ở camera trước, kết hợp camera sau Full HD 1080p. Tích hợp cảnh báo biển báo giao thông bằng giọng nói và kết nối WiFi 5GHz.", specs: [["Độ phân giải trước","3K 2592×1944p 30fps"],["Độ phân giải sau","Full HD 1920×1080p 30fps"],["Cảm biến hình ảnh","Sony Starvis 2 IMX675, ống kính 7 lớp"],["Góc nhìn","150° (cả 2 camera)"],["Thẻ nhớ hỗ trợ","microSD tối đa 256GB"],["Kết nối","WiFi 5GHz, GPS, G-Sensor"],["Bảo hành","12 tháng"]] },
    "vietmap-ts-2k-lite": { name: "VIETMAP TS-2K Lite", brand: "VIETMAP", price: "2.990.000₫", desc: "Camera hành trình 2 kênh ghi hình đồng thời trước sau với độ phân giải Super HD 2K phía trước và Full HD 1080p phía sau, ống kính góc rộng 150°. Tặng kèm bản quyền VIETMAP LIVE PRO 12 tháng khi mua sản phẩm.", specs: [["Màn hình","LCD 0.96 inch"],["Ống kính","Góc rộng 150°"],["G-Sensor","Có"],["Độ phân giải trước","2560×1440 (2K)"],["Độ phân giải sau","1920×1080 (Full HD)"],["Thẻ nhớ hỗ trợ","microSD tối đa 256GB"],["WiFi","2.4GHz và 5.0GHz"]] },
    "vietmap-ts-c1": { name: "VIETMAP TS-C1", brand: "VIETMAP", price: "Liên hệ", desc: "Camera hành trình Full HD ghi hình góc rộng 150°, kết nối WiFi để chuyển video nhanh sang điện thoại Android/iOS qua ứng dụng VIETMAP REC. Thiết kế nhỏ gọn dùng pin siêu tụ điện giúp tăng tuổi thọ hoạt động.", specs: [["Màn hình","LCD 0.96 inch"],["Góc nhìn ống kính","150° góc rộng"],["Độ phân giải video","Full HD 1080p (1920×1080)"],["Thẻ nhớ hỗ trợ","microSD tối đa 128GB"],["G-Sensor","Có"]] },

    "70mai-a810":            { name: "70mai T800 4K",               brand: "70mai",            image: "https://70maivietnam.store/wp-content/uploads/2026/02/combo-anh-dai-dien-T800-2-580x580.jpg", price: "7.900.000₫", desc: "Camera hành trình 70mai T800 ghi hình 3 kênh HDR (trước - trong - sau), cảm biến Sony STARVIS 2 kép, độ phân giải 4K 60FPS, tích hợp 4G LTE giám sát xe từ xa, GPS & ADAS, ghi hình khẩn cấp có bộ đệm, siêu tụ điện bền bỉ -40°C đến 85°C, điều khiển giọng nói. Phân phối chính hãng bởi 70mai Việt Nam." },
    "finevu-gx4":            { name: "FINEVU GX4",                  brand: "FINEVU",           image: "", price: "Liên hệ", desc: "Camera hành trình FINEVU GX4 (Hàn Quốc), ghi hình 2 kênh trước-sau độ phân giải cao, chế độ giám sát đỗ xe thông minh, cảnh báo an toàn ADAS, giao diện điều khiển qua ứng dụng di động. Thương hiệu camera hành trình cao cấp đến từ Hàn Quốc." },
    "blackvue-dr770x":       { name: "BlackVue DR770X",             brand: "BlackVue",         image: "", price: "Liên hệ", desc: "Camera hành trình BlackVue DR770X (Hàn Quốc), ghi hình Full HD/2K Cloud, kết nối Wifi & ứng dụng BlackVue giám sát từ xa, chế độ Parking Mode giám sát khi đỗ xe, thiết kế nhỏ gọn kín đáo. Một trong những thương hiệu camera hành trình cao cấp được ưa chuộng toàn cầu." },

    "german-maestro-m-line": { name: "German-Maestro M-Line",       brand: "German-Maestro",   image: "", price: "Liên hệ", desc: "Loa ô tô German-Maestro dòng M-Line, thương hiệu loa cao cấp sản xuất tại Đức, nổi tiếng với chất âm mộc, trung thực, được giới chơi âm thanh xe hơi chuyên nghiệp đánh giá cao. Phù hợp cho hệ thống âm thanh độ cao cấp." },
    "helix-dsp-pro":         { name: "HELIX DSP PRO MK2",           brand: "Audiotec Fischer", image: "https://www.audiotec-fischer.de/media/image/a4/ca/82/HELIX-DSP-PRO-MK2_pers_Outputs_1280x849px_16-04-20_600x600.jpg", price: "Liên hệ", desc: "Bộ xử lý âm thanh (DSP) HELIX DSP PRO MK2 - sản xuất tại Đức bởi Audiotec Fischer, xử lý tín hiệu 10 kênh, độ phân giải 96kHz/32-bit, DSP 64-bit 1.2 tỷ phép tính/giây, ngõ vào High-level/RCA/Optical/Coaxial. Giải pháp chỉnh âm chuyên sâu cho dàn âm thanh ô tô cao cấp." },

    /* ---------- JBL - Loa Ô Tô ---------- */
    "jbl-club-64": { name: "JBL Club 64", brand: "JBL", price: "3.250.000₫", desc: "Loa đồng trục ô tô JBL Club 64 6.5 inch, màng loa polypropylene kết hợp viền cao su butyl bền bỉ, tái tạo âm thanh mạnh mẽ đặc trưng JBL với dải tần rộng và độ nhạy cao. Phù hợp lắp thay thế loa zin trên hầu hết các dòng xe phổ thông. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["SKU","JBLSPKCB64"],["Loại loa","Đồng trục 2 đường tiếng"],["Kích thước","6.5 inch (165mm)"],["Công suất","95W RMS / 285W Peak"],["Trở kháng","3.0 Ohm"],["Dải tần số","48Hz - 21kHz"],["Độ nhạy","93dB"],["Màng loa","Polypropylene"],["Viền loa","Cao su Butyl"],["Xuất xứ","Chính hãng JBL"],["Bảo hành","Điện tử theo chính sách PGI"]] },
    "jbl-club-64c": { name: "JBL Club 64C", brand: "JBL", price: "5.450.000₫", desc: "Loa phân tần ô tô JBL Club 64C 6.5 inch, hệ thống 2 đường tiếng với loa mid-bass và tweeter tách rời cho khả năng tái tạo âm thanh chi tiết, tách bạch. Màng loa polypropylene và viền cao su butyl đảm bảo độ bền cao, tweeter có thể lắp linh hoạt tại táp-lô, trụ A hoặc cửa xe. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["SKU","JBLSPKCB64C"],["Loại loa","Phân tần 2 đường tiếng (component)"],["Kích thước loa mid-bass","6.5 inch (160mm)"],["Công suất","70W RMS / 210W Peak"],["Trở kháng","3 Ohm"],["Dải tần số","55Hz - 20kHz"],["Độ nhạy","92dB"],["Màng loa","Polypropylene"],["Viền loa","Cao su Butyl"],["Xuất xứ","Chính hãng JBL"],["Bảo hành","Đổi mới trong 7 ngày nếu lỗi nhà sản xuất"]] },
    "jbl-club-64csq": { name: "JBL Club 64CSQ", brand: "JBL", price: "7.450.000₫", desc: "Loa phân tần ô tô JBL Club 64CSQ 6.5 inch, công nghệ màng loa Plus One giúp tăng diện tích màng loa cho âm bass sâu và treble trong trẻo hơn. Bộ loa gồm mid-bass và tweeter tách rời dạng 'starfish' linh hoạt trong lắp đặt. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["SKU","JBLSPKCB64CSQ"],["Loại loa","Phân tần 2 đường tiếng (component) SQ"],["Kích thước loa mid-bass","6.5 inch (160mm)"],["Công suất","95W RMS / 285W Peak"],["Trở kháng","3.0 Ohm"],["Dải tần số","48Hz - 21kHz"],["Độ nhạy","93dB @ 2.83V"],["Công nghệ màng loa","Plus One Cone"],["Xuất xứ","Chính hãng JBL"],["Bảo hành","Điện tử theo chính sách PGI"]] },
    "jbl-club-605csq": { name: "JBL Club 605CSQ", brand: "JBL", price: "6.290.000₫", desc: "Loa phân tần ô tô JBL Club 605CSQ, bộ loa 2 đường tiếng cao cấp thuộc dòng Club gồm loa mid-bass, tweeter và phân tần rời cho âm thanh tách bạch, chi tiết. Dễ dàng tùy biến vị trí lắp đặt tweeter để tối ưu sân khấu âm thanh. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["SKU","JBLSPKCB605CSQ"],["Loại loa","Phân tần 2 đường tiếng (component) SQ"],["Đơn vị tính","Cặp (2 loa)"],["Xuất xứ","Chính hãng JBL"],["Bảo hành","Đổi mới trong 7 ngày nếu lỗi nhà sản xuất"]] },
    "jbl-club-64sq": { name: "JBL Club 64SQ", brand: "JBL", price: "5.980.000₫", desc: "Loa đồng trục ô tô JBL Club 64SQ 6.5 inch, mang lại âm thanh cân bằng, chi tiết với bass mạnh mẽ, mid rõ ràng và treble tươi sáng. Vừa vặn với hầu hết các mẫu xe phổ thông theo chuẩn lắp loa cửa 6.5 inch. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["SKU","JBLSPKCB64SQ"],["Loại loa","Đồng trục 2 đường tiếng SQ"],["Kích thước","6.5 inch (160mm)"],["Công suất","75W RMS / 225W Peak"],["Trở kháng","3 Ohm"],["Dải tần số","48Hz - 21kHz"],["Độ nhạy","93dB"],["Xuất xứ","Chính hãng JBL"],["Bảo hành","Đổi mới trong 7 ngày nếu lỗi nhà sản xuất"]] },
    "jbl-stage1-62cf": { name: "JBL Stage1 62CF", brand: "JBL", price: "2.660.000₫", desc: "Loa ô tô JBL Stage1 62CF, dòng loa đồng trục nhập môn của JBL dành cho các vị trí lắp loa dạng oval, mang lại chất âm cải thiện rõ rệt so với loa zin theo xe. Thiết kế nhỏ gọn, dễ lắp đặt. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["SKU","JBLSPKS162CF"],["Dòng sản phẩm","JBL Stage1"],["Xuất xứ","Chính hãng JBL"],["Bảo hành","Đổi mới trong 7 ngày nếu lỗi nhà sản xuất"]] },
    "jbl-stadium-62cf": { name: "JBL Stadium 62CF", brand: "JBL", price: "12.820.000₫", desc: "Loa ô tô JBL Stadium 62CF, thuộc dòng cao cấp Stadium của JBL với thiết kế phân tần ngoài (crossover rời) cho chất âm chi tiết, sân khấu âm thanh rộng và sâu. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["SKU","JBLSPKSD62CF"],["Dòng sản phẩm","JBL Stadium (cao cấp)"],["Xuất xứ","Chính hãng JBL"],["Bảo hành","Đổi mới trong 7 ngày nếu lỗi nhà sản xuất"]] },
    "jbl-basspro-hub": { name: "JBL BASSPRO HUB", brand: "JBL", price: "13.980.000₫", desc: "Loa siêu trầm JBL BASSPRO HUB tích hợp sẵn amply Class D công suất lớn, thiết kế đặc biệt để lắp gọn trong hốc lốp dự phòng, không chiếm diện tích khoang hành lý. Đi kèm núm chỉnh âm lượng từ xa tiện lợi. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["SKU","JBLBASSPROHUB"],["Loại sản phẩm","Subwoofer tích hợp amply, lắp hốc lốp dự phòng"],["Công suất","200W RMS / 400W Peak"],["Loại amply","Class D tích hợp sẵn"],["Dải tần số","30Hz - 150Hz"],["Độ nhạy","91dB"],["Điều khiển","Núm chỉnh âm lượng từ xa"],["Xuất xứ","Chính hãng JBL"]] },
    "jbl-basspro-sl2": { name: "JBL BASSPRO SL2", brand: "JBL", price: "Liên hệ", desc: "Loa siêu trầm JBL BASSPRO SL2 dạng mỏng, tích hợp sẵn amply công suất, thiết kế nhỏ gọn phù hợp lắp dưới ghế hoặc cốp xe cho những không gian hạn chế. Mang lại bass sâu, chắc, bổ trợ hoàn hảo cho hệ thống loa cửa sẵn có. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["SKU","JBLBASSPROSL2"],["Loại sản phẩm","Subwoofer mỏng tích hợp amply"],["Xuất xứ","Chính hãng JBL"]] },
    "jbl-stage3-x637f": { name: "JBL Stage3 X637F", brand: "JBL", price: "3.800.000₫", desc: "Loa 3 đường tiếng JBL Stage3 X637F 6.5 inch, tích hợp woofer, mid và tweeter riêng biệt trên cùng một loa cho âm thanh chi tiết, bass mạnh mẽ, mid rõ ràng và treble tươi sáng không chói gắt. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["SKU","STAGE3637F"],["Loại loa","Đồng trục 3 đường tiếng"],["Kích thước","6.5 inch"],["Công suất","45W RMS / 225W Peak"],["Trở kháng","3 Ohm"],["Dải tần số","55Hz - 20kHz"],["Độ nhạy","92dB"],["Xuất xứ","Chính hãng JBL"]] },
    "jbl-stage2-634": { name: "JBL Stage2 634", brand: "JBL", price: "2.300.000₫", desc: "Loa đồng trục ô tô JBL Stage2 634, màng loa polypropylene tối ưu độ cứng và độ nhạy giúp tăng công suất ở dải tần thấp, kết hợp tweeter dome PEI cân bằng cho âm treble trong trẻo. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["SKU","STAGE2634"],["Loại loa","Đồng trục"],["Đơn vị tính","Cặp"],["Màng loa","Polypropylene"],["Tweeter","Dome PEI cân bằng"],["Xuất xứ","Chính hãng JBL"]] },
    "jbl-stage3-607cf": { name: "JBL Stage3 607CF", brand: "JBL", price: "4.200.000₫", desc: "Loa phân tần ô tô JBL Stage3 607CF, công nghệ màng loa Plus One tăng diện tích màng loa tới 35% cho hiệu suất bass và âm lượng vượt trội. Tweeter dome viền giảm chấn cho âm cao mượt mà, phân tần rời có núm chỉnh mức tweeter 0/+2dB. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["SKU","STAGE3607CF"],["Loại loa","Phân tần 2 đường tiếng (component)"],["Công nghệ màng loa","Plus One Cone (+35% diện tích màng)"],["Tweeter","Dome viền giảm chấn (edge-controlled)"],["Phân tần","Rời, chỉnh mức tweeter 0/+2dB"],["Xuất xứ","Chính hãng JBL"]] },

    /* ---------- JBL - Loa Sub ---------- */
    "jbl-club-marine-10-sub": { name: "JBL Club Marine 10 Subwoofer", brand: "JBL", price: "6.900.000₫", desc: "Loa siêu trầm JBL Club Marine 10 Subwoofer 10 inch, thiết kế chuyên dụng cho môi trường Marine (thuyền, xe mui trần) với khả năng chống chịu thời tiết khắc nghiệt. Đa dạng màu lưới bảo vệ phù hợp phong cách xe. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Mã SKU","JBLMARSUBCB102AM"],["Loại","Loa siêu trầm 10 inch (250mm), chống chịu môi trường Marine"],["Màu lưới loa","Xám, Xanh lá, Đỏ, Xanh dương, Trắng"]] },
    "jbl-stage-1200d": { name: "JBL Stage 1200D", brand: "JBL", price: "6.800.000₫", desc: "Loa siêu trầm JBL Stage 1200D thiết kế thùng đôi 2x12 inch, công suất RMS 500W (đỉnh 1000W), mang lại dải bass sâu và mạnh mẽ cho khoang cốp xe. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Loại loa","Loa siêu trầm thùng đôi"],["Kích thước loa","2 x 12 inch (300mm)"],["Công suất RMS","500W"],["Công suất cực đại","1000W"],["Trở kháng","2 Ohm"],["Đáp ứng tần số","34Hz – 200Hz"],["Vật liệu thùng loa","MDF 5/8\" phủ thảm"]] },
    "jbl-club-1000ssl": { name: "JBL CLUB 1000SSL", brand: "JBL", price: "11.920.000₫", desc: "Loa siêu trầm JBL CLUB 1000SSL thiết kế thùng kín hướng xuống, siêu mỏng tối ưu lắp gầm ghế ô tô mà vẫn đảm bảo công suất RMS 250W (đỉnh 1000W). Công nghệ tản nhiệt thụ động giảm méo tiếng ở âm lượng lớn. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Kiểu loa","Subwoofer gầm ghế, thùng kín hướng xuống"],["Công suất cực đại","1000W"],["Công suất RMS","250W"],["Đáp ứng tần số","35Hz – 175Hz"],["Trở kháng","2Ω hoặc 4Ω (tùy chọn)"],["Tính năng nổi bật","Tản nhiệt thụ động, chân loa tháo rời"]] },
    "jbl-club-122sl": { name: "JBL CLUB 122SL", brand: "JBL", price: "6.360.000₫", desc: "Loa siêu trầm JBL CLUB 122SL 12 inch nón nhôm, công suất 400W RMS (đỉnh 1200W), thiết kế shallow-mount lắp đặt linh hoạt trong không gian hẹp. Trở kháng chuyển đổi 2/4 Ohm qua công tắc. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Loại","Loa siêu trầm nón nhôm 12\" (300mm)"],["Công suất","400W RMS, 1200W đỉnh"],["Độ nhạy (1W/1m)","84dB"],["Đáp ứng tần số (-6dB)","30Hz – 500Hz"],["Trở kháng danh nghĩa","2 hoặc 4 Ohm (công tắc chọn)"],["Độ sâu lắp đặt","3-1/4\" (82,5mm)"]] },
    "jbl-club-102sl": { name: "JBL CLUB 102SL", brand: "JBL", price: "5.980.000₫", desc: "Loa siêu trầm JBL CLUB 102SL 10 inch nón nhôm, công suất 350W RMS (đỉnh 1050W), thiết kế shallow-mount mỏng gọn dễ lắp dưới ghế hoặc cốp xe. Trở kháng chuyển đổi 2/4 Ohm linh hoạt. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Loại","Loa siêu trầm nón nhôm 10\" (250mm)"],["Công suất","350W RMS, 1050W đỉnh"],["Độ nhạy (1W/1m)","81dB"],["Đáp ứng tần số (-6dB)","35Hz – 500Hz"],["Trở kháng danh nghĩa","2 hoặc 4 Ohm (công tắc chọn)"],["Độ sâu lắp đặt","3-1/4\" (82,5mm)"]] },
    "jbl-basspro-lite": { name: "JBL Bass pro LITE", brand: "JBL", price: "7.890.000₫", desc: "Loa siêu trầm gầm ghế JBL BassPro LITE tích hợp sẵn amply Class D công suất 100W RMS, cho âm bass chặt chẽ trong thiết kế nhỏ gọn nhất phân khúc. Hỗ trợ kết nối nối tiếp (daisy-chain) để ghép thêm loa thứ hai. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Loại","Loa siêu trầm gầm ghế tích hợp amply (all-in-one)"],["Công suất khuếch đại","100W RMS tích hợp"],["Vỏ loa","Nhôm đúc nguyên khối"],["Kết nối mở rộng","Daisy-chain nối tiếp, ghép thêm loa thứ 2"]] },
    "jbl-sub-st82": { name: "JBL SUB ST82", brand: "JBL", price: "2.300.000₫", desc: "Loa siêu trầm JBL SUB ST82 (dòng Stadium) 8 inch, trang bị công nghệ SSI cho phép chuyển đổi trở kháng 2/4 Ohm linh hoạt theo hệ thống. Cuộn dây thoại 2 inch làm mát bằng khí động học. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Dòng sản phẩm","JBL Stadium Series"],["Kích thước loa","8 inch (200mm)"],["Trở kháng","SSI - chuyển đổi 2 hoặc 4 Ohm qua công tắc"],["Đường kính cuộn dây thoại","2 inch (50mm)"],["Công nghệ làm mát","Cuộn dây thoại làm mát bằng khí động học"]] },
    "jbl-basspro-go": { name: "JBL Basspro Go", brand: "JBL", price: "19.780.000₫", desc: "Loa siêu trầm JBL BassPro Go độc đáo 2-trong-1, vừa lắp cố định trong xe tăng cường âm trầm, vừa có thể tháo rời trở thành loa Bluetooth di động toàn dải, đạt chuẩn chống nước IPx5. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Loại","Loa siêu trầm 2 trong 1 (lắp xe + loa Bluetooth di động)"],["Kết nối không dây","Bluetooth, phạm vi 38m ngoài trời / 10m trong nhà"],["Pin","NiMH sạc lại, tối đa 8 giờ phát nhạc"],["Chuẩn chống nước","IPx5"]] },
    "jbl-basspro-nano": { name: "JBL Basspro Nano", brand: "JBL", price: "Liên hệ", desc: "Loa siêu trầm gầm ghế JBL BassPro Nano công suất 100W RMS, tần số hoạt động 50-120Hz với núm tăng âm trầm 0 đến +12dB tại 50Hz. Thiết kế siêu nhỏ gọn, dễ dàng lắp đặt dưới ghế. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Công suất","100W RMS"],["Cầu chì","15A"],["Tần số","50 - 120Hz"],["Tăng âm trầm","0dB đến +12dB @ 50Hz"],["Kích thước","260mm x 195mm x 74.6mm"]] },

    /* ---------- JBL - Âm Ly ---------- */
    "jbl-dsp-k86": { name: "JBL DSP K86", brand: "JBL", price: "17.800.000₫", desc: "Amply xử lý âm thanh JBL DSP K86 tích hợp bộ khuếch đại và DSP, đi kèm 1 cặp microphone MIC-300 hỗ trợ tinh chỉnh, tối ưu âm thanh theo không gian nội thất xe. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Mã SKU","DSPK86"],["Loại","Amply tích hợp DSP, lắp dưới ghế/cốp xe"],["Phụ kiện đi kèm","1 cặp microphone MIC-300 hỗ trợ tinh chỉnh"]] },
    "jbl-dsp-3544": { name: "JBL DSP 3544", brand: "JBL", price: "7.980.000₫", desc: "Ampli JBL DSP 3544 tích hợp bộ xử lý âm thanh DSP giúp tinh chỉnh và tối ưu hệ thống loa trên xe hơi. Thiết kế nhỏ gọn, dễ lắp đặt, tương thích nhiều cấu hình loa zin và loa độ. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Mã SKU","DSP3544"],["Loại","Ampli tích hợp DSP (bộ xử lý âm thanh)"]] },
    "jbl-ms8": { name: "JBL MS8", brand: "JBL", price: "Liên hệ", desc: "Bộ xử lý âm thanh JBL MS8 tích hợp 8 kênh khuếch đại (20W x 8 @4Ω), cùng bộ xử lý DSP với EQ 31 băng tần, phân tần số và hiệu chỉnh thời gian tối ưu theo vị trí ngồi trong xe. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Công suất đầu ra","20W x 8 kênh @4Ω / 30W x 8 kênh @2Ω"],["Kênh vào/ra","8 kênh vào / 8 kênh ra"],["EQ & DSP","EQ 31 băng tần, phân tần DSP, hiệu chỉnh thời gian"],["Đáp ứng tần số","20Hz – 20kHz"],["Tỷ lệ S/N","90dB (Line in>Line out) / 85dB (Line in>Speaker out)"],["Màn hình hiển thị","LCD 128 x 64 pixel"]] },
    "jbl-club-a754": { name: "JBL CLUB A754", brand: "JBL", price: "8.850.000₫", desc: "Ampli JBL CLUB A754 thuộc dòng Club Series cao cấp, thiết kế nhỏ gọn dễ lắp đặt trên nhiều dòng xe. Phù hợp nâng cấp hệ thống loa nhiều kênh với chất âm sống động đặc trưng JBL. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Mã SKU","AMPCBA754"],["Dòng sản phẩm","JBL Club Series"]] },
    "jbl-gto1201-1-ii": { name: "JBL GTO1201.1 II", brand: "JBL", price: "4.690.000₫", desc: "Ampli JBL GTO1201.1 II mono Class D chuyên dùng cho loa siêu trầm, công suất RMS lên đến 1114W tại 2Ω (787W tại 4Ω), đáp ứng tần số 10-302Hz phù hợp tái tạo dải bass sâu. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Kiểu amply","Class D, đơn kênh (1 channel)"],["Công suất RMS (4Ω)","787 Watts"],["Công suất RMS (2Ω)","1114 Watts"],["Công suất đỉnh (2Ω)","1339 Watts"],["Đáp ứng tần số","10Hz – 302Hz (-3dB)"],["Tỷ lệ méo hài tổng (THD)","≤ 1%"],["Cầu chì bảo vệ","3 x 40 Amps"]] },
    "jbl-dsp-4086": { name: "JBL DSP 4086", brand: "JBL", price: "12.820.000₫", desc: "Ampli JBL DSP 4086 là hệ thống DSP tích hợp khép kín với 6 kênh đầu vào, 8 kênh đầu ra, cho phép tinh chỉnh sâu qua phần mềm PC Windows: crossover thay đổi hoàn toàn, EQ 31 băng tần, hiệu chỉnh thời gian. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Kênh vào/ra","6 kênh vào / 8 kênh ra"],["Kết nối điều chỉnh","USB, phần mềm PC Windows"],["Crossover","Thay đổi hoàn toàn, độ dốc 0-48dB lựa chọn"],["EQ","Đồ họa hoặc tham số 31 băng tần"],["Bộ nhớ cài đặt","Lưu tối đa 10 cài đặt trước"],["Điều khiển bass từ xa","Có dây, chỉnh -30 đến +6dB"]] },
    "jbl-stadium-4": { name: "JBL STADIUM 4", brand: "JBL", price: "12.820.000₫", desc: "Ampli JBL STADIUM 4 kênh Class D hiệu suất cao, công suất 100W RMS x4 tại 4Ω (120W x4 tại 2Ω, đỉnh 1500W), có thể cầu nối cho công suất 240W x2 khi cần. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Loại bộ khuếch đại","Class D 4 kênh, toàn dải, hiệu suất cao"],["Công suất tối đa","Đỉnh 1500W"],["Công suất đầu ra @4Ω","100Wrms x4, <0,1% THD+N"],["Công suất đầu ra @2Ω","120Wrms x4, <0,1% THD+N"],["Công suất đầu ra cầu nối 4Ω","240Wrms x2, <0,3% THD+N"],["Tỷ lệ tín hiệu trên nhiễu (S/N)",">=80dB (tham chiếu 1W @4Ω)"]] },
    "jbl-stadium-1000": { name: "JBL STADIUM 1000", brand: "JBL", price: "19.900.000₫", desc: "Ampli JBL STADIUM 1000 mono Class D chuyên dùng cho loa siêu trầm, công suất RMS 1000W tại 2Ω (700W tại 4Ω, đỉnh 2600W), đủ sức đánh những dàn sub công suất lớn. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Loại","Ampli mono Class D chuyên dụng cho loa siêu trầm"],["Công suất tối đa","Đỉnh 2600W"],["Công suất đầu ra @2Ω","1000Wrms x1, <0,1% THD+N"],["Công suất đầu ra @4Ω","700Wrms x1, <0,1% THD+N"],["LPF (bộ lọc thông thấp)","Chủ động, thay đổi 32-320Hz"]] },
    "jbl-ampcb-a600": { name: "JBL AMPCB A600", brand: "JBL", price: "6.980.000₫", desc: "Ampli mono JBL AMPCB A600 chuyên khuếch đại loa siêu trầm, công suất RMS 600W với thiết kế Class D hiệu suất cao, dòng điện tiêu thụ tối thiểu. Trang bị công tắc pha và điều khiển âm trầm từ xa có dây RBC. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Mã SKU","AMPCBA600"],["Loại","Ampli mono (1 kênh) Class D cho loa siêu trầm"],["Công suất RMS","600W"],["Điều khiển từ xa","Có dây RBC, chỉnh âm trầm"]] },
    "jbl-marine-ma4505": { name: "JBL Marine MA4505", brand: "JBL", price: "Liên hệ", desc: "Ampli JBL Marine MA4505 5 kênh chuyên dụng cho môi trường Marine (thuyền, xe mui trần), tích hợp 1 kênh sub công suất 500W RMS @2Ω và 4 kênh toàn dải 65W RMS @2Ω. Hàng chính hãng JBL - phân phối bởi PGI.", specs: [["Loại","Ampli 5 kênh (1 sub + 4 toàn dải), dòng Marine"],["Công suất tối đa","Đỉnh 1800W"],["Công suất RMS kênh sub @2Ω","500W x1, <1% THD+N"],["Công suất RMS toàn dải @2Ω","65W x4, <1% THD+N"]] },

    /* ---------- Infinity - Loa Ô Tô ---------- */
    "infinity-spkka203s": { name: "Infinity SPKKA203S", brand: "Infinity", price: "7.800.000₫", desc: "Loa lắp trên xe ô tô Infinity SPKKA203S, hàng chính hãng Harman - phân phối bởi PGI. Thiết kế nâng cấp dàn âm thanh nguyên bản, dễ lắp đặt, phù hợp nhiều dòng xe.", specs: [["SKU","INFSPKKA203S"],["Thương hiệu","Infinity (Harman)"],["Tình trạng","Còn hàng"]] },
    "infinity-kap-60-11cs": { name: "Infinity KAP-60.11CS", brand: "Infinity", price: "5.860.000₫", desc: "Bộ loa cánh (component) lắp trên xe ô tô Infinity KAP-60.11CS, hàng chính hãng Harman - phân phối bởi PGI. Phù hợp nâng cấp dàn âm thanh nguyên bản, âm thanh cân bằng, chi tiết.", specs: [["SKU","KAP-60.11CS"],["Thương hiệu","Infinity (Harman)"],["Tình trạng","Hết hàng (có thể đặt trước)"]] },
    "infinity-ref-1070": { name: "Infinity REF 1070", brand: "Infinity", price: "4.920.000₫", desc: "Loa cánh (subwoofer 10 inch) lắp trên xe ô tô Infinity REF 1070, màng loa polypropylene cho âm bass sâu và chính xác, viền loa cao su nitrile bền bỉ. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Kích thước","10 inch"],["Công suất RMS/Peak","250W RMS / 1000W Peak"],["Dải tần số","30Hz – 175Hz"],["Độ nhạy","92dB"],["Trở kháng","4 Ohm (chuyển đổi được 2-4 Ohm)"],["Chất liệu màng loa","Polypropylene"],["Chất liệu viền loa","Cao su Nitrile"]] },
    "infinity-primus-603cf": { name: "Infinity Primus 603CF", brand: "Infinity", price: "3.680.000₫", desc: "Bộ loa lắp cửa trước xe ô tô Infinity Primus 603CF (bán theo cặp), hàng chính hãng Harman - phân phối bởi PGI. Phù hợp nâng cấp dàn âm thanh nguyên bản với chi phí hợp lý.", specs: [["SKU","INFSPKPR603CF"],["Đơn vị bán","Theo cặp"],["Tình trạng","Còn hàng"]] },
    "infinity-infspkka603cf": { name: "Infinity INFSPKKA603CF", brand: "Infinity", price: "8.350.000₫", desc: "Bộ loa phân tần ô tô Infinity INFSPKKA603CF gồm tweeter màng lụa và loa mid công nghệ màng sợi thủy tinh Plus One™, âm thanh chi tiết, bass sâu. Tweeter xoay 270° (UniPivot) tối ưu hướng âm. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Độ nhạy","94dB @ 2.83V"],["Dải tần số","500Hz – 7kHz"],["Trở kháng","3.0 Ohm"],["Tweeter","Màng lụa (silk dome), tái tạo tần số cao đến 40kHz"],["Màng loa mid","Sợi thủy tinh Plus One™"],["Thiết kế tweeter","UniPivot xoay 270°"]] },
    "infinity-spkka63xf": { name: "Infinity SPKKA63XF", brand: "Infinity", price: "Liên hệ", desc: "Loa đồng trục 6.5 inch lắp trên xe ô tô Infinity SPKKA63XF, bass đánh gọn gàng, âm mid rõ ràng, phù hợp nâng cấp dàn âm thanh nguyên bản mà không cần chỉnh sửa cửa xe. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Công suất RMS/Peak","60W RMS / 180W Max"],["Dải tần số","55Hz – 20kHz"],["Độ nhạy","92dB"],["Kích thước","6.5 inch (16.5cm)"],["Chất liệu màng loa","Polypropylene"],["Tweeter","Màng vòm PEI"]] },
    "infinity-primus-693c": { name: "Infinity Primus 693C", brand: "Infinity", price: "3.800.000₫", desc: "Bộ loa lắp trên xe ô tô Infinity Primus 693C, hàng chính hãng Harman - phân phối bởi PGI. Lựa chọn phù hợp để nâng cấp dàn âm thanh nguyên bản với mức giá hợp lý.", specs: [["SKU","INFSPKPR693C"],["Tình trạng","Còn hàng"]] },
    "infinity-beta-be621": { name: "Infinity BETA BE621", brand: "Infinity", price: "Liên hệ", desc: "Loa đồng trục 2 đường tiếng 6.5 inch Infinity BETA BE621, âm thanh cân bằng, chi tiết, bass sạch, mid rõ, treble sáng so với loa zin. Lắp đặt nhanh, phù hợp đa số dòng xe. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["SKU","INFSPKBEBE621"],["Cấu hình","Đồng trục 2 đường tiếng 6.5 inch"],["Công suất RMS/Peak","55W RMS / 165W Max"],["Dải tần số","53Hz – 20kHz"],["Độ nhạy","92dB"],["Tweeter","Màng vòm PEI"]] },
    "infinity-ref-375tx": { name: "Infinity REF 375TX", brand: "Infinity", price: "2.920.000₫", desc: "Loa treble (tweeter) Infinity REF 375TX 3/4 inch, màng loa tối ưu cho âm cao mượt mà, rõ nét, có thể điều chỉnh mức âm lượng theo vị trí lắp đặt. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Kích thước","3/4 inch (19mm)"],["Công suất RMS/Peak","45W RMS / 135W Peak"],["Dải tần số","2.5kHz – 21kHz"],["Độ nhạy","93dB (2.83V/m)"],["Trở kháng","3 Ohm"]] },
    "infinity-perfect-300m": { name: "Infinity Perfect 300m", brand: "Infinity", price: "6.730.000₫", desc: "Loa mid hiệu suất lớn Infinity Perfect 300m 3.5 inch, màng loa sợi carbon công nghệ Plus One™ cho bass chắc, chi tiết cao và treble mượt. Trở kháng thấp 3.5 Ohm giúp khai thác tối đa công suất amply. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Kích thước","3.5 inch"],["Công suất RMS/Peak","75W RMS / 300W Peak"],["Dải tần số","150Hz – 10kHz"],["Trở kháng","3.5 Ohm"],["Độ nhạy","88dB (2.83V/1m)"],["Chất liệu màng loa","Sợi carbon (Plus One™)"]] },
    "infinity-kappa-20mx": { name: "Infinity Kappa 20MX", brand: "Infinity", price: "Liên hệ", desc: "Loa mid Infinity Kappa 20MX 2.5 inch, màng loa Plus One™ nhẹ và cứng cho hiệu suất bass tốt hơn, trở kháng cực thấp 2.5 Ohm khai thác tối đa công suất amply. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Kích thước","2-1/2 inch"],["Công suất RMS/Peak","65W RMS / 195W Peak"],["Dải tần số","550Hz – 7kHz"],["Độ nhạy","90dB (2.83V/m)"],["Trở kháng","2.5 Ohm"],["Chất liệu màng loa","Plus One™"]] },

    /* ---------- Infinity - Loa Sub ---------- */
    "infinity-ref-1220de": { name: "Infinity REF 1220DE", brand: "Infinity", price: "5.500.999₫", desc: "Loa sub cốp ô tô Infinity REF 1220DE thùng kép 12 inch, công suất lớn, âm trầm sâu và uy lực cho các dòng nhạc EDM, hip-hop, rock. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Kiểu loa","Subwoofer thùng kép 12 inch"],["Công suất cực đại","1800W"],["Công suất RMS","600W"],["Dải tần số","25Hz – 200Hz"],["Độ nhạy","94dB"],["Trở kháng","4 Ohm"]] },
    "infinity-primus-1270b": { name: "Infinity Primus 1270B", brand: "Infinity", price: "6.310.000₫", desc: "Loa sub cốp ô tô Infinity Primus 1270B thùng đơn 12 inch, âm trầm mạnh mẽ, sâu chắc trong thiết kế gọn gàng. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Loại loa","Subwoofer thùng (12 inch – 305mm)"],["Công suất RMS","300W"],["Công suất cực đại","1200W"],["Dải tần đáp ứng","23Hz – 450Hz"],["Độ nhạy","96dB"],["Trở kháng","4 Ohm"]] },
    "infinity-kappa-1000w": { name: "Infinity Kappa 1000W", brand: "Infinity", price: "5.450.000₫", desc: "Loa sub xe ô tô Infinity Kappa 1000W công suất 1000W, mang lại âm trầm mạnh mẽ cho hệ thống âm thanh ô tô. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [] },
    "infinity-kappa-800w": { name: "Infinity KAPPA 800W", brand: "Infinity", price: "Liên hệ", desc: "Loa sub ô tô Infinity Kappa 800W 8 inch, tích hợp công nghệ SSI chuyển đổi trở kháng 2/4 ohm linh hoạt, âm bass sâu và giàu cảm xúc. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Kích thước","8″ (250mm)"],["Công suất","400W RMS, 1600W peak"],["Tần số đáp ứng","34Hz – 200Hz"],["Độ nhạy","89dB"],["Trở kháng","2 hoặc 4 ohms"]] },
    "infinity-ref1000s": { name: "Infinity REF1000S (Reference 10)", brand: "Infinity", price: "4.600.000₫", desc: "Loa sub xe ô tô Infinity REF1000S 10 inch, thiết kế shallow-mount tiết kiệm không gian, âm bass chắc gọn phù hợp nhiều thể loại nhạc. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Kích thước loa","10 inch (25cm)"],["Công suất RMS","200W"],["Công suất Peak","800W"],["Dải tần số đáp ứng","35Hz – 175Hz"],["Trở kháng danh nghĩa","4 ohm"],["Độ sâu lắp đặt","83mm (3-5/16\")"]] },
    "infinity-subrf123w": { name: "Infinity SUBRF123W", brand: "Infinity", price: "5.280.000₫", desc: "Loa lắp trên xe ô tô Infinity SUBRF123W tích hợp ampli Class D, thiết kế nhỏ gọn dễ lắp đặt, bổ sung dải trầm sâu cho dàn âm thanh gốc. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Công suất","RMS 200W, cực đại 1000W"],["Dải tần số","35Hz – 120Hz"],["Độ nhạy","90dB"],["Ampli tích hợp","Class D"]] },
    "infinity-reference-1000ssl": { name: "Infinity REFERENCE 1000SSL", brand: "Infinity", price: "9.900.000₫", desc: "Loa sub xe ô tô Infinity Reference 1000SSL siêu mỏng 6.4cm, tích hợp ampli Class D 350W RMS, lắp gọn dưới ghế mà vẫn cho âm bass mạnh mẽ, sâu lắng. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Công suất (RMS)","350W"],["Công suất tối đa","1050W"],["Cấu hình loa","1x sub 10”"],["Đáp ứng tần số","35Hz - 20kHz"],["Độ nhạy","82 dB"],["Trở kháng","4 ohms"]] },
    "infinity-basslink-dc-blk": { name: "Infinity Basslink DC BLK", brand: "Infinity", price: "Liên hệ", desc: "Loa sub cốp ô tô Infinity Basslink DC BLK 10 inch tích hợp ampli Class D, thiết kế nhỏ gọn lắp sau cốp xe, hỗ trợ điều khiển bass từ xa. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Kích thước củ loa trầm","10''"],["Công suất ra loa","200W RMS"],["Tần số đáp ứng","20Hz - 120Hz"],["Cầu chì","25A"],["Tần số chéo","50Hz - 120Hz"],["Tăng cường âm trầm","0dB đến + 9dB @ 55Hz"]] },
    "infinity-basslink-sm2": { name: "Infinity Basslink SM2", brand: "Infinity", price: "8.200.000₫", desc: "Loa sub gầm ghế xe ô tô Infinity Basslink SM2 8 inch, thiết kế mỏng nằm gọn dưới ghế, tăng cường tần số thấp mạnh mẽ cho dàn âm thanh xe hơi. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Kích thước củ loa trầm","8''"],["Công suất ra loa","125W RMS"],["Tần số đáp ứng","35Hz - 120Hz"],["Cầu chì","12A"],["Tăng cường âm trầm","0dB đến + 9dB @ 70Hz"]] },
    "infinity-basslink-mini": { name: "Infinity BASSLINK MINI", brand: "Infinity", price: "7.690.000₫", desc: "Loa sub gầm ghế xe ô tô Infinity Basslink Mini, mẫu loa siêu trầm nhỏ gọn nhất của Infinity, tích hợp ampli 100W RMS, chiếm ít không gian mà vẫn cho âm bass sâu. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Công suất","100W rms"],["Cầu chì","15 A"],["Tần số","30 - 150 Hz"],["Tăng âm trầm","0dB to +12dB @ 50Hz"],["Vị trí lắp đặt","Gầm ghế"]] },

    /* ---------- Infinity - Âm Ly ---------- */
    "infinity-primus60041a": { name: "Infinity PRIMUS60041A", brand: "Infinity", price: "5.800.000₫", desc: "Amply lắp ô tô Infinity Primus60041A, bộ khuếch đại nâng cấp hệ thống âm thanh xe hơi, mang đến âm thanh mạnh mẽ và ổn định. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [] },
    "infinity-kappa-four": { name: "Infinity Kappa FOUR", brand: "Infinity", price: "16.550.000₫", desc: "Ampli ô tô Infinity Kappa FOUR 4 kênh Class D hiệu suất cao, công suất RMS 100-120W/kênh, âm thanh mạnh mẽ, trung thực và ổn định. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Điện áp hoạt động","9 – 16 V"],["Công suất RMS @ 4 ohm","100W x 4"],["Công suất RMS @ 2 ohm","120W x 4"],["Tổng công suất cực đại","1500W"],["Đáp tuyến tần số","15Hz – 35kHz@-3dB"],["Cầu chì","2 x 30A"]] },
    "infinity-kappa-onek": { name: "Infinity Kappa OneK", brand: "Infinity", price: "15.270.000₫", desc: "Ampli ô tô Infinity Kappa OneK, bộ khuếch đại loa siêu trầm mono công suất RMS lên đến 1000W @ 2 ohm, hỗ trợ Bass EQ linh hoạt. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Loại","Bộ khuếch đại loa siêu trầm"],["Công suất RMS @ 4 ohm","700W"],["Công suất RMS @ 2 ohm","1000W"],["Tổng công suất cực đại","2600W"],["Bass EQ","10Hz – 80Hz Biến thiên 0 – 12dB"],["Cầu chì","3 x 35A"]] },
    "infinity-reference-3004a": { name: "Infinity REFERENCE 3004A", brand: "Infinity", price: "8.830.000₫", desc: "Ampli ô tô Infinity Reference 3004A 4 kênh, công suất RMS 400W, thiết kế Class H hiệu suất cao cùng hệ thống bảo vệ toàn diện. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Số kênh","4"],["Công suất RMS","4 x 100W @ 4Ω"],["Công suất Peak","4 x 200W (tổng 800W)"],["Dải tần số","20Hz – 20kHz"],["Công nghệ","Class H"],["Bảo vệ","Quá tải, quá nhiệt, ngắn mạch, đảo cực"]] },
    "infinity-kappa-five": { name: "Infinity Kappa Five", brand: "Infinity", price: "7.900.000₫", desc: "Ampli ô tô Infinity Kappa Five 5 kênh, công suất đỉnh 2300W, hỗ trợ Bluetooth, công nghệ Clari-Fi và chế độ Party Mode. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Công suất tối đa","2300W"],["Công suất RMS","1150W"],["Số kênh","5 kênh"],["Kết nối","Bluetooth®, ADAS, Mini-USB"],["Công nghệ","Clari-Fi™, DBO™, Class D"]] },
    "infinity-sdp4425": { name: "Infinity SDP4425", brand: "Infinity", price: "10.750.000₫", desc: "Ampli ô tô Infinity SDP4425 (DSP4425) 4 kênh tích hợp DSP, thiết kế nhỏ gọn Class A/B, cho phép tinh chỉnh chi tiết từng kênh và tái tạo âm thanh trung thực. Hàng chính hãng Harman - phân phối bởi PGI.", specs: [["Số kênh","4 kênh"],["Công suất RMS","25W × 4"],["Công suất đỉnh","200W"],["EQ","31 băng tần, Parametric/Graphic, độ dốc 0–48dB"],["Cầu chì","15A"],["Điện áp hoạt động","8V – 16V"]] },

    /* ---------- Harman/Kardon - Loa Ô Tô ---------- */
    "hk-f6cf": { name: "Harman/Kardon F6CF", brand: "Harman/Kardon", price: "10.500.000₫", desc: "Loa lắp ở trên (loa treo trần) Harman/Kardon F6CF, thiết kế cao cấp dành riêng cho lắp đặt trên xe hơi, mang lại chất lượng âm thanh chuyên nghiệp cho khoang xe. Sản phẩm chính hãng, phân phối bởi PGI.", specs: [["SKU","HKF6CF"],["Thương hiệu","Harman/Kardon"],["Tình trạng","Còn hàng"]] },
    "hk-f6f": { name: "Harman/Kardon F6F", brand: "Harman/Kardon", price: "6.850.000₫", desc: "Loa lắp ở trên (loa treo trần) Harman/Kardon F6F, dòng loa cao cấp cho hệ thống âm thanh ô tô, mang đến âm thanh trung thực, sống động. Bán theo cặp, hàng chính hãng PGI phân phối.", specs: [["SKU","HKF6F"],["Đơn vị","Cặp"],["Tình trạng","Còn hàng"]] },
    "hk-flow75t": { name: "Harman/Kardon FLOW75T", brand: "Harman/Kardon", price: "2.490.000₫", desc: "Loa tweeter phân tần cao cấp dành cho xe hơi với vòm lụa 3/4 inch, mang đến âm thanh tinh tế và rõ nét. Thiết kế hướng cạnh giúp phân bổ âm thanh đồng đều trong khoang xe.", specs: [["Loại loa","Tweeter vòm lụa 3/4\" (19mm)"],["Công suất RMS","120W"],["Công suất Peak","360W"],["Trở kháng","4 Ohm"],["Độ nhạy","91dB"],["Dải tần số","2kHz – 40kHz"]] },
    "hk-flow-300s": { name: "Harman/Kardon FLOW 300S", brand: "Harman/Kardon", price: "8.500.000₫", desc: "Loa midrange woofer 3 inch được thiết kế riêng cho cabin ô tô, tích hợp màng loa DCC và công nghệ Plus One™ mở rộng dải trầm xuống 200Hz, mang lại trải nghiệm nghe nhạc chi tiết và chuyên nghiệp.", specs: [["Model","HKSPKFL300S"],["Loại loa","Midrange woofer 3\" (89mm)"],["Công suất RMS","60W"],["Công suất Peak","180W"],["Trở kháng","4 Ohm"],["Độ nhạy","91dB (2.83V@1m)"],["Dải tần số","200Hz – 10kHz (-6dB)"]] },
    "hk-flow-600cf": { name: "Harman/Kardon FLOW 600CF", brand: "Harman/Kardon", price: "16.500.000₫", desc: "Bộ loa phân tần 2 đường tiếng 6.5 inch với màng loa ceramic-aluminum và công nghệ Plus One™, kèm loa tweeter tích hợp. Dải tần số rộng (45Hz-40kHz) cùng độ nhạy cao (91dB) mang lại âm thanh rõ ràng, mạnh mẽ.", specs: [["Loại loa","Phân tần 2 đường tiếng 6.5\" (165mm)"],["Công suất RMS","120W"],["Công suất Peak","360W"],["Độ nhạy","91dB"],["Dải tần số","45Hz – 40kHz"],["Trở kháng","4 Ohm"]] },

    /* ---------- Harman/Kardon - Loa Sub ---------- */
    "hk-feel-700": { name: "Harman/Kardon Feel 700", brand: "Harman/Kardon", price: "9.500.000₫", desc: "Loa sub xe hơi 7 inch tích hợp sẵn amply Class D nhỏ gọn nhưng mạnh mẽ, mang lại âm bass sâu và uy lực trong khi tối ưu không gian nội thất. Có thể tùy chỉnh EQ và Bass Boost linh hoạt.", specs: [["Loại loa","Subwoofer 7\" tích hợp amply"],["Công suất RMS","125W"],["Công suất Peak","250W"],["Dải tần số","40Hz – 150Hz"],["Bass Boost","0 đến +12dB @ 50Hz"],["Kích thước","260 x 195 x 58 mm"]] },
    "hk-flow-80": { name: "Harman/Kardon Flow 80", brand: "Harman/Kardon", price: "6.500.000₫", desc: "Loa sub xe ô tô Harman/Kardon Flow 80 là mẫu loa trầm 8 inch thiết kế chuyên biệt cho xe hơi, mang đến âm bass chắc khỏe và sâu lắng. Cấu trúc thông minh dễ lắp đặt dưới ghế mà không chiếm nhiều diện tích.", specs: [["Loại loa","Subwoofer 8\" polypropylene"],["Công suất RMS","125W"],["Công suất Peak","375W"],["Trở kháng","4 Ohm"],["Độ nhạy","85dB (1W/1m)"],["Dải tần số","45Hz – 1kHz"]] },

    /* ---------- Harman/Kardon - Âm Ly ---------- */
    "hk-ca-5250": { name: "Harman/Kardon CA 5250", brand: "Harman/Kardon", price: "9.940.000₫", desc: "Ampli 5 kênh cho xe ô tô, mang lại hiệu suất mạnh mẽ, ổn định với xử lý âm thanh tiên tiến. Thiết kế nhỏ gọn, tích hợp dễ dàng với hệ thống loa độ hoặc loa zin để nâng cấp trải nghiệm âm thanh trên xe.", specs: [["Số kênh","5 kênh (4 full-range + 1 sub)"],["Công suất RMS","4x50W@4Ω + 300W sub / 4x70W@2Ω + 400W sub"],["Công suất Peak","700W (tổng)"],["Dải tần số","20Hz – 20kHz"],["Trở kháng","2Ω – 4Ω"]] },
    "hk-ca-280": { name: "Harman/Kardon CA 280", brand: "Harman/Kardon", price: "6.900.000₫", desc: "Ampli lắp xe ô tô Harman/Kardon CA 280 là thiết bị nâng cấp âm thanh chuyên nghiệp, mang lại chất lượng âm thanh trung thực và ổn định cho xe hơi.", specs: [["Công suất RMS","280W"],["Công suất Peak","800W"],["Dải tần số","20Hz – 20kHz"],["Trở kháng đầu ra","2 – 4Ω"],["Class ampli","AB"],["SKU","CA280E"]] },

    /* ---------- Pioneer - Loa Ô Tô ---------- */
    "pioneer-ts-z65ch": { name: "Pioneer TS-Z65CH", brand: "Pioneer", price: "11.990.000₫", desc: "Bộ loa phân tần cao cấp hỗ trợ Hi-Res Audio lên đến 96kHz, màng loa woofer composite sợi Twaron và tweeter nhôm công nghệ HSDOM cho âm thanh tái tạo vượt trội, dải tần rộng và độ méo tối thiểu.", specs: [["Mã sản phẩm","TS-Z65CH"],["Kích thước woofer","16.5cm"],["Kích thước tweeter","29mm"],["Công suất tối đa","330W"],["Công suất RMS","110W"],["Dải tần số","30Hz – 96kHz"],["Độ nhạy","85dB"],["Trở kháng","4 Ohm"]] },
    "pioneer-ts-a1608c": { name: "Pioneer TS-A1608C", brand: "Pioneer", price: "3.490.000₫", desc: "Bộ loa phân tần 2 đường tiếng với màng loa woofer IMPP gia cường carbon và mica cho âm bass sâu, tweeter polyimide cho âm treble trong trẻo, chịu nhiệt tốt.", specs: [["Dòng sản phẩm","GRADE A Series"],["Kích thước woofer","16.5cm (6.5\")"],["Kích thước tweeter","20mm"],["Công suất Peak","350W"],["Công suất RMS","80W"],["Dải tần số","33Hz – 58kHz"],["Độ nhạy","90dB (1W/1m)"],["Xuất xứ","Nhật Bản"]] },
    "pioneer-ts-g1620f-2": { name: "Pioneer TS-G1620F-2", brand: "Pioneer", price: "1.390.000₫", desc: "Loa đồng trục 2 đường tiếng 6.5 inch với màng loa woofer IMPP và tweeter vòm PET, mang lại chất lượng âm thanh vượt trội, là lựa chọn nâng cấp giá hợp lý.", specs: [["Kích thước","6.5 inch"],["Thiết kế","Đồng trục 2 đường tiếng"],["Tweeter","Vòm cân bằng 30mm, chất liệu PET"],["Woofer","IMPP™ (polypropylene) gia cường mica"],["Công suất tối đa","300W (định mức 40W)"],["Dải tần số","31Hz – 18kHz"],["Độ nhạy","89dB (1W/1m)"],["Bảo hành","1 năm"],["Xuất xứ","Nhật Bản"]] },

    /* ---------- Pioneer - Loa Sub ---------- */
    "pioneer-ts-a30s4": { name: "Pioneer TS-A30S4", brand: "Pioneer", price: "1.990.000₫", desc: "Loa sub xe ô tô Pioneer TS-A30S4 cho âm bass mạnh mẽ với công nghệ tiên tiến và cấu trúc cao cấp. Dòng A-series với màng loa IMPP™ gia cường sợi thủy tinh, mang lại âm trầm sâu và uy lực.", specs: [["Loại loa","Sub 12 inch (30cm)"],["Công suất RMS","400W"],["Công suất Peak","1.400W"],["Dải tần số","22Hz – 1.6kHz"],["Độ nhạy","75dB"],["Trở kháng","4 Ohm"],["Bảo hành","1 năm"],["Xuất xứ","Nhật Bản"]] },
    "pioneer-ts-wx140da": { name: "Pioneer TS-WX140DA", brand: "Pioneer", price: "6.390.000₫", desc: "Loa sub gầm ghế nhỏ gọn tích hợp sẵn amply Class-D và chip DSP. Mang lại âm bass mạnh mẽ trong thiết kế mỏng chỉ 70mm mà không chiếm nhiều không gian nội thất, tích hợp 3 chế độ EQ tùy chỉnh.", specs: [["Kích thước","280 x 70 x 200 mm"],["Công suất Peak","170W"],["Công suất RMS","50W"],["Dải tần số (DEEP)","20-200Hz"],["Bảo hành","2 năm chính hãng"],["Xuất xứ","Nhật Bản"]] },

    /* ---------- Pioneer - Âm Ly ---------- */
    "pioneer-gm-a6704": { name: "Pioneer GM-A6704", brand: "Pioneer", price: "5.490.000₫", desc: "Ampli Class-AB 4 kênh công suất tối đa 1000W, thiết kế nhỏ gọn với núm chỉnh Bass Boost từ xa. Bộ lọc HPF/LPF linh hoạt mang lại âm thanh mạnh mẽ, chân thực cho mọi hành trình.", specs: [["Số kênh","4/3/2 kênh"],["Class ampli","AB"],["Công suất tối đa","170W x4 (4Ω) / 250W x4 (2Ω) / 500W x2 (cầu 4Ω)"],["Công suất RMS","60W x4 (4Ω) / 95W x4 (2Ω) / 190W x2 (cầu 4Ω)"],["Dải tần số","10Hz – 70kHz"],["Bass Boost","0/6/12dB @ 50Hz"]] },
    "pioneer-gm-d8704": { name: "Pioneer GM-D8704", brand: "Pioneer", price: "10.160.000₫", desc: "Ampli Class-D 4 kênh công suất tối đa 200W, thiết kế nhỏ gọn linh hoạt lắp đặt với mạch Class-D tinh gọn cho hiệu suất cao và chất lượng âm thanh vượt trội.", specs: [["Loại ampli","Class-D, 4 kênh"],["Công suất tối đa","200W"],["Bộ lọc LPF","Điều chỉnh 40-500Hz"],["Bộ lọc HPF","Điều chỉnh 40-500Hz"],["Trở kháng hỗ trợ","Ổn định ở 1Ω"],["SKU","GM-D8704"],["Xuất xứ","Nhật Bản"]] },

    "kyb-excel-g":           { name: "KYB Excel-G",                 brand: "KYB",              image: "", price: "", desc: "" },
    "tein-flex-z":           { name: "Tein Flex Z",                 brand: "Tein",             image: "", price: "", desc: "" },
    "gforce-sport":          { name: "G-Force Sport",               brand: "G-Force",          image: "", price: "", desc: "" }
  }
};

window.CATALOG = CATALOG;
