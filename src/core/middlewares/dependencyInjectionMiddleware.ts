import { Container } from 'typedi';
import { BaseMiddleware } from '../handler';
import { Context } from '../core';

export class DependencyInjectionMiddleware implements BaseMiddleware {
  constructor(private services: { id: any; value: any }[]) {}

  async before(context: Context): Promise<void> {
    this.services.forEach((service) => {
      Container.set(service.id, service.value);
    });
    context.container = Container;
  }
}

export const dependencyInjection = (): BaseMiddleware => ({
  before: async (context: Context): Promise<void> => {
    context.container = Container.of();
  },
});

/*
// Initialize services
const services = [
  { id: 'businessData', value: new Map<string, any>() },
  { id: UserService, value: new UserService(new Map<string, any>()) }
];

const app = express();
app.use(express.json());

// Create an instance of DependencyInjectionMiddleware with the services
const diMiddleware = new DependencyInjectionMiddleware(services);

// Example handler using the middleware
const exampleHandler = Handler.use(diMiddleware)
  .use(errorHandler())
  .use(responseWrapperV2<any>())
  .handle(async (context: Context) => {
    const businessData = context.container.get('businessData');
    context.res.locals.responseBody = { message: 'Dependency Injection Middleware example', businessData };
  });

app.get('/example', (req, res) =>
  exampleHandler.execute(req as unknown as CustomRequest, res as unknown as CustomResponse)
);

export default app;
*/
