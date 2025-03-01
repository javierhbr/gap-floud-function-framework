import { UserTokenPayload } from '../chrome/domain/user';
import { JwtUtil } from '../chrome/utils/jwtUtil';

/**
 * Generates a JWT token for a given email address.
 *
 * @param email - The email address to generate a token for.
 * @returns The signed JWT token.
 */
export function generateTokenForEmail(email: string): any {
  const payload: UserTokenPayload = {
    id: crypto.randomUUID(), // generates a random UUID (available in Node 20)
    email,
    expiration: new Date(Date.now() + 24 * 60 * 60 * 1000), // token valid for 24 hours
    type: 'access',
    verified: false,
  };

  // Create an instance of JwtUtil and generate the token.
  const jwtUtil = new JwtUtil();
  return jwtUtil.generateToken(payload);
}

// If run directly from the command line, generate a token using the provided email argument.
if (require.main === module) {
  const emailArg = process.argv[2];
  if (!emailArg) {
    console.error(
      'Usage: ts-node src/scripts/generateToken.ts user@example.com'
    );
    process.exit(1);
  }

  const token = generateTokenForEmail(emailArg);
  console.log('Generated Token:\n', token);
}

/**
 *    ts-node src/scripts/generateToken.ts user@example.com
 *
 *    npm run generate:token -- user@example.com
 */
