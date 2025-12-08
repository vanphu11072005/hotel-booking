# Luồng chức năng bộ lọc phòng (ngắn gọn)

Mô tả: người dùng thu hẹp kết quả tìm phòng bằng các bộ lọc
như loại phòng, giá, tiện ích, số khách.

1) Frontend hiển thị bộ lọc
- Các filter: Loại phòng, giá, loại phòng, số khách, tiện ích.

2) Lọc client vs server
- Server-side filtering: chuẩn nhất, hỗ trợ phân trang, dữ liệu lớn.
- Client-side: chỉ dùng khi dữ liệu ít hoặc đã cache sẵn.

3) API filter
- Endpoint: `GET /api/rooms?checkIn=x&checkOut=y&filters...`.
- Các param rõ ràng: `minPrice`, `maxPrice`, `amenities[]=wifi`.
- Trả `facets` (counts) để UI hiển thị số lượng cho mỗi
  tùy chọn filter.
