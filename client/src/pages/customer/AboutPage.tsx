import React from 'react';
import { Link } from 'react-router-dom';

const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Hero */}
        <section className="relative rounded-xl overflow-hidden mb-8">
          <div
            className="h-72 md:h-96 lg:h-[520px] bg-cover bg-center"
            style={{
              backgroundImage: `url('${SERVER_URL}/uploads/banners/banner-1.png')`,
            }}
          />

          <div className="absolute inset-0 bg-black/40" />

          <div className="absolute inset-0 flex items-center">
            <div className="max-w-3xl mx-auto px-6 text-white">
              <h1 className="text-2xl md:text-4xl lg:text-5xl
                font-extrabold leading-tight">
                Paradise Hotel – Trải nghiệm nghỉ dưỡng đỉnh cao
              </h1>
              <p className="mt-3 text-sm md:text-base text-white/90">
                Nơi mỗi khoảnh khắc đều là một kỳ nghỉ trong mơ.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/rooms"
                  className="inline-block bg-primary-600 hover:bg-primary-700
                    text-white font-semibold py-2 px-4 rounded-md shadow"
                >
                  Khám phá phòng
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements & Certifications */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Thành tựu & chứng nhận</h3>

          <div className="flex flex-col md:flex-row md:items-center
            md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={`${SERVER_URL}/uploads/badges/top10.png`}
                alt="Top 10"
                className="h-16 w-16 object-contain"
              />

              <div>
                <div className="font-semibold">Top 10 Resort</div>
                <div className="text-sm text-gray-600">Được bình chọn 2024</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <img src={`${SERVER_URL}/uploads/badges/booking.png`} alt="Booking" className="h-8" />
                <div>
                  <div className="font-semibold">Booking</div>
                  <div className="text-sm text-gray-600">9.2</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img src={`${SERVER_URL}/uploads/badges/agoda.avif`} alt="Agoda" className="h-8" />
                <div>
                  <div className="font-semibold">Agoda</div>
                  <div className="text-sm text-gray-600">4.7</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img src={`${SERVER_URL}/uploads/badges/google.png`} alt="Google" className="h-8" />
                <div>
                  <div className="font-semibold">Google</div>
                  <div className="text-sm text-gray-600">4.8</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to="/reviews"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md"
            >
              Xem đánh giá & badge
            </Link>
          </div>
        </section>

        {/* Team */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-4">Đội ngũ nhân sự</h3>
          <p className="text-gray-600 mb-4">Đội ngũ chuyên nghiệp, thân
            thiện và luôn sẵn sàng phục vụ bạn với nụ cười.</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-3 flex flex-col items-center">
              <img src={`${SERVER_URL}/uploads/team/staff1.jpg`} alt="Staff 1"
                className="w-24 h-24 rounded-full object-cover" />
              <div className="mt-2 font-semibold">Nguyễn An</div>
              <div className="text-sm text-gray-600">Giám đốc khách sạn</div>
            </div>

            <div className="bg-white rounded-lg p-3 flex flex-col items-center">
              <img src={`${SERVER_URL}/uploads/team/staff2.jpg`} alt="Staff 2"
                className="w-24 h-24 rounded-full object-cover" />
              <div className="mt-2 font-semibold">Trần Mai</div>
              <div className="text-sm text-gray-600">Trưởng bộ phận phục vụ</div>
            </div>

            <div className="bg-white rounded-lg p-3 flex flex-col items-center">
              <img src={`${SERVER_URL}/uploads/team/staff3.jpg`} alt="Staff 3"
                className="w-24 h-24 rounded-full object-cover" />
              <div className="mt-2 font-semibold">Lê Bình</div>
              <div className="text-sm text-gray-600">Quản lý Spa</div>
            </div>

            <div className="bg-white rounded-lg p-3 flex flex-col items-center">
              <img src={`${SERVER_URL}/uploads/team/staff4.jpg`} alt="Staff 4"
                className="w-24 h-24 rounded-full object-cover" />
              <div className="mt-2 font-semibold">Phạm Hằng</div>
              <div className="text-sm text-gray-600">Trưởng bếp</div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-4">Hình ảnh khách sạn</h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <img
                src={`${SERVER_URL}/uploads/gallery/pool.png`}
                alt="Hồ bơi"
                className="w-full h-32 object-cover rounded-md"
              />
            </div>

            <div>
              <img
                src={`${SERVER_URL}/uploads/gallery/room.png`}
                alt="Phòng"
                className="w-full h-32 object-cover rounded-md"
              />
            </div>

            <div>
              <img
                src={`${SERVER_URL}/uploads/gallery/restaurant.png`}
                alt="Nhà hàng"
                className="w-full h-32 object-cover rounded-md"
              />
            </div>

            <div>
              <img
                src={`${SERVER_URL}/uploads/gallery/lobby.png`}
                alt="Lobby"
                className="w-full h-32 object-cover rounded-md"
              />
            </div>

            <div>
              <img
                src={`${SERVER_URL}/uploads/gallery/garden.png`}
                alt="Garden"
                className="w-full h-32 object-cover rounded-md"
              />
            </div>

            <div>
              <img
                src={`${SERVER_URL}/uploads/gallery/rooftop.png`}
                alt="Rooftop"
                className="w-full h-32 object-cover rounded-md"
              />
            </div>
          </div>
        </section>

        {/* Why Choose */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-4">Vì sao chọn Paradise Hotel</h3>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">✔️</div>
              <div>
                <div className="font-medium">Vị trí trung tâm</div>
                <div className="text-sm text-gray-600">Tiện di chuyển và tham quan</div>
              </div>
            </li>

            <li className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">✔️</div>
              <div>
                <div className="font-medium">View đẹp</div>
                <div className="text-sm text-gray-600">View biển / view núi tùy phòng</div>
              </div>
            </li>

            <li className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">✔️</div>
              <div>
                <div className="font-medium">Giá tốt theo mùa</div>
                <div className="text-sm text-gray-600">Ưu đãi theo mùa và combo</div>
              </div>
            </li>

            <li className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">✔️</div>
              <div>
                <div className="font-medium">Combo nghỉ dưỡng</div>
                <div className="text-sm text-gray-600">Gói bao gồm ăn, spa và vé tham quan</div>
              </div>
            </li>

            <li className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">✔️</div>
              <div>
                <div className="font-medium">Thanh toán online</div>
                <div className="text-sm text-gray-600">Hỗ trợ nhiều phương thức an toàn</div>
              </div>
            </li>
          </ul>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2">Vị trí trung tâm</h3>
            <p className="text-gray-600 text-sm">
              Chỉ vài phút tới các điểm tham quan, mua sắm và khu ẩm thực
              sầm uất của thành phố.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2">Tiện nghi cao cấp</h3>
            <p className="text-gray-600 text-sm">
              Phòng nghỉ trang bị TV thông minh, Wi‑Fi tốc độ cao và minibar.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2">Dịch vụ tận tâm</h3>
            <p className="text-gray-600 text-sm">
              Đội ngũ chuyên nghiệp luôn sẵn sàng phục vụ để kỳ nghỉ của bạn
              trọn vẹn hơn.
            </p>
          </div>
        </section>

        {/* Mission & Team */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Tầm nhìn & Sứ mệnh</h3>
          <p>
            Chúng tôi cam kết mang đến trải nghiệm nghỉ dưỡng tốt nhất bằng cách
            kết hợp thiết kế tinh tế, dịch vụ chuyên nghiệp và chú trọng đến chi
            tiết. Mỗi khách hàng là một câu chuyện — và chúng tôi muốn
            đồng hành để tạo nên những kỷ niệm khó quên.
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold mb-4">Đội ngũ của chúng tôi</h3>
          <p>
            Đội ngũ nhân viên được đào tạo chuyên nghiệp, luôn tận tâm để phục
            vụ từng khách hàng. Từ lễ tân đến đội phục vụ phòng, chúng tôi luôn
            đặt trải nghiệm khách hàng lên hàng đầu.
          </p>
        </section>

        {/* History & Story */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-3">Lịch sử & Câu chuyện</h3>
            <p className="text-gray-700 mb-2"><strong>Hoạt động từ:</strong> 2010</p>
            <p className="text-gray-700 mb-2"><strong>Concept:</strong> Thiên nhiên,
              sang trọng, nghỉ dưỡng</p>
            <p className="text-gray-700 mb-2"><strong>Triết lý phục vụ:</strong>
              Tận tâm, riêng tư, chu đáo</p>
            <p className="text-gray-600">
              Bắt đầu như một khu nghỉ nhỏ ấm cúng, Paradise Hotel phát triển
              theo tôn chỉ hài hòa với thiên nhiên và nâng tầm trải nghiệm khách.
            </p>
          </div>

          <div className="space-y-4">
            <img
              src={`${SERVER_URL}/uploads/banners/lobby.png`}
              alt="Lobby Paradise"
              className="w-full rounded-md object-cover h-48"
            />

            <video
              src={`${SERVER_URL}/uploads/videos/walkthrough.mp4`}
              poster={`${SERVER_URL}/uploads/banners/banner-1.png`}
              controls
              muted
              className="w-full rounded-md h-48 object-cover"
            />
          </div>
        </section>

        {/* Core Values */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Giá trị cốt lõi</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl">🌿</div>
              <h4 className="font-semibold mt-2">Không gian gần gũi thiên nhiên</h4>
              <p className="text-sm text-gray-600">Không gian xanh, thư giãn
                giúp khách hòa mình vào thiên nhiên.</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl">🤝</div>
              <h4 className="font-semibold mt-2">Dịch vụ đẳng cấp 5 sao</h4>
              <p className="text-sm text-gray-600">Chu đáo, lịch sự, với đội ngũ
                chuyên nghiệp.</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl">🛡️</div>
              <h4 className="font-semibold mt-2">Bảo mật & riêng tư</h4>
              <p className="text-sm text-gray-600">Bảo đảm an toàn thông tin
                và không gian riêng cho khách.</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-3xl">🧹</div>
              <h4 className="font-semibold mt-2">Vệ sinh chuẩn quốc tế</h4>
              <p className="text-sm text-gray-600">Tiêu chuẩn sạch sẽ theo
                quy trình quốc tế.</p>
            </div>
          </div>
        </section>

        {/* Featured Services */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4">Các dịch vụ nổi bật</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={`${SERVER_URL}/uploads/banners/banner-1.png`}
                alt="Spa"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="text-3xl">💆‍♀️</div>
                <h4 className="font-semibold mt-2">Spa & Massage</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Các liệu pháp thư giãn chuyên sâu, massage và chăm sóc cơ
                  thể với chuyên gia.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={`${SERVER_URL}/uploads/banners/banner-2.png`}
                alt="Infinity Pool"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="text-3xl">🏊‍♂️</div>
                <h4 className="font-semibold mt-2">Hồ bơi vô cực</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Hồ bơi trên tầng thượng với view toàn cảnh, phục vụ đồ uống
                  và ghế thư giãn.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={`${SERVER_URL}/uploads/banners/banner-3.png`}
                alt="Restaurant"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="text-3xl">🍽️</div>
                <h4 className="font-semibold mt-2">Nhà hàng & Bar</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Ẩm thực đa dạng, bar cao cấp với thực đơn cocktails sáng tạo.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={`${SERVER_URL}/uploads/banners/banner-4.png`}
                alt="Fitness"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="text-3xl">🏋️‍♀️</div>
                <h4 className="font-semibold mt-2">Fitness Center</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Phòng gym trang bị hiện đại, huấn luyện viên cá nhân theo yêu cầu.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img
                src={`${SERVER_URL}/uploads/banners/banner-5.png`}
                alt="Transfer"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="text-3xl">🚗</div>
                <h4 className="font-semibold mt-2">Dịch vụ đưa đón</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Đưa đón sân bay và dịch vụ xe riêng với lái xe chuyên nghiệp.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to="/services"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md"
            >
              Xem thêm dịch vụ
            </Link>
          </div>
        </section>

        {/* Room Amenities */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-4">Tiện ích trong phòng</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">📶</div>
              <div>
                <div className="font-medium">WiFi</div>
                <div className="text-sm text-gray-600">Internet tốc độ cao</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">🛁</div>
              <div>
                <div className="font-medium">Bath-tub</div>
                <div className="text-sm text-gray-600">Bồn tắm riêng</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">🏝️</div>
              <div>
                <div className="font-medium">Balcony</div>
                <div className="text-sm text-gray-600">Ban công nhìn view</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">🥂</div>
              <div>
                <div className="font-medium">Mini bar</div>
                <div className="text-sm text-gray-600">Đồ uống & snack</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">❄️</div>
              <div>
                <div className="font-medium">Điều hòa</div>
                <div className="text-sm text-gray-600">Điều chỉnh nhiệt độ riêng</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">📺</div>
              <div>
                <div className="font-medium">Smart TV</div>
                <div className="text-sm text-gray-600">Kênh quốc tế & streaming</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">🛋️</div>
              <div>
                <div className="font-medium">Sofa lounge</div>
                <div className="text-sm text-gray-600">Góc thư giãn trong phòng</div>
              </div>
            </div>
          </div>
        </section>

        {/* Google Map */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-4">Ghim bản đồ</h3>

          <div className="rounded-lg overflow-hidden shadow-sm">
            <iframe
              title="Paradise Hotel map"
              src="https://www.google.com/maps?q=Da+Nang+Vietnam&output=embed"
              className="w-full h-64 border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <a
              href="https://www.google.com/maps/search/?api=1&query=Da+Nang+Vietnam"
              target="_blank"
              rel="noreferrer"
              className="text-indigo-600"
            >
              Mở Google Maps
            </a>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mb-12 bg-indigo-600 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold">
            Sẵn sàng cho kỳ nghỉ tiếp theo của bạn?
          </h3>
          <p className="mt-2 text-sm text-white/90">
            Chọn phòng và đặt ngay để nhận ưu đãi.
          </p>
          <div className="mt-4">
            <Link
              to="/rooms"
              className="inline-block bg-white text-indigo-600 font-semibold py-2 px-6 rounded-md"
            >
              Khám phá phòng ngay
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
