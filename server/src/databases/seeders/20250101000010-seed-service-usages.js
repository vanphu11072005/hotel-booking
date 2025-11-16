'use strict';

/** @type {import('sequelize-cli').Seeder} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // We'll resolve booking ids and service ids at runtime to avoid FK
    // issues regardless of auto-increment / insertion order.
    const usages = [
      // booking_number, service_name, rest of fields
      {
        booking_number: 'BK2025010001',
        service_name: 'Dịch vụ phòng - Bữa sáng',
        quantity: 2,
        unit_price: 150000,
        total_price: 300000,
        usage_date: new Date('2025-01-16T07:30:00'),
        notes: 'Breakfast for 2 days',
        created_at: new Date('2025-01-16'),
        updated_at: new Date('2025-01-16'),
      },
      {
        booking_number: 'BK2025010001',
        service_name: 'Dịch vụ giặt ủi - Thông thường',
        quantity: 3,
        unit_price: 60000,
        total_price: 180000,
        usage_date: new Date('2025-01-17T10:00:00'),
        notes: 'Regular laundry service',
        created_at: new Date('2025-01-17'),
        updated_at: new Date('2025-01-17'),
      },
      {
        booking_number: 'BK2025010002',
        service_name: 'Dịch vụ phòng - Bữa sáng',
        quantity: 1,
        unit_price: 150000,
        total_price: 150000,
        usage_date: new Date('2025-01-29T08:00:00'),
        notes: 'Room service breakfast',
        created_at: new Date('2025-01-29'),
        updated_at: new Date('2025-01-29'),
      },
      {
        booking_number: 'BK2025010002',
        service_name: 'Spa - Massage truyền thống',
        quantity: 1,
        unit_price: 500000,
        total_price: 500000,
        usage_date: new Date('2025-01-29T15:00:00'),
        notes: 'Traditional massage booking',
        created_at: new Date('2025-01-29'),
        updated_at: new Date('2025-01-29'),
      },
      {
        booking_number: 'BK2025010002',
        service_name: 'Trả phòng muộn',
        quantity: 1,
        unit_price: 500000,
        total_price: 500000,
        usage_date: new Date('2025-01-30T12:00:00'),
        notes: 'Late check-out requested',
        created_at: new Date('2025-01-30'),
        updated_at: new Date('2025-01-30'),
      },
      {
        booking_number: 'BK2025010003',
        service_name: 'Đón sân bay',
        quantity: 1,
        unit_price: 400000,
        total_price: 400000,
        usage_date: new Date('2025-01-31'),
        notes: 'Airport pickup pre-booked',
        created_at: new Date('2025-01-22'),
        updated_at: new Date('2025-01-22'),
      },
      {
        booking_number: 'BK2025010005',
        service_name: 'Đón sân bay',
        quantity: 1,
        unit_price: 400000,
        total_price: 400000,
        usage_date: new Date('2025-02-05'),
        notes: 'Airport pickup for anniversary trip',
        created_at: new Date('2025-01-25'),
        updated_at: new Date('2025-01-25'),
      },
      {
        booking_number: 'BK2025010005',
        service_name: 'Spa - Liệu pháp hương thơm',
        quantity: 1,
        unit_price: 700000,
        total_price: 700000,
        usage_date: new Date('2025-02-06T16:00:00'),
        notes: 'Aromatherapy session for couple',
        created_at: new Date('2025-01-25'),
        updated_at: new Date('2025-01-25'),
      },
    ];

    // Resolve bookings and services
    const bookingNumbers = Array.from(new Set(usages.map((u) => u.booking_number)));
    const serviceNames = Array.from(new Set(usages.map((u) => u.service_name)));

    const [bookingsRows] = await queryInterface.sequelize.query(
      `SELECT id, booking_number FROM bookings WHERE booking_number IN (${bookingNumbers
        .map(() => '?')
        .join(',')})`,
      { replacements: bookingNumbers }
    );

    const [servicesRows] = await queryInterface.sequelize.query(
      `SELECT id, name FROM services WHERE name IN (${serviceNames.map(() => '?').join(',')})`,
      { replacements: serviceNames }
    );

    const bookingIdByNumber = {};
    bookingsRows.forEach((r) => {
      bookingIdByNumber[r.booking_number] = r.id;
    });

    const serviceIdByName = {};
    servicesRows.forEach((r) => {
      serviceIdByName[r.name] = r.id;
    });

    const records = usages
      .map((u) => {
        const booking_id = bookingIdByNumber[u.booking_number] || null;
        const service_id = serviceIdByName[u.service_name] || null;
        if (!booking_id || !service_id) return null;
        return {
          booking_id,
          service_id,
          quantity: u.quantity,
          unit_price: u.unit_price,
          total_price: u.total_price,
          usage_date: u.usage_date,
          notes: u.notes,
          created_at: u.created_at,
          updated_at: u.updated_at,
        };
      })
      .filter(Boolean);

    if (records.length > 0) {
      await queryInterface.bulkInsert('service_usages', records);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('service_usages', null, {});
  }
};
