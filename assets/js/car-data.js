/* =========================================================
   Danh sách hãng xe / dòng xe phổ biến tại Việt Nam - dùng cho 2 mục chọn "Hãng xe"/"Dòng xe"
   ở trang Đặt Lịch Hẹn (thay ô nhập tay tự do trước đây). Chỉ phục vụ UI chọn nhanh - khách không
   thấy hãng/dòng xe của mình vẫn chọn được "Khác" rồi tự gõ, không bị chặn.

   THỨ TỰ các key CỐ Ý xếp theo độ phổ biến/doanh số thực tế tại VN (hãng bán chạy nhất lên đầu),
   KHÔNG phải ABC - trang đặt lịch hiển thị đúng theo thứ tự này để khách thường gặp nhất tìm
   nhanh hơn (kèm ô tìm kiếm lọc theo tên nếu cần tìm hãng ở xa hơn trong danh sách).
   ========================================================= */
const CAR_DATA = {
    "VinFast": ["Fadil", "VF3", "VF5", "VF6", "VF7", "VF8", "VF9", "VF e34", "Lux A2.0", "Lux SA2.0", "President"],
    "Toyota": ["Wigo", "Vios", "Yaris", "Yaris Cross", "Corolla Altis", "Corolla Cross", "Camry", "Innova", "Innova Cross", "Avanza", "Veloz Cross", "Rush", "Fortuner", "Land Cruiser Prado", "Land Cruiser", "Hilux", "Alphard"],
    "Hyundai": ["Grand i10", "Accent", "Elantra", "Custin", "Tucson", "Santa Fe", "Creta", "Stargazer", "Palisade", "Kona", "Solati"],
    "Ford": ["EcoSport", "Territory", "Ranger", "Everest", "Explorer", "Transit"],
    "Kia": ["Morning", "Soluto", "K3", "K5", "Seltos", "Sonet", "Carens", "Sportage", "Sorento", "Carnival"],
    "Mitsubishi": ["Attrage", "Xpander", "Xpander Cross", "Xforce", "Outlander", "Pajero Sport", "Triton"],
    "Honda": ["Brio", "City", "Civic", "HR-V", "BR-V", "CR-V", "Accord"],
    "Mazda": ["Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-8", "BT-50"],
    "Suzuki": ["Celerio", "Swift", "Ertiga", "XL7", "Jimny"],
    "Isuzu": ["D-Max", "mu-X"],
    "MG": ["MG5", "ZS", "HS", "RX5"],
    "Peugeot": ["2008", "3008", "5008", "408"],
    "Nissan": ["Almera", "Navara", "Kicks"],
    "Subaru": ["Forester", "XV", "Outback"],
    "Chevrolet": ["Spark", "Colorado", "Trailblazer"],
    "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLA", "GLB", "GLC", "GLE"],
    "BMW": ["Series 3", "Series 5", "X3", "X5", "X7"],
    "Audi": ["A4", "A6", "Q3", "Q5", "Q7"],
    "Lexus": ["NX", "RX", "LX", "ES"],
    "Volkswagen": ["Tiguan", "Passat"],
    "Land Rover": ["Range Rover Evoque", "Range Rover Sport", "Discovery", "Defender"],
    "Volvo": ["XC40", "XC60", "XC90"]
};
