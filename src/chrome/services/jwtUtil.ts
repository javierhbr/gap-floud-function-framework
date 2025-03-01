import jwt, { SignOptions, VerifyOptions, JwtPayload } from 'jsonwebtoken';
import { Service } from 'typedi';

interface TokenPayload {
  [key: string]: string | number | boolean | object;
}

@Service()
export class JwtUtil {
  private readonly jwtSecret: string;
  private readonly defaultSignOptions: SignOptions;
  private readonly defaultVerifyOptions: VerifyOptions;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.defaultSignOptions = {
      expiresIn: '24h',
      algorithm: 'HS256',
    };
    this.defaultVerifyOptions = {
      algorithms: ['HS256'],
    };
  }

  /**
   * Generate a JWT token
   * @param payload - Data to be encoded in the token
   * @param options - Optional signing options
   * @returns Promise<string> - The generated JWT token
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
      if (error instanceof Error) {
        throw new Error(`Error generating JWT token: ${error.message}`);
      }
      throw new Error('Error generating JWT token');
    }
  }

  /**
   * Verify and decode a JWT token
   * @param token - The JWT token to verify
   * @param options - Optional verification options
   * @returns Promise<JwtPayload> - The decoded token payload
   */
  async verifyToken(
    token: string,
    options?: VerifyOptions
  ): Promise<JwtPayload> {
    try {
      const verifyOptions = {
        ...this.defaultVerifyOptions,
        ...options,
      };

      return jwt.verify(token, this.jwtSecret, verifyOptions) as JwtPayload;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error generating JWT token: ${error.message}`);
      }
      throw new Error('Error generating JWT token');
    }
  }

  /**
   * Decode a JWT token without verifying
   * @param token - The JWT token to decode
   * @returns JwtPayload | null - The decoded token payload or null if invalid
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  /**
   * Refresh a JWT token
   * @param token - The existing JWT token
   * @param options - Optional signing options for the new token
   * @returns Promise<string> - A new JWT token
   */
  async refreshToken(token: string, options?: SignOptions): Promise<string> {
    try {
      const decoded = await this.verifyToken(token);
      const { exp: _exp, iat: _iat, ...payload } = decoded;

      return this.generateToken(payload as TokenPayload, options);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new Error(`Error generating JWT token: ${error.message}`);
      }
      throw new Error('Error generating JWT token');
    }
  }

  /**
   * Check if a token is expired
   * @param token - The JWT token to check
   * @returns boolean - True if the token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) return true;

      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }
}
