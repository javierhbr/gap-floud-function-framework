import { BaseMiddleware } from '../handler';
import { Context } from '../core';
import { AuthenticationError, HttpError } from '../errors';

export interface CustomTokenVerificationPort<T> {
  verifyToken(token: string): Promise<T>;
}

async function verifyToken<T>(
  tokenVerificationPort: CustomTokenVerificationPort<T>,
  context: Context
): Promise<void> {
  const authHeader = context.req.headers?.authorization;

  if (!authHeader) {
    throw new HttpError(401, 'No authorization header');
  }

  const token = authHeader.split('Bearer ')[1];
  if (!token) {
    throw new AuthenticationError('Invalid token format');
  }

  try {
    context.user = await tokenVerificationPort.verifyToken(token);
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new AuthenticationError('Invalid authentication');
  }
}

export class AuthenticationMiddleware<T> implements BaseMiddleware {
  constructor(private tokenVerificationPort: CustomTokenVerificationPort<T>) {}

  async before(context: Context): Promise<void> {
    await verifyToken(this.tokenVerificationPort, context);
  }
}

export const verifyAuthTokenMiddleware = <T>(
  tokenVerificationPort: CustomTokenVerificationPort<T>
): BaseMiddleware => ({
  async before(context: Context): Promise<void> {
    await verifyToken(tokenVerificationPort, context);
  },
});


/*
// Example protected endpoint
const protectedHandler = Handler.use(verifyAuthTokenMiddleware(customTokenVerificationPort))
  .use(errorHandler())
  .use(responseWrapperV2<any>())
  .handle(async (context: Context) => {
    const user = context.user;
    context.res.json({
      message: 'Protected endpoint',
      user,
    });
  });

const app = express();
app.use(express.json());

app.get('/protected', (req, res) =>
  protectedHandler.execute(req as unknown as CustomRequest, res as unknown as CustomResponse)
);

export default app;*/
