const app = require('./app');
const db = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Test database connection
const testDatabaseConnection = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Sync models in development (optional)
    if (NODE_ENV === 'development') {
      // await db.sequelize.sync({ alter: true });
      // console.log('✅ Database models synchronized');
    }
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    // Test database connection first
    await testDatabaseConnection();

    // Start listening
    const server = app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📝 Environment: ${NODE_ENV}`);
      console.log(`🌐 API URL: http://localhost:${PORT}`);
      console.log(`💚 Health: http://localhost:${PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(
        `\n${signal} received. Shutting down gracefully...`
      );
      
      server.close(async () => {
        console.log('🔴 HTTP server closed');
        
        try {
          await db.sequelize.close();
          console.log('🔴 Database connection closed');
          process.exit(0);
        } catch (error) {
          console.error(
            '❌ Error closing database connection:',
            error
          );
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error(
          '⚠️  Forced shutdown after timeout'
        );
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('❌ Unhandled Rejection at:', promise);
      console.error('Reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
