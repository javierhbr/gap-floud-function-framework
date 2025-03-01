import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import { Service } from 'typedi';
import crypto from 'crypto';

interface TokenPayload {
  [key: string]: string | number | boolean | object;
}

interface EncryptedData {
  iv: string;
  encryptedData: string;
}

interface JwtUtilConfig {
  secret?: string;
  signOptions?: SignOptions;
  verifyOptions?: VerifyOptions;
}

class JwtError extends Error {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'JwtError';
  }
}

@Service()
export class JwtUtil {
  private readonly jwtSecret: string;
  private readonly encryptionKey: Buffer;
  private readonly defaultSignOptions: SignOptions;
  private readonly defaultVerifyOptions: VerifyOptions;

  constructor(config?: JwtUtilConfig) {
    // Initialize with provided config or defaults
    this.jwtSecret =
      config?.secret ?? process.env.JWT_SECRET ?? 'your-secret-key';
    this.encryptionKey = crypto.scryptSync(this.jwtSecret, 'salt', 32);

    this.defaultSignOptions = {
      expiresIn: '24h',
      algorithm: 'HS256',
      ...config?.signOptions,
    };

    this.defaultVerifyOptions = {
      algorithms: ['HS256'],
      ...config?.verifyOptions,
    };
  }

  /**
   * Generate a cryptographically secure random secret
   */
  static generateSecret(length: number = 64): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate a JWT token
   */
  async generateToken(
    payload: TokenPayload,
    options?: SignOptions
  ): Promise<string> {
    try {
      const signOptions = {
        ...this.defaultSignOptions,
        ...options,
      };

      return jwt.sign(payload, this.jwtSecret, signOptions);
    } catch (error: unknown) {
      throw new JwtError(
        'Failed to generate token',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Generate a token with encrypted sensitive data
   */
  async generateTokenWithEncryption(
    payload: object,
    sensitiveData: object,
    options?: SignOptions
  ): Promise<string> {
    try {
      const encryptedData = this.encryptData(sensitiveData); // Encrypt the sensitive object
      const payloadWithEncrypted = {
        ...payload,
        encrypted: encryptedData, // Add the encrypted object to the payload
      };

      return this.generateToken(payloadWithEncrypted, options); // Generate JWT with the new payload
    } catch (error) {
      throw new JwtError(
        'Failed to generate encrypted token',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Verify and decode a JWT token
   */
  async verifyToken<T extends object = JwtPayload>(
    token: string,
    options?: VerifyOptions
  ): Promise<T> {
    try {
      const verifyOptions = {
        ...this.defaultVerifyOptions,
        ...options,
      };

      return jwt.verify(token, this.jwtSecret, verifyOptions) as T;
    } catch (error: unknown) {
      throw new JwtError(
        'Token verification failed',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Verify token and decrypt sensitive data if present
   */
  async verifyAndDecryptToken<T extends object = JwtPayload>(
    token: string,
    options?: VerifyOptions
  ): Promise<{ decoded: T; decrypted?: object }> {
    const decoded = await this.verifyToken<T>(token, options);

    const payload = decoded as any;
    if (payload.encrypted) {
      try {
        const decrypted = this.decryptData(payload.encrypted as EncryptedData);
        return { decoded, decrypted }; // Return both the decoded payload and decrypted object
      } catch (error) {
        throw new JwtError(
          'Failed to decrypt token data',
          error instanceof Error ? error : undefined
        );
      }
    }

    return { decoded }; // Return only the decoded payload if no `encrypted` is present
  }

  /**
   * Decode a JWT token without verification
   */
  decodeToken<T extends object = JwtPayload>(token: string): T | null {
    try {
      return jwt.decode(token) as T;
    } catch {
      return null;
    }
  }

  /**
   * Refresh a JWT token
   */
  async refreshToken(token: string, options?: SignOptions): Promise<string> {
    try {
      const decoded = await this.verifyToken(token);
      const { exp: _exp, iat: _iat, ...payload } = decoded;
      return this.generateToken(payload as TokenPayload, options);
    } catch (error: unknown) {
      throw new JwtError(
        'Failed to refresh token',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Check if a token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !(decoded as JwtPayload).exp) return true;

      return Date.now() >= ((decoded as JwtPayload).exp as number) * 1000;
    } catch {
      return true;
    }
  }

  encryptData(data: object): EncryptedData {
    try {
      const iv = crypto.randomBytes(16); // Generate a random Initialization Vector (IV)
      const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        this.encryptionKey,
        iv
      );

      console.log('Encrypting Object:', data); // Debug log

      // Convert the object to JSON string before encryption
      const serializedData = JSON.stringify(data);

      // Use buffers for encryption
      const encryptedData = Buffer.concat([
        cipher.update(serializedData, 'utf8'),
        cipher.final(),
      ]);

      const encryptedObject: EncryptedData = {
        iv: iv.toString('hex'), // Convert `iv` to hex string format
        encryptedData: encryptedData.toString('hex'), // Convert encrypted data to hex string
      };

      console.log('Encryption Result:', encryptedObject); // Debug log

      return encryptedObject;
    } catch (error) {
      console.error('Encryption error:', error); // Log for debugging
      throw new JwtError(
        'Failed to encrypt sensitive data',
        error instanceof Error ? error : undefined
      );
    }
  }

  decryptData(encrypted: EncryptedData): object {
    try {
      console.log('Decrypting Object:', encrypted); // Debug log

      const ivBuffer = Buffer.from(encrypted.iv, 'hex'); // Convert IV from hex string to buffer
      const encryptedBuffer = Buffer.from(encrypted.encryptedData, 'hex'); // Convert encrypted data from hex string to buffer

      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        this.encryptionKey,
        ivBuffer
      );

      // Use Buffer.concat to handle decryption output
      const decryptedData = Buffer.concat([
        decipher.update(encryptedBuffer),
        decipher.final(),
      ]);

      console.log('Decryption Raw Result:', decryptedData.toString('utf8')); // Debug log

      // Parse the decrypted data back into an object
      const parsedData = JSON.parse(decryptedData.toString('utf8'));

      console.log('Decryption Parsed Result:', parsedData); // Debug log

      return parsedData;
    } catch (error) {
      console.error('Decryption error:', { error, encrypted }); // Log for debugging
      throw new JwtError(
        'Failed to decrypt token data',
        error instanceof Error ? error : undefined
      );
    }
  }
}
