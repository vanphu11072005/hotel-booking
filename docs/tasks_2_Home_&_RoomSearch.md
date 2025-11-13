# Review System

## Chức năng 1: HomePage – Trang chủ hiển thị phòng nổi bật

### Mục tiêu
    Tạo giao diện trang chủ giới thiệu phòng nổi bật, banner và điều hướng đến danh sách phòng.

#### Nhiệm vụ chi tiết
1. Route: /
2. Banner:
    ```
    GET /api/banners?position=home
    ```
    - Nếu không có banner → hiển thị ảnh mặc định.
    - Có thể dùng Carousel hoặc ảnh tĩnh.
3. Phòng nổi bật:
    ```
    GET /api/rooms?featured=true
    ```
    - Hiển thị 4–6 phòng bằng component RoomCard.
    - Nút “Xem tất cả phòng” → điều hướng /rooms.
4. Loading skeleton trong khi chờ dữ liệu.

### Kết quả mong đợi
1. Trang chủ hiển thị banner và danh sách phòng nổi bật rõ ràng.
2. Khi không có banner → ảnh fallback được hiển thị.
3. Phòng nổi bật load từ API, giới hạn 4–6 phòng.
4. UX mượt, có skeleton khi load.
5. Nút “Xem tất cả phòng” điều hướng chính xác đến /rooms.

---

## Chức năng 2: RoomListPage – Danh sách & Bộ lọc phòng

### Mục tiêu
    Hiển thị danh sách phòng, cho phép người dùng lọc theo loại, giá, số người và phân trang.

#### Nhiệm vụ chi tiết
1. Route: /rooms
2. Bộ lọc (component RoomFilter):
    - Trường lọc: loại phòng, giá min–max, số người.
    - Khi submit → gọi API:
        ```
        GET /api/rooms?type=&minPrice=&maxPrice=&capacity=&page=
        ```
    - Lưu bộ lọc vào URL query.
    - Nút “Reset” để xóa toàn bộ bộ lọc.
3. Phân trang (Pagination component).
4. Hiển thị danh sách bằng RoomCard.

### Kết quả mong đợi
1. Danh sách phòng hiển thị chính xác theo filter.
2. Bộ lọc hoạt động mượt, có thể reset dễ dàng.
3. Phân trang hiển thị chính xác số trang.
4. Filter được lưu trong URL (giúp reload không mất).
5. Giao diện responsive, dễ đọc, không bị vỡ.

---

## Chức năng 3: RoomDetailPage – Chi tiết phòng & Đánh giá

### Mục tiêu
    Tạo trang chi tiết phòng đầy đủ thông tin, hình ảnh, tiện ích và khu vực đánh giá.

#### Nhiệm vụ chi tiết
1. Route: /rooms/:id
2. Phần nội dung:
    -Thông tin phòng (ảnh, mô tả, giá, tiện ích)
    - RoomGallery: Carousel ảnh
    - RoomAmenities: danh sách tiện ích
    - Nút “Đặt ngay” → điều hướng /booking/:roomId
3. Review Section:
    - Lấy danh sách review đã duyệt:
        ```
        GET /api/rooms/:id/reviews
        ```
    - Nếu người dùng đã từng đặt phòng:
        ```
        POST /api/reviews
        ```
4. Component RatingStars + ReviewForm.
5. Nếu chưa đăng nhập → hiển thị “Vui lòng đăng nhập để đánh giá”.
6. Tính trung bình điểm review.
7. Loading skeleton khi chờ review.

### Kết quả mong đợi
1. Hiển thị đầy đủ ảnh, mô tả, tiện ích phòng.
2. Carousel hoạt động mượt mà.
3. Review hiển thị đúng, có trung bình số sao.
4. Người đã đặt có thể viết review (sau duyệt).
5. Nút “Đặt ngay” điều hướng chính xác đến form booking.
6. Skeleton hiển thị khi chờ dữ liệu.

--- 

## Chức năng 4: SearchRoom – Tìm phòng trống

### Mục tiêu
    Cho phép người dùng tìm phòng trống theo ngày và loại phòng.

#### Nhiệm vụ chi tiết
1. Form tìm kiếm (ở HomePage hoặc RoomListPage):
    - Input: ngày đến (from), ngày đi (to), loại phòng.
2. API:
    ```
    GET /api/rooms/available?from=&to=&type=
    ```
3. Validate:
    - from < to
    - from không nhỏ hơn hôm nay.
4. Kết quả:
    - Hiển thị danh sách bằng RoomCard.
    - Nếu không có kết quả → “Không tìm thấy phòng phù hợp”.
5. Dùng react-datepicker hoặc react-day-picker.
6. Loading spinner khi đang tìm.

### Kết quả mong đợi
1. Form tìm phòng hoạt động, validate chính xác.
2. Khi bấm tìm → hiển thị danh sách phòng trống.
3. Nếu không có kết quả → thông báo thân thiện.
4. Loading hiển thị rõ trong lúc chờ.
5. Tìm theo ngày & loại phòng chính xác từ backend.

---

## Chức năng 5: Wishlist – Danh sách yêu thích

### Mục tiêu
    Cho phép người dùng thêm, bỏ hoặc xem danh sách phòng yêu thích.

#### Nhiệm vụ chi tiết
1. API:
    ```
    POST /api/favorites/:roomId   # Thêm
    DELETE /api/favorites/:roomId # Xóa
    GET /api/favorites            # Lấy danh sách yêu thích
    ```
2. UI:
    - FavoriteButton (icon ❤️):
        + Nếu yêu thích → tô đỏ
        + Nếu chưa → viền xám
    - Tooltip: “Thêm vào yêu thích” / “Bỏ yêu thích”
3. Nếu chưa đăng nhập:
    - Lưu tạm trong localStorage (guestFavorites)
    - Khi đăng nhập → đồng bộ với server.
4. Toast thông báo khi thêm/bỏ yêu thích.

### Kết quả mong đợi
1. Nút ❤️ hoạt động đúng trạng thái (đỏ / xám).
2. Người chưa đăng nhập vẫn có thể lưu tạm yêu thích.
3. Khi đăng nhập → danh sách đồng bộ với backend.
4. Toast hiển thị “Đã thêm vào yêu thích” / “Đã bỏ yêu thích”.
5. API hoạt động đúng, không lỗi 401 khi đăng nhập hợp lệ.

---

## Chức năng 6: Tối ưu UI/UX & Performance

### Mục tiêu
    Cải thiện trải nghiệm người dùng, tối ưu tốc độ tải và khả năng hiển thị responsive.

#### Nhiệm vụ chi tiết
1. Loading skeleton khi fetch phòng hoặc review.
2. Debounce khi nhập giá để tránh gọi API liên tục.
3. Infinite scroll (tùy chọn) thay cho pagination.
4. Responsive layout:
    - Desktop: 3–4 cột
    - Tablet: 2 cột
    - Mobile: 1 cột
5. Empty states:
    - Không có phòng → hiển thị ảnh minh họa + dòng “Không tìm thấy phòng phù hợp”.
    - Không có review → “Hãy là người đầu tiên đánh giá!”.
6. Toast thông báo khi thêm yêu thích, gửi review, lỗi mạng.

### Kết quả mong đợi
1. Trang hoạt động mượt, có skeleton khi chờ dữ liệu.
2. Tốc độ phản hồi nhanh (debounce hoạt động).
3. Responsive trên mọi kích thước màn hình.
4. Các empty state hiển thị thân thiện.
5. Toast thông báo rõ ràng, UX thân thiện.

---
