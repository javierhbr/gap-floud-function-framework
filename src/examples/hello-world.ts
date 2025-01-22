import { http } from '@google-cloud/functions-framework';
import { z } from 'zod';

import { errorHandler } from '@/middleware/error-handler';
import { validateBody } from '@/middleware/validation';
import { Handler } from '@core/handler';

const requestSchema = z.object({
  name: z.string().min(1),
});

const helloWorld = Handler.use(errorHandler())
  .use(validateBody(requestSchema))
  .handle(async (req, res) => {
    const { name } = req.body;
    res.json({
      message: `Hello, ${name}!`,
    });
  });

http('helloWorld', helloWorld);
