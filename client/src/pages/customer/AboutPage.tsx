import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SERVER_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
                {t('about.heroTitle')}
              </h1>
              <p className="mt-3 text-sm md:text-base text-white/90">
                {t('about.heroSubtitle')}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/room-types"
                  className="inline-block bg-primary-600 hover:bg-primary-700
                    text-white font-semibold py-2 px-4 rounded-md shadow"
                >
                  {t('about.exploreRooms')}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements & Certifications */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('about.achievements')}</h3>

          <div className="flex flex-col md:flex-row md:items-center
            md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={`${SERVER_URL}/uploads/badges/top10.png`}
                alt="Top 10"
                className="h-16 w-16 object-contain"
              />

              <div>
                <div className="font-semibold">{t('about.top10Resort')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{t('about.voted2024')}</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <img src={`${SERVER_URL}/uploads/badges/booking.png`} alt="Booking" className="h-8" />
                  <div>
                    <div className="font-semibold">Booking</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">9.2</div>
                  </div>
              </div>

              <div className="flex items-center gap-3">
                <img src={`${SERVER_URL}/uploads/badges/agoda.avif`} alt="Agoda" className="h-8" />
                <div>
                  <div className="font-semibold">Agoda</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">4.7</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <img src={`${SERVER_URL}/uploads/badges/google.png`} alt="Google" className="h-8" />
                <div>
                  <div className="font-semibold">Google</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">4.8</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to="/reviews"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md shadow"
            >
              {t('about.viewReviews')}
            </Link>
          </div>
        </section>

        {/* Team */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('about.team')}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{t('about.teamDesc')}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center">
              <img src={`${SERVER_URL}/uploads/team/staff1.jpg`} alt="Staff 1"
                className="w-24 h-24 rounded-full object-cover" />
              <div className="mt-2 font-semibold">Nguyễn An</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('about.hotelManager')}</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center">
              <img src={`${SERVER_URL}/uploads/team/staff2.jpg`} alt="Staff 2"
                className="w-24 h-24 rounded-full object-cover" />
              <div className="mt-2 font-semibold">Trần Mai</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('about.serviceManager')}</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center">
              <img src={`${SERVER_URL}/uploads/team/staff3.jpg`} alt="Staff 3"
                className="w-24 h-24 rounded-full object-cover" />
              <div className="mt-2 font-semibold">Lê Bình</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('about.spaManager')}</div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center">
              <img src={`${SERVER_URL}/uploads/team/staff4.jpg`} alt="Staff 4"
                className="w-24 h-24 rounded-full object-cover" />
              <div className="mt-2 font-semibold">Phạm Hằng</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t('about.headChef')}</div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('about.gallery')}</h3>

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
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('about.whyChoose')}</h3>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <li className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
              <div className="text-2xl">✔️</div>
              <div>
                <div className="font-medium">{t('about.centralLocation')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{t('about.centralLocationDesc')}</div>
              </div>
            </li>

            <li className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
              <div className="text-2xl">✔️</div>
              <div>
                <div className="font-medium">{t('about.beautifulView')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{t('about.beautifulViewDesc')}</div>
              </div>
            </li>

            <li className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
              <div className="text-2xl">✔️</div>
              <div>
                <div className="font-medium">{t('about.seasonalPrice')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{t('about.seasonalPriceDesc')}</div>
              </div>
            </li>

            <li className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
              <div className="text-2xl">✔️</div>
              <div>
                <div className="font-medium">{t('about.vacationCombo')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{t('about.vacationComboDesc')}</div>
              </div>
            </li>

            <li className="flex items-start gap-3 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
              <div className="text-2xl">✔️</div>
              <div>
                <div className="font-medium">{t('about.onlinePayment')}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{t('about.onlinePaymentDesc')}</div>
              </div>
            </li>
          </ul>
        </section>

        {/* Features */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{t('about.centralLocationTitle')}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t('about.centralLocationText')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{t('about.luxuryAmenities')}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t('about.luxuryAmenitiesText')}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">{t('about.dedicatedService')}</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {t('about.dedicatedServiceText')}
            </p>
          </div>
        </section>

        {/* Mission & Team */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('about.visionMission')}</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {t('about.visionText')}
          </p>
        </section>

        <section>
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">{t('about.ourTeam')}</h3>
          <p className="text-gray-700 dark:text-gray-300">
            {t('about.ourTeamText')}
          </p>
        </section>

        {/* History & Story */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 items-center">
          <div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">{t('about.historyStory')}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>{t('about.operatingSince')}</strong> 2010</p>
            <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>{t('about.concept')}</strong> {t('about.conceptText')}</p>
            <p className="text-gray-700 dark:text-gray-300 mb-2"><strong>{t('about.servicePhilosophy')}</strong>
              {t('about.servicePhilosophyText')}</p>
            <p className="text-gray-600 dark:text-gray-300">
              {t('about.historyText')}
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
          <h3 className="text-2xl font-bold mb-4">{t('about.coreValues')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-3xl">🌿</div>
              <h4 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">{t('about.natureSpace')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('about.natureSpaceDesc')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-3xl">🤝</div>
              <h4 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">{t('about.fiveStarService')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('about.fiveStarServiceDesc')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-3xl">🛡️</div>
              <h4 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">{t('about.securityPrivacy')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('about.securityPrivacyDesc')}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <div className="text-3xl">🧹</div>
              <h4 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">{t('about.internationalHygiene')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{t('about.internationalHygieneDesc')}</p>
            </div>
          </div>
        </section>

        {/* Featured Services */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold mb-4">{t('about.featuredServices')}</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <img
                src={`${SERVER_URL}/uploads/banners/banner-1.png`}
                alt="Spa"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="text-3xl">💆‍♀️</div>
                <h4 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">{t('about.spaMassage')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t('about.spaMassageDesc')}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <img
                src={`${SERVER_URL}/uploads/banners/banner-2.png`}
                alt="Infinity Pool"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="text-3xl">🏊‍♂️</div>
                <h4 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">{t('about.infinityPool')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t('about.infinityPoolDesc')}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <img
                src={`${SERVER_URL}/uploads/banners/banner-3.png`}
                alt="Restaurant"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="text-3xl">🍽️</div>
                <h4 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">{t('about.restaurantBar')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t('about.restaurantBarDesc')}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <img
                src={`${SERVER_URL}/uploads/banners/banner-4.png`}
                alt="Fitness"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="text-3xl">🏋️‍♀️</div>
                <h4 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">{t('about.fitnessCenter')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t('about.fitnessCenterDesc')}
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <img
                src={`${SERVER_URL}/uploads/banners/banner-5.png`}
                alt="Transfer"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <div className="text-3xl">🚗</div>
                <h4 className="font-semibold mt-2 text-gray-900 dark:text-gray-100">{t('about.transferService')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {t('about.transferServiceDesc')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to="/services"
              className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md shadow"
            >
              {t('about.viewMoreServices')}
            </Link>
          </div>
        </section>

        {/* Room Amenities */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-4">{t('about.roomAmenities')}</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">📶</div>
              <div>
                <div className="font-medium">{t('about.wifi')}</div>
                <div className="text-sm text-gray-600">{t('about.wifiDesc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">🛁</div>
              <div>
                <div className="font-medium">{t('about.bathtub')}</div>
                <div className="text-sm text-gray-600">{t('about.bathtubDesc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">🏝️</div>
              <div>
                <div className="font-medium">{t('about.balcony')}</div>
                <div className="text-sm text-gray-600">{t('about.balconyDesc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">🥂</div>
              <div>
                <div className="font-medium">{t('about.minibar')}</div>
                <div className="text-sm text-gray-600">{t('about.minibarDesc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">❄️</div>
              <div>
                <div className="font-medium">{t('about.airConditioner')}</div>
                <div className="text-sm text-gray-600">{t('about.airConditionerDesc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">📺</div>
              <div>
                <div className="font-medium">{t('about.smartTV')}</div>
                <div className="text-sm text-gray-600">{t('about.smartTVDesc')}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white p-3 rounded-lg shadow-sm">
              <div className="text-2xl">🛋️</div>
              <div>
                <div className="font-medium">{t('about.sofaLounge')}</div>
                <div className="text-sm text-gray-600">{t('about.sofaLoungeDesc')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Google Map */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-4">{t('about.mapPin')}</h3>

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
              {t('about.openGoogleMaps')}
            </a>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mb-12 bg-indigo-600 text-white rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold">
            {t('about.readyForVacation')}
          </h3>
          <p className="mt-2 text-sm text-white/90">
            {t('about.bookNowPromo')}
          </p>
          <div className="mt-4">
            <Link
              to="/rooms"
              className="inline-block bg-white text-indigo-600 font-semibold py-2 px-6 rounded-md"
            >
              {t('about.exploreNow')}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
