const { Service, BookingService, Booking, sequelize } = require('../databases/models');
const { Op } = require('sequelize');

/**
 * Get all services with filters and pagination
 * GET /api/services
 */
const getServices = async (req, res, next) => {
  try {
    const {
      search,
      status,
      page = 1,
      limit = 10,
    } = req.query;

    const whereClause = {};

    // Filter by search (name or description)
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: services } = await Service.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['created_at', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      data: {
        services,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get service by ID
 * GET /api/services/:id
 */
const getServiceById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        service,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create new service
 * POST /api/services
 */
const createService = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      unit,
      status = 'active',
    } = req.body;

    // Check if service name already exists
    const existingService = await Service.findOne({ where: { name } });
    if (existingService) {
      return res.status(400).json({
        status: 'error',
        message: 'Service name already exists',
      });
    }

    const service = await Service.create({
      name,
      description,
      price,
      unit,
      status,
    });

    res.status(201).json({
      status: 'success',
      message: 'Service created successfully',
      data: {
        service,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update service
 * PUT /api/services/:id
 */
const updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      unit,
      status,
    } = req.body;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found',
      });
    }

    // Check if new name already exists (excluding current service)
    if (name && name !== service.name) {
      const existingService = await Service.findOne({
        where: {
          name,
          id: { [Op.ne]: id },
        },
      });
      if (existingService) {
        return res.status(400).json({
          status: 'error',
          message: 'Service name already exists',
        });
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (unit !== undefined) updateData.unit = unit;
    if (status !== undefined) updateData.status = status;

    await service.update(updateData);

    res.status(200).json({
      status: 'success',
      message: 'Service updated successfully',
      data: {
        service,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete service
 * DELETE /api/services/:id
 */
const deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found',
      });
    }

    // Check if service is used in any active bookings
    const activeUsage = await BookingService.count({
      where: { service_id: id },
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

    if (activeUsage > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete service that is used in active bookings',
      });
    }

    await service.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Service deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add service to booking
 * POST /api/services/use
 */
const useService = async (req, res, next) => {
  try {
    const {
      booking_id,
      service_id,
      quantity = 1,
    } = req.body;

    // Check if booking exists
    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({
        status: 'error',
        message: 'Booking not found',
      });
    }

    // Check if service exists
    const service = await Service.findByPk(service_id);
    if (!service || service.status !== 'active') {
      return res.status(404).json({
        status: 'error',
        message: 'Service not found or inactive',
      });
    }

    // Calculate total price
    const total_price = service.price * quantity;

    // Add service to booking
    const bookingService = await BookingService.create({
      booking_id,
      service_id,
      quantity,
      price: service.price,
      total_price,
    });

    res.status(201).json({
      status: 'success',
      message: 'Service added to booking successfully',
      data: {
        bookingService,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  useService,
};
