const reportRepository = require('../repositories/reportRepository');
const { Op } = require('sequelize');

/**
 * Report Service - Business logic layer
 * Xử lý logic nghiệp vụ liên quan đến reports
 */
class ReportService {
  /**
   * Build date filter from query params
   */
  buildDateFilter(startDate, endDate, fieldName = 'created_at') {
    const dateFilter = {};

    if (startDate || endDate) {
      dateFilter[fieldName] = {};
      if (startDate) {
        dateFilter[fieldName][Op.gte] = new Date(startDate);
      }
      if (endDate) {
        dateFilter[fieldName][Op.lte] = new Date(endDate);
      }
    }

    return dateFilter;
  }

  /**
   * Get date format string based on groupBy parameter
   */
  getDateFormat(groupBy) {
    switch (groupBy) {
      case 'month':
        return '%Y-%m';
      case 'week':
        return '%Y-%u';
      default:
        return '%Y-%m-%d';
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(filters) {
    const { startDate, endDate } = filters;
    const dateFilter = this.buildDateFilter(startDate, endDate);

    // Get all stats in parallel
    const [
      totalRevenue,
      totalBookings,
      availableRooms,
      totalCustomers,
      revenueByDate,
      bookingsByStatus,
      topRooms,
      serviceUsage,
    ] = await Promise.all([
      reportRepository.getTotalRevenue(dateFilter),
      reportRepository.getTotalBookings(dateFilter),
      reportRepository.getAvailableRoomsCount(),
      reportRepository.getTotalCustomersCount(),
      reportRepository.getRevenueByDate(dateFilter),
      reportRepository.getBookingsByStatus(dateFilter),
      reportRepository.getTopRooms(dateFilter, 5),
      reportRepository.getServiceUsage(5),
    ]);

    return {
      summary: {
        total_revenue: totalRevenue || 0,
        total_bookings: totalBookings,
        available_rooms: availableRooms,
        total_customers: totalCustomers,
      },
      revenue_by_date: revenueByDate,
      bookings_by_status: bookingsByStatus,
      top_rooms: topRooms,
      service_usage: serviceUsage,
    };
  }

  /**
   * Generate revenue report
   */
  async generateRevenueReport(dateFilter, groupBy) {
    const dateFormat = this.getDateFormat(groupBy);
    const revenue = await reportRepository.getRevenueReport(
      dateFilter,
      dateFormat
    );
    return { revenue };
  }

  /**
   * Generate bookings report
   */
  async generateBookingsReport(dateFilter, groupBy) {
    const dateFormat = this.getDateFormat(groupBy);
    const bookings = await reportRepository.getBookingsReport(
      dateFilter,
      dateFormat
    );
    return { bookings };
  }

  /**
   * Generate rooms report
   */
  async generateRoomsReport() {
    const rooms = await reportRepository.getRoomsStats();
    return { rooms };
  }

  /**
   * Generate customers report
   */
  async generateCustomersReport() {
    const customers = await reportRepository.getCustomersStats(50);
    return { customers };
  }

  /**
   * Get detailed reports based on type
   */
  async getReports(filters) {
    const { type = 'revenue', startDate, endDate, from, to, groupBy = 'day' } = filters;

    const start = startDate || from;
    const end = endDate || to;
    const dateFilter = this.buildDateFilter(start, end);

    let reportData;

    switch (type) {
      case 'revenue':
        reportData = await this.generateRevenueReport(dateFilter, groupBy);
        break;
      case 'bookings':
        reportData = await this.generateBookingsReport(dateFilter, groupBy);
        break;
      case 'rooms':
        reportData = await this.generateRoomsReport();
        break;
      case 'customers':
        reportData = await this.generateCustomersReport();
        break;
      default:
        throw {
          statusCode: 400,
          message: 'Invalid report type',
        };
    }

    return reportData;
  }

  /**
   * Generate CSV content for revenue export
   */
  generateRevenueCSV(payments) {
    let csvContent = 'Date,Booking Number,Customer,Payment Method,Amount\n';
    
    payments.forEach((payment) => {
      csvContent += `${payment.payment_date},${payment.booking.booking_number},${payment.booking.user.full_name},${payment.payment_method},${payment.amount}\n`;
    });

    return csvContent;
  }

  /**
   * Generate CSV content for bookings export
   */
  generateBookingsCSV(bookings) {
    let csvContent = 'Booking Number,Customer,Room,Check In,Check Out,Status,Total Price\n';
    
    bookings.forEach((booking) => {
      csvContent += `${booking.booking_number},${booking.user.full_name},${booking.room.room_number},${booking.check_in_date},${booking.check_out_date},${booking.status},${booking.total_price}\n`;
    });

    return csvContent;
  }

  /**
   * Export report to CSV
   */
  async exportReport(filters) {
    const { type = 'revenue', startDate, endDate } = filters;

    const dateFilter = this.buildDateFilter(startDate, endDate, 'payment_date');

    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'revenue':
        const payments = await reportRepository.getPaymentsForExport(
          dateFilter
        );
        csvContent = this.generateRevenueCSV(payments);
        filename = `revenue_report_${Date.now()}.csv`;
        break;

      case 'bookings':
        const bookingsDateFilter = this.buildDateFilter(
          startDate,
          endDate,
          'created_at'
        );
        const bookings = await reportRepository.getBookingsForExport(
          bookingsDateFilter
        );
        csvContent = this.generateBookingsCSV(bookings);
        filename = `bookings_report_${Date.now()}.csv`;
        break;

      default:
        throw {
          statusCode: 400,
          message: 'Invalid export type',
        };
    }

    return { csvContent, filename };
  }
}

// Export singleton instance
module.exports = new ReportService();
