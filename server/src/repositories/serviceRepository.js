const { Service, ServiceUsage, Booking } = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Service Repository - Data access layer
 * Xử lý tất cả các truy vấn database liên quan đến service
 */
class ServiceRepository {
  /**
   * Find all services with filters
   */
  async findAllServices(whereClause, limit, offset) {
    const { count, rows } = await Service.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['created_at', 'DESC']],
    });

    return { services: rows, count };
  }

  /**
   * Find service by ID
   */
  async findServiceById(id) {
    return await Service.findByPk(id);
  }

  /**
   * Find service by name
   */
  async findServiceByName(name) {
    return await Service.findOne({ where: { name } });
  }

  /**
   * Find service by name excluding specific ID
   */
  async findServiceByNameExcludingId(name, excludeId) {
    return await Service.findOne({
      where: {
        name,
        id: { [Op.ne]: excludeId },
      },
    });
  }

  /**
   * Create a new service
   */
  async createService(serviceData) {
    return await Service.create(serviceData);
  }

  /**
   * Update a service
   */
  async updateService(service, updateData) {
    return await service.update(updateData);
  }

  /**
   * Delete a service
   */
  async deleteService(service) {
    return await service.destroy();
  }

  /**
   * Find booking by ID
   */
  async findBookingById(bookingId) {
    return await Booking.findByPk(bookingId);
  }

  /**
   * Create service usage record
   */
  async createServiceUsage(usageData) {
    return await ServiceUsage.create(usageData);
  }

  /**
   * Count active service usage
   */
  async countActiveServiceUsage(serviceId) {
    return await ServiceUsage.count({
      where: { service_id: serviceId },
      include: [
        {
          model: Booking,
          as: 'booking',
          where: {
            status: { [Op.in]: ['pending', 'confirmed', 'checked_in'] },
          },
        },
      ],
    });
  }

  /**
   * Build where clause for service filters
   */
  buildWhereClause(filters) {
    const { search, status, category } = filters;
    const whereClause = {};

    // Filter by search (name or description)
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by status (is_active)
    if (status) {
      whereClause.is_active = status === 'active' ? true : false;
    }

    // Filter by category
    if (category) {
      whereClause.category = category;
    }

    return whereClause;
  }
}

// Export singleton instance
module.exports = new ServiceRepository();
