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
    payload: TokenPayload,
    sensitiveData: string | object,
    options?: SignOptions
  ): Promise<string> {
    try {
      console.log(`jwtSecret ${this.jwtSecret}`);
      const dataToEncrypt =
        typeof sensitiveData === 'string'
          ? sensitiveData
          : JSON.stringify(sensitiveData);

      const encryptedData = this.encryptData(dataToEncrypt);
      const payloadWithEncrypted = {
        ...payload,
        encrypted: encryptedData,
      };

      return this.generateToken(payloadWithEncrypted, options);
    } catch (error: unknown) {
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
  ): Promise<{ decoded: T; decrypted?: string }> {
    const decoded = await this.verifyToken<T>(token, options);

    const payload = decoded as any;
    if (payload.encrypted) {
      try {
        const decrypted = this.decryptData(payload.encrypted as EncryptedData);
        return { decoded, decrypted };
      } catch (error) {
        throw new JwtError(
          'Failed to decrypt token data',
          error instanceof Error ? error : undefined
        );
      }
    }

    return { decoded };
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

  encryptData(plaintext: string): EncryptedData {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        this.encryptionKey,
        iv
      );

      console.log('Encryption inputs:', {
        key: this.encryptionKey.toString('hex'),
        iv: iv.toString('hex'),
        plaintext,
      });

      let encrypted = cipher.update(plaintext);
      encrypted = Buffer.concat([encrypted, cipher.final()]);

      const encryptedObject = {
        iv: iv.toString('hex'),
        encryptedData: encrypted.toString('hex'),
      };

      console.log('Encryption output:', encryptedObject);

      return encryptedObject;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new JwtError(
        'Failed to encrypt data',
        error instanceof Error ? error : undefined
      );
    }
  }

  decryptData(encrypted: EncryptedData): string {
    try {
      console.log('Decrypting with:', {
        iv: encrypted.iv,
        encryptedData: encrypted.encryptedData,
      });

      const ivBuffer = Buffer.from(encrypted.iv, 'hex');
      const encryptedBuffer = Buffer.from(encrypted.encryptedData, 'hex');
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        this.encryptionKey,
        ivBuffer
      );

      console.log('Decryption inputs:', {
        key: this.encryptionKey.toString('hex'),
        iv: ivBuffer.toString('hex'),
        encryptedBuffer: encryptedBuffer.toString('hex'),
      });

      let decrypted = decipher.update(encryptedBuffer);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return decrypted.toString();
    } catch (error) {
      console.error('Decryption error:', { error, encrypted });
      throw new JwtError(
        'Failed to decrypt token data',
        error instanceof Error ? error : undefined
      );
    }
  }
}
