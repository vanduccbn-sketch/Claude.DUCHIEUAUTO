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

    "gotech-gt2k":           { name: "Gotech GT2K",                 brand: "Gotech",           image: "", price: "", desc: "" },
    "gotech-gts4":           { name: "Gotech GTS4",                 brand: "Gotech",           image: "", price: "", desc: "" },
    "zestech-z18":           { name: "Zestech Z18",                 brand: "Zestech",          image: "", price: "", desc: "" },
    "zestech-zx10":          { name: "Zestech ZX10",                brand: "Zestech",          image: "", price: "", desc: "" },
    "kovar-t2":              { name: "Kovar T2",                    brand: "Kovar",            image: "", price: "", desc: "" },
    "teyes-cc3":             { name: "Teyes CC3",                   brand: "Teyes",            image: "", price: "", desc: "" },
    "safeview-elite-360":    { name: "Safeview Elite 360",          brand: "Safeview",         image: "", price: "", desc: "" },

    "utour-x5":              { name: "UTOUR X5",                    brand: "UTOUR",            image: "", price: "", desc: "" },
    "vietmap-h9":            { name: "VIETMAP H9",                  brand: "VIETMAP",          image: "", price: "", desc: "" },
    "70mai-a810":            { name: "70mai A810",                  brand: "70mai",            image: "", price: "", desc: "" },
    "finevu-gx4":            { name: "FINEVU GX4",                  brand: "FINEVU",           image: "", price: "", desc: "" },
    "blackvue-dr770x":       { name: "BlackVue DR770X",             brand: "BlackVue",         image: "", price: "", desc: "" },

    "infinity-reference":    { name: "Infinity Reference",          brand: "Infinity",         image: "", price: "", desc: "" },
    "jbl-club-6520":         { name: "JBL Club 6520",               brand: "JBL",              image: "", price: "", desc: "" },
    "pioneer-dmh-z6350":     { name: "Pioneer DMH-Z6350",           brand: "Pioneer",          image: "", price: "", desc: "" },
    "german-maestro-m-line": { name: "German-Maestro M-Line",       brand: "German-Maestro",   image: "", price: "", desc: "" },
    "helix-dsp-pro":         { name: "HELIX DSP Pro",               brand: "Audiotec Fischer", image: "", price: "", desc: "" },

    "kyb-excel-g":           { name: "KYB Excel-G",                 brand: "KYB",              image: "", price: "", desc: "" },
    "tein-flex-z":           { name: "Tein Flex Z",                 brand: "Tein",             image: "", price: "", desc: "" },
    "gforce-sport":          { name: "G-Force Sport",               brand: "G-Force",          image: "", price: "", desc: "" }
  }
};

window.CATALOG = CATALOG;
