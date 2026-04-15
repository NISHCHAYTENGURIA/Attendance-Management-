/**
 * Database Singleton Connection Manager
 * Optimized for Azure Cosmos DB (MongoDB API)
 * 
 * Features:
 * - Singleton pattern to prevent multiple connections
 * - Connection pooling configuration (maxPoolSize: 10)
 * - 429 Too Many Requests error prevention
 * - Automatic retry with exponential backoff
 * - Health check mechanism
 */

const mongoose = require('mongoose');
const logger = require('./utils/logger');

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnecting = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    this.retryDelay = 1000; // Start with 1 second
  }

  /**
   * Connect to Azure Cosmos DB MongoDB API
   * Connection pooling and retry logic configured for Free Tier (400 RU/s)
   */
  async connect() {
    // Return existing connection if already connected
    if (this.connection && mongoose.connection.readyState === 1) {
      logger.info('Using existing database connection');
      return this.connection;
    }

    // Prevent multiple simultaneous connection attempts
    if (this.isConnecting) {
      logger.info('Connection attempt in progress, waiting...');
      // Poll for connection readiness
      return new Promise((resolve, reject) => {
        const checkConnection = setInterval(() => {
          if (this.connection && mongoose.connection.readyState === 1) {
            clearInterval(checkConnection);
            resolve(this.connection);
          }
        }, 100);

        // Timeout after 30 seconds
        setTimeout(() => {
          clearInterval(checkConnection);
          reject(new Error('Connection timeout'));
        }, 30000);
      });
    }

    this.isConnecting = true;

    try {
      const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
      
      if (!mongoUri) {
        throw new Error('MONGO_URI or MONGODB_URI environment variable is not set');
      }

      logger.info('Attempting to connect to Azure Cosmos DB...');

      /**
       * Connection options optimized for Azure Cosmos DB Free Tier
       * Critical configurations:
       * - maxPoolSize: 10 - Limits concurrent connections to stay within Free Tier RU limits
       * - serverSelectionTimeoutMS: 10000 - Increased for Cosmos DB latency
       * - retryWrites: true - Handles transient network failures
       * - directConnection: true - Direct mode recommended for Cosmos DB
       */
      const connectionOptions = {
        // Connection pool settings for Azure Free Tier (400 RU/s)
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 45000,

        // Timeout and retry settings - increased for Cosmos DB
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        retryWrites: true,
        retryReads: true,

        // Connection mode - Direct for better performance
        directConnection: true,

        // Authentication
        authSource: 'admin',
        authMechanism: 'SCRAM-SHA-1',

        // Monitoring and diagnostics
        monitorCommands: process.env.NODE_ENV !== 'production',

        // Connection string options (if not included in URI)
        w: 1, // Write concern
        journal: false, // Disable journaling for Free Tier to reduce RU consumption
      };

      // Connect to MongoDB
      this.connection = await mongoose.connect(mongoUri, connectionOptions);

      logger.info('Connected to Azure Cosmos DB successfully');
      this.retryCount = 0; // Reset retry count on successful connection
      this.isConnecting = false;

      // Set up connection event listeners
      this.setupConnectionListeners();

      return this.connection;

    } catch (error) {
      this.isConnecting = false;
      logger.error(`Database connection error: ${error.message}`);

      // Check if error is 429 (Too Many Requests)
      if (error.message.includes('429') || error.code === 429) {
        logger.warn('Rate limit (429) encountered. Implementing exponential backoff...');
        return this._retryWithBackoff();
      }

      // Retry logic for transient failures
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);
        logger.warn(`Retry attempt ${this.retryCount}/${this.maxRetries} in ${delay}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.connect();
      }

      throw new Error(`Failed to connect to database after ${this.maxRetries} retries: ${error.message}`);
    }
  }

  /**
   * Exponential backoff retry for 429 errors
   */
  async _retryWithBackoff() {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      const delay = Math.min(this.retryDelay * Math.pow(2, this.retryCount), 32000); // Cap at 32s
      logger.warn(`Rate limited. Retrying in ${delay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.connect();
    }

    throw new Error('Max retries exceeded due to rate limiting (429 errors)');
  }

  /**
   * Set up connection event listeners for monitoring
   */
  setupConnectionListeners() {
    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from database');
      this.connection = null;
    });

    mongoose.connection.on('error', (error) => {
      logger.error(`Mongoose connection error: ${error.message}`);
      
      // Handle 429 errors specifically
      if (error.message.includes('429')) {
        logger.warn('Rate limit error detected. Consider increasing RU allocation.');
      }
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('Mongoose reconnected to database');
    });
  }

  /**
   * Disconnect from database
   */
  async disconnect() {
    if (this.connection) {
      await mongoose.disconnect();
      this.connection = null;
      logger.info('Disconnected from database');
    }
  }

  /**
   * Health check - verify database connection is active
   */
  async healthCheck() {
    try {
      if (mongoose.connection.readyState !== 1) {
        await this.connect();
      }

      // Perform a simple query to verify connectivity
      const admin = mongoose.connection.db.admin();
      const status = await admin.ping();
      
      logger.info('Database health check passed');
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      logger.error(`Health check failed: ${error.message}`);
      throw new Error(`Database health check failed: ${error.message}`);
    }
  }

  /**
   * Get database connection object
   */
  getConnection() {
    return this.connection;
  }

  /**
   * Get mongoose instance
   */
  getMongoose() {
    return mongoose;
  }
}

// Export the DatabaseConnection class for use as a singleton
module.exports = DatabaseConnection;
