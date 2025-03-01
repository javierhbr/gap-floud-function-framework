import { JwtUtil } from './jwtUtil';
import jwt from 'jsonwebtoken';

describe('JwtUtil', () => {
  let jwtUtil: JwtUtil;
  const testSecret = 'test-secret';
  const testPayload = { userId: '123', role: 'user' };
  const testSensitiveData = { secretInfo: 'sensitive-data' };

  beforeEach(() => {
    jwtUtil = new JwtUtil({ secret: testSecret });
  });

  describe('generateSecret', () => {
    it('should generate a random secret of specified length', () => {
      const length = 32;
      const secret = JwtUtil.generateSecret(length);
      expect(secret).toHaveLength(length * 2); // hex string is twice the byte length
    });

    it('should generate different secrets on each call', () => {
      const secret1 = JwtUtil.generateSecret();
      const secret2 = JwtUtil.generateSecret();
      expect(secret1).not.toBe(secret2);
    });
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const token = await jwtUtil.generateToken(testPayload);
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, testSecret);
      expect(decoded).toMatchObject(testPayload);
    });

    it('should apply custom sign options', async () => {
      const customExpiresIn = '1h';
      const token = await jwtUtil.generateToken(testPayload, {
        expiresIn: customExpiresIn,
      });
      const decoded = jwt.decode(token) as jwt.JwtPayload;

      // Check if expiration is roughly 1 hour from now
      const expectedExp = Math.floor(Date.now() / 1000) + 3600;
      expect(decoded.exp).toBeCloseTo(expectedExp, -2); // Allow 2 seconds difference
    });

    it('should throw JwtError on invalid payload', async () => {
      // Create a payload with circular reference which cannot be serialized
      const invalidPayload: any = {};
      invalidPayload.circular = invalidPayload;

      await expect(jwtUtil.generateToken(invalidPayload)).rejects.toThrow(
        'Failed to generate token'
      );
    });
  });

  describe('generateTokenWithEncryption', () => {
    it('should generate token with encrypted string data', async () => {
      const sensitiveString = { test: 'sensitive-string-data' };
      const token = await jwtUtil.generateTokenWithEncryption(
        testPayload,
        sensitiveString
      );
      console.log(`token: ${token}`);
      const decoded = jwt.decode(token) as any;
      expect(decoded.encrypted).toBeDefined();
      expect(decoded.encrypted.iv).toBeDefined();
      expect(decoded.encrypted.encryptedData).toBeDefined();
    });

    it('should generate token with encrypted object data', async () => {
      const token = await jwtUtil.generateTokenWithEncryption(
        testPayload,
        testSensitiveData
      );

      const decoded = jwt.decode(token) as any;
      expect(decoded.encrypted).toBeDefined();
      expect(decoded.encrypted.iv).toBeDefined();
      expect(decoded.encrypted.encryptedData).toBeDefined();
    });
  });

  describe('verifyToken', () => {
    it('should verify and decode a valid token', async () => {
      const token = await jwtUtil.generateToken(testPayload);
      const decoded = await jwtUtil.verifyToken(token);
      expect(decoded).toMatchObject(testPayload);
    });

    it('should throw on invalid token', async () => {
      await expect(jwtUtil.verifyToken('invalid-token')).rejects.toThrow(
        'Token verification failed'
      );
    });

    it('should throw on expired token', async () => {
      const token = await jwtUtil.generateToken(testPayload, {
        expiresIn: '0s',
      });
      await expect(jwtUtil.verifyToken(token)).rejects.toThrow(
        'Token verification failed'
      );
    });
  });

  describe('verifyAndDecryptToken', () => {
    // Use a fixed secret for deterministic testing
    const fixedSecret = 'test-secret-for-encryption-test-1234567890';
    let jwtUtilInstance: JwtUtil;

    beforeEach(() => {
      // Create instance with fixed secret
      jwtUtilInstance = new JwtUtil({
        secret: fixedSecret,
        signOptions: {
          algorithm: 'HS256',
        },
      });
    });

    it('should encrypt and decrypt an object successfully', () => {
      const sensitiveObject = { secretKey: 'value', anotherKey: 42 }; // Example object

      // Encrypt the object
      const encrypted = jwtUtilInstance.encryptData(sensitiveObject);
      expect(encrypted.iv).toBeDefined();
      expect(encrypted.encryptedData).toBeDefined();

      console.log('Encrypted Data:', encrypted); // Debug log

      // Decrypt the object
      const decrypted = jwtUtilInstance.decryptData(encrypted);
      expect(decrypted).toMatchObject(sensitiveObject);

      console.log('Decrypted Data:', decrypted); // Debug log
    });

    it('should verify and decrypt token with encrypted sensitive object data', async () => {
      const sensitiveObject = { secretKey: 'value', anotherKey: 42 }; // Sample object

      const token = await jwtUtilInstance.generateTokenWithEncryption(
        testPayload,
        sensitiveObject
      );

      // Decode the JWT to check token structure
      const decoded = jwt.decode(token) as any;
      expect(decoded.encrypted).toBeDefined();
      expect(decoded.encrypted.iv).toBeDefined();
      expect(decoded.encrypted.encryptedData).toBeDefined();

      console.log('Token Structure:', decoded.encrypted); // Debug log

      // Verify and decrypt the token
      const result = await jwtUtilInstance.verifyAndDecryptToken(token);

      // Verify the base payload
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { encrypted, ...basePayload } = result.decoded as any;
      expect(basePayload).toMatchObject(testPayload);

      // Verify decrypted sensitive data
      expect(result.decrypted).toMatchObject(sensitiveObject);
    });

    it('should verify and decrypt token with sensitive data', async () => {
      const simpleSensitiveData = { test: 'sensitive-string-data' };

      const token = await jwtUtilInstance.generateTokenWithEncryption(
        testPayload,
        simpleSensitiveData
      );

      // Check the token structure
      const decoded = jwt.decode(token) as any;
      expect(decoded.encrypted).toBeDefined();
      expect(decoded.encrypted.iv).toBeDefined();
      expect(decoded.encrypted.encryptedData).toBeDefined();

      console.log('Generated Token:', token); // Debug log for token

      const result = await jwtUtilInstance.verifyAndDecryptToken(token);

      // Check if the base payload matches
      const { encrypted, ...payloadWithoutEncrypted } = result.decoded as any;
      expect(payloadWithoutEncrypted).toMatchObject(testPayload);

      // Verify decryption
      console.log('Decrypted Data:', result.decrypted); // Debug log for the decrypted data
      expect(result.decrypted).toStrictEqual(simpleSensitiveData); // Use deep equality check
    });

    it('should handle simple object as sensitive data', async () => {
      const simpleObject = { key: 'value' };

      const token = await jwtUtilInstance.generateTokenWithEncryption(
        testPayload,
        simpleObject
      );

      const result = await jwtUtilInstance.verifyAndDecryptToken(token);
      expect(result.decrypted!).toEqual(simpleObject);
    });

    it('should handle tokens without encrypted data', async () => {
      const token = await jwtUtilInstance.generateToken(testPayload);
      const result = await jwtUtilInstance.verifyAndDecryptToken(token);
      expect(result.decoded).toMatchObject(testPayload);
      expect(result.decrypted).toBeUndefined();
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const token = jwt.sign(testPayload, 'wrong-secret');
      const decoded = jwtUtil.decodeToken(token);
      expect(decoded).toMatchObject(testPayload);
    });

    it('should return null for invalid token format', () => {
      const decoded = jwtUtil.decodeToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return true for expired token', async () => {
      const token = await jwtUtil.generateToken(testPayload, {
        expiresIn: '-1h',
      });
      expect(jwtUtil.isTokenExpired(token)).toBe(true);
    });

    it('should return false for valid token', async () => {
      const token = await jwtUtil.generateToken(testPayload, {
        expiresIn: '1h',
      });
      expect(jwtUtil.isTokenExpired(token)).toBe(false);
    });

    it('should return true for invalid token', () => {
      expect(jwtUtil.isTokenExpired('invalid-token')).toBe(true);
    });
  });

  describe('refreshToken', () => {
    it('should generate new token with same payload but different timestamps', async () => {
      const originalToken = await jwtUtil.generateToken(testPayload);

      // Wait a small amount of time to ensure different iat timestamp
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const refreshedToken = await jwtUtil.refreshToken(originalToken);

      // Verify both tokens have the same payload but different timestamps
      const originalDecoded = jwt.verify(
        originalToken,
        testSecret
      ) as jwt.JwtPayload;
      const refreshedDecoded = jwt.verify(
        refreshedToken,
        testSecret
      ) as jwt.JwtPayload;

      // Compare payloads excluding timestamps
      const {
        exp: origExp,
        iat: origIat,
        ...originalPayload
      } = originalDecoded;
      const {
        exp: refreshExp,
        iat: refreshIat,
        ...refreshedPayload
      } = refreshedDecoded;

      expect(refreshedPayload).toEqual(originalPayload);
      expect(refreshedToken).not.toBe(originalToken);
      expect(refreshIat).toBeGreaterThan(origIat!);
      expect(refreshExp).toBeGreaterThan(origExp!);
    });

    it('should throw error for invalid token', async () => {
      await expect(jwtUtil.refreshToken('invalid-token')).rejects.toThrow(
        'Failed to refresh token'
      );
    });
  });
});
