const serviceRepository = require('../repositories/serviceRepository');

/**
 * Service Service - Business logic layer
 * Xử lý logic nghiệp vụ liên quan đến service
 */
class ServiceService {
  /**
   * Get all services with filters and pagination
   */
  async getServices(filters) {
    const { page = 1, limit = 10 } = filters;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = serviceRepository.buildWhereClause(filters);

    const { services, count } = await serviceRepository.findAllServices(
      whereClause,
      parseInt(limit),
      offset
    );

    return {
      services,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    };
  }

  /**
   * Get service by ID
   */
  async getServiceById(id) {
    const service = await serviceRepository.findServiceById(id);

    if (!service) {
      throw { statusCode: 404, message: 'Service not found' };
    }

    return service;
  }

  /**
   * Validate service data
   */
  validateServiceData(price) {
    if (price !== undefined && (isNaN(price) || price < 0)) {
      throw {
        statusCode: 400,
        message: 'Price must be a positive number',
      };
    }
  }

  /**
   * Create new service
   */
  async createService(serviceData) {
    const { name, description, price, category, status = 'active' } = serviceData;

    // Validate price
    this.validateServiceData(price);

    // Check if service name already exists
    const existingService = await serviceRepository.findServiceByName(name);
    if (existingService) {
      throw {
        statusCode: 400,
        message: 'Service name already exists',
      };
    }

    const service = await serviceRepository.createService({
      name,
      description,
      price,
      category,
      is_active: status === 'active' ? true : false,
    });

    return service;
  }

  /**
   * Update service
   */
  async updateService(id, updateData) {
    const { name, description, price, unit, status, category } = updateData;

    // Validate price
    this.validateServiceData(price);

    const service = await serviceRepository.findServiceById(id);
    if (!service) {
      throw { statusCode: 404, message: 'Service not found' };
    }

    // Check if new name already exists (excluding current service)
    if (name && name !== service.name) {
      const existingService = 
        await serviceRepository.findServiceByNameExcludingId(name, id);

      if (existingService) {
        throw {
          statusCode: 400,
          message: 'Service name already exists',
        };
      }
    }

    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (price !== undefined) updatePayload.price = price;
    if (unit !== undefined) updatePayload.unit = unit;
    if (category !== undefined) updatePayload.category = category;
    if (status !== undefined) 
      updatePayload.is_active = status === 'active' ? true : false;

    const updatedService = await serviceRepository.updateService(
      service,
      updatePayload
    );

    return updatedService;
  }

  /**
   * Delete service
   */
  async deleteService(id) {
    const service = await serviceRepository.findServiceById(id);
    if (!service) {
      throw { statusCode: 404, message: 'Service not found' };
    }

    // Check if service is used in any active bookings
    const activeUsage = await serviceRepository.countActiveServiceUsage(id);

    if (activeUsage > 0) {
      throw {
        statusCode: 400,
        message: 'Cannot delete service that is used in active bookings',
      };
    }

    await serviceRepository.deleteService(service);
  }

  /**
   * Add service to booking
   */
  async useService(usageData) {
    const { booking_id, service_id, quantity = 1 } = usageData;

    // Validate quantity
    if (!quantity || quantity < 1) {
      throw {
        statusCode: 400,
        message: 'Quantity must be at least 1',
      };
    }

    // Check if booking exists
    const booking = await serviceRepository.findBookingById(booking_id);
    if (!booking) {
      throw {
        statusCode: 404,
        message: 'Booking not found',
      };
    }

    // Check if service exists
    const service = await serviceRepository.findServiceById(service_id);
    if (!service || !service.is_active) {
      throw {
        statusCode: 404,
        message: 'Service not found or inactive',
      };
    }

    // Calculate total price
    const total_price = service.price * quantity;

    // Add service to booking
    const bookingService = await serviceRepository.createServiceUsage({
      booking_id,
      service_id,
      quantity,
      unit_price: service.price,
      total_price,
    });

    return bookingService;
  }
}

// Export singleton instance
module.exports = new ServiceService();
