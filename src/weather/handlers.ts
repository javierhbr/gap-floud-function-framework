import { ContainerInstance } from 'typedi';

import { weatherSchema, weatherUpdateSchema } from './schemas';
import { DateHeaderMiddleware } from './middlewares/DateHeaderMiddleware';
import { WeatherService } from './services/WeatherService';
import { WeatherApiService } from './services/WeatherApiService';
import { PubSubService } from './services/PubSubService';
import { WeatherValidation } from './WeatherValidation';
import { Firestore } from '@google-cloud/firestore';
import { PubSub } from '@google-cloud/pubsub';
import {
  Handler,
  bodyParser,
  pathParameters,
  bodyValidator,
  verifyAuthTokenMiddleware,
  TokenPayload,
  errorHandler,
  responseWrapperMiddleware,
} from '@noony/core';
import { WeatherData } from './types';
import { jwtTokenVerificationPort } from '../utils/auth';

// Setup dependency injection
const container = new ContainerInstance('weatherContainer');
container.set(Firestore, new Firestore());
container.set(PubSub, new PubSub());
container.set(WeatherService, new WeatherService(container.get(Firestore)));
container.set(
  WeatherApiService,
  new WeatherApiService(
    process.env.WEATHER_API_KEY!,
    process.env.WEATHER_API_URL!
  )
);
container.set(
  PubSubService,
  new PubSubService(container.get(PubSub), 'high-temperature-topic')
);
container.set(
  WeatherValidation,
  new WeatherValidation(
    container.get(WeatherService),
    container.get(WeatherApiService)
  )
);

// GET handler
export const weatherHandlerGet = new Handler()
  .use(errorHandler())
  .use(verifyAuthTokenMiddleware<TokenPayload>(jwtTokenVerificationPort))
  .use(pathParameters())
  .use(new DateHeaderMiddleware())
  .use(responseWrapperMiddleware<any>())
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
  .use(verifyAuthTokenMiddleware<TokenPayload>(jwtTokenVerificationPort))
  .use(bodyParser())
  .use(bodyValidator(weatherSchema))
  .use(new DateHeaderMiddleware())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context) => {
    const weatherService = container.get(WeatherService);
    const pubSubService = container.get(PubSubService);
    const weatherValidation = container.get(WeatherValidation);

    const data: WeatherData = context.req.validatedBody as WeatherData;

    // Validate weather data
    const isValid = await weatherValidation.checkByDate(data.date);
    if (!isValid) {
      throw new Error('Invalid weather data');
    }

    const weatherId = await weatherService.saveWeather(data);
    context.businessData.set('weatherId', weatherId);

    // Check temperature threshold
    if (data.temperature > 100) {
      await pubSubService.publishHighTemperature({ ...data, id: weatherId });

      context.businessData.set('highTemperatureAlert', true);
    }

    context.res.status(201).json({ weatherId });
  });

// PUT handler
export const weatherHandlerPut = new Handler()
  .use(errorHandler())
  .use(verifyAuthTokenMiddleware<TokenPayload>(jwtTokenVerificationPort))
  .use(pathParameters())
  .use(bodyParser())
  .use(bodyValidator(weatherUpdateSchema))
  .use(new DateHeaderMiddleware())
  .use(responseWrapperMiddleware<any>())
  .handle(async (context) => {
    const { id } = context.req.params;
    const weatherService = container.get(WeatherService);
    const pubSubService = container.get(PubSubService);

    const data: any = context.req.validatedBody;

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
