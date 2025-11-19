const serviceService = require('../services/serviceService');

/**
 * Get all services with filters and pagination
 * GET /api/services
 */
const getServices = async (req, res, next) => {
  try {
    const result = await serviceService.getServices(req.query);

    res.status(200).json({
      status: 'success',
      data: result,
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
    const service = await serviceService.getServiceById(id);

    res.status(200).json({
      status: 'success',
      data: { service },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Create new service
 * POST /api/services
 */
const createService = async (req, res, next) => {
  try {
    const service = await serviceService.createService(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Service created successfully',
      data: { service },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
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
    const service = await serviceService.updateService(id, req.body);

    res.status(200).json({
      status: 'success',
      message: 'Service updated successfully',
      data: { service },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
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
    await serviceService.deleteService(id);

    res.status(200).json({
      status: 'success',
      message: 'Service deleted successfully',
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Add service to booking
 * POST /api/services/use
 */
const useService = async (req, res, next) => {
  try {
    const bookingService = await serviceService.useService(req.body);

    res.status(201).json({
      status: 'success',
      message: 'Service added to booking successfully',
      data: { bookingService },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
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
