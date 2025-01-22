import { Handler } from '../core/handler';
import { Container } from 'inversify';
import {
  bodyParser,
  bodyValidator,
  errorHandler,
  responseWrapper,
  pathParameters,
  authentication,
} from '../framework/middlewares';
import { weatherSchema, weatherUpdateSchema } from './schemas';
import { DateHeaderMiddleware } from './middlewares/DateHeaderMiddleware';
import { WeatherService } from './services/WeatherService';
import { WeatherApiService } from './services/WeatherApiService';
import { PubSubService } from './services/PubSubService';
import { WeatherValidation } from './WeatherValidation';
import { verifyToken } from '../utils/auth';
import { Firestore } from '@google-cloud/firestore';
import { PubSub } from '@google-cloud/pubsub';

// Setup dependency injection
const container = new Container();
container.bind(Firestore).toConstantValue(new Firestore());
container.bind(PubSub).toConstantValue(new PubSub());
container.bind(WeatherService).toSelf();
container
  .bind(WeatherApiService)
  .toConstantValue(
    new WeatherApiService(process.env.WEATHER_API_KEY!, process.env.WEATHER_API_URL!)
  );
container
  .bind(PubSubService)
  .toConstantValue(new PubSubService(container.get(PubSub), 'high-temperature-topic'));
container.bind(WeatherValidation).toSelf();

// GET handler
export const weatherHandlerGet = new Handler()
  .use(errorHandler())
  .use(authentication(verifyToken))
  .use(pathParameters())
  .use(new DateHeaderMiddleware())
  .use(responseWrapper())
  .handle(async (context) => {
    const { id } = context.req.params;
    const weatherService = container.get(WeatherService);

    const data = await weatherService.getWeatherById(id);
    context.businessData.set('weatherData', data);

    context.res.json(data);
  });

// POST handler
export const weatherHandlerPost = new Handler()
  .use(errorHandler())
  .use(authentication(verifyToken))
  .use(bodyParser())
  .use(bodyValidator(weatherSchema))
  .use(new DateHeaderMiddleware())
  .use(responseWrapper())
  .handle(async (context) => {
    const weatherService = container.get(WeatherService);
    const pubSubService = container.get(PubSubService);
    const weatherValidation = container.get(WeatherValidation);

    const data = context.req.validatedBody;

    // Validate weather data
    const isValid = await weatherValidation.checkByDate(data.date);
    if (!isValid) {
      throw new Error('Invalid weather data');
    }

    const id = await weatherService.saveWeather(data);
    context.businessData.set('weatherId', id);

    // Check temperature threshold
    if (data.temperature > 100) {
      await pubSubService.publishHighTemperature({ id, ...data });
      context.businessData.set('highTemperatureAlert', true);
    }

    context.res.status(201).json({ id });
  });

// PUT handler
export const weatherHandlerPut = new Handler()
  .use(errorHandler())
  .use(authentication(verifyToken))
  .use(pathParameters())
  .use(bodyParser())
  .use(bodyValidator(weatherUpdateSchema))
  .use(new DateHeaderMiddleware())
  .use(responseWrapper())
  .handle(async (context) => {
    const { id } = context.req.params;
    const weatherService = container.get(WeatherService);
    const pubSubService = container.get(PubSubService);

    const data = context.req.validatedBody;

    await weatherService.updateWeather(id, data);
    context.businessData.set('updatedWeatherId', id);

    // Check temperature threshold
    if (data.temperature && data.temperature > 100) {
      const fullData = await weatherService.getWeatherById(id);
      await pubSubService.publishHighTemperature(fullData);
      context.businessData.set('highTemperatureAlert', true);
    }

    context.res.status(204).send();
  });
