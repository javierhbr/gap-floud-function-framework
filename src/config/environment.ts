import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

export class EnvLoader {
  private static instance: EnvLoader;
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): EnvLoader {
    if (!EnvLoader.instance) {
      EnvLoader.instance = new EnvLoader();
    }
    return EnvLoader.instance;
  }

  public loadEnv(): void {
    if (this.isLoaded) {
      return;
    }

    // Try loading from different possible locations
    const envPaths = [
      path.resolve(process.cwd(), '.env'),
      path.resolve(process.cwd(), '../.env'),
      path.resolve(__dirname, '../.env'),
    ];

    for (const envPath of envPaths) {
      if (fs.existsSync(envPath)) {
        dotenv.config({ path: envPath });
        console.log(`Loaded environment from: ${envPath}`);
        break;
      }
    }

    // Fall back to environment variables if no .env file is found
    if (!process.env.GUEST_API_KEY || !process.env.LOGIN_API_KEY) {
      console.warn('No .env file found, using process.env values');
    }

    this.isLoaded = true;
  }
}

// Initialize environment
EnvLoader.getInstance().loadEnv();

export const config = {
  apiKeys: {
    GUEST: process.env.GUEST_API_KEY || '',
    LOGIN: process.env.LOGIN_API_KEY || '',
  },
};

// Validate required environment variables
const validateConfig = () => {
  const requiredVars = ['GUEST_API_KEY', 'LOGIN_API_KEY'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}`
      );
    } else {
      console.warn(
        `Warning: Missing environment variables: ${missingVars.join(', ')}`
      );
      // Set default development values
      process.env.GUEST_API_KEY = process.env.GUEST_API_KEY || 'dev-guest-key';
      process.env.LOGIN_API_KEY = process.env.LOGIN_API_KEY || 'dev-login-key';
    }
  }
};

validateConfig();
