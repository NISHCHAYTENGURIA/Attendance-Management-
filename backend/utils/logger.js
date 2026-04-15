/**
 * Simple Logger Utility
 * Optimized for production use with Azure Cosmos DB
 */

const fs = require("fs");
const path = require("path");

class Logger {
  constructor(logDir = "logs") {
    this.logDir = logDir;
    this.ensureLogDir();
    this.isDev = process.env.NODE_ENV !== "production";
  }

  ensureLogDir() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  getTimestamp() {
    return new Date().toISOString();
  }

  formatMessage(level, message) {
    return `[${this.getTimestamp()}] [${level}] ${message}`;
  }

  writeLog(level, message) {
    const formattedMessage = this.formatMessage(level, message);

    // Console output for development
    if (this.isDev) {
      const colors = {
        INFO: "\x1b[36m", // Cyan
        WARN: "\x1b[33m", // Yellow
        ERROR: "\x1b[31m", // Red
        DEBUG: "\x1b[35m", // Magenta
        RESET: "\x1b[0m",
      };

      console.log(
        `${colors[level] || ""}${formattedMessage}${colors.RESET}`
      );
    }

    // File output
    try {
      const logFile = path.join(
        this.logDir,
        `${level.toLowerCase()}-${this.getDateString()}.log`
      );
      fs.appendFileSync(logFile, formattedMessage + "\n");
    } catch (err) {
      console.error("Failed to write log file:", err.message);
    }
  }

  getDateString() {
    const date = new Date();
    return date.toISOString().split("T")[0];
  }

  info(message) {
    this.writeLog("INFO", message);
  }

  warn(message) {
    this.writeLog("WARN", message);
  }

  error(message) {
    this.writeLog("ERROR", message);
  }

  debug(message) {
    if (this.isDev) {
      this.writeLog("DEBUG", message);
    }
  }
}

module.exports = new Logger();
