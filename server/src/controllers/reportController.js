const reportService = require('../services/reportService');

/**
 * Get dashboard statistics
 * GET /api/reports/dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const result = await reportService.getDashboardStats(req.query);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed reports
 * GET /api/reports
 */
const getReports = async (req, res, next) => {
  try {
    const reportData = await reportService.getReports(req.query);

    res.status(200).json({
      status: 'success',
      data: reportData,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: 'error',
        message: error.message,
      });
    }
    console.error('Error in getReports:', error);
    next(error);
  }
};

/**
 * Export report to CSV
 * GET /api/reports/export
 */
const exportReport = async (req, res, next) => {
  try {
    const { csvContent, filename } = await reportService.exportReport(
      req.query
    );

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csvContent);
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
  getDashboardStats,
  getReports,
  exportReport,
};
