import express = require('express');
import bodyParser = require('body-parser');
import { SequelizeStorageManager } from './storage';
import { Logger, createLogger } from 'bunyan';
import { ApiController } from './routes';
import { addDays } from 'date-fns';

function configureExpress(
  logger: Logger,
  storageManager: SequelizeStorageManager
): express.Application {
  const server = express();
  server.disable('x-powered-by');
  server.use(bodyParser.json());
  server.use(
    (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      logger.info(
        {
          method: req.method,
          url: req.url,
          protocol: req.protocol,
          ip: req.ip,
          hostname: req.hostname
        },
        req.method + ' ' + req.path
      );
      next();
    }
  );
  return server;
}

function configureRoutes(
  app: express.Application,
  logger: Logger,
  storageManager: SequelizeStorageManager
): any {
  const apiController = new ApiController(logger, storageManager);
  app.use('/api', apiController.routes);
}

async function populateDatabase(
  logger: Logger,
  storageManager: SequelizeStorageManager
) {
  const user = await storageManager.register(
    'Alex',
    'Beg',
    'al.be@doud.com',
    'password'
  );
  const booking = await storageManager.addBooking({
    user,
    start: new Date(),
    end: addDays(new Date(), 3)
  });
  logger.info('Database has been initialized');
}

export function start(logger?: Logger) {
  logger =
    logger ||
    createLogger({
      name: 'La-Perette',
      stream: process.stdout,
      level: 'info'
    });
  const storageManager = new SequelizeStorageManager(
    {
      database: 'b7sic7iicy1nm3p',
      username: process.env.EXAMPLE_USERNAME || 'usmetg8uviowbn0wdh61',
      password: 'B5STtSJfN1yZc35Yk6sS'
    },
    logger
  );
  storageManager
    .init(true)
    .then(async () => {
      await populateDatabase(logger, storageManager);
      const server = configureExpress(logger, storageManager);
      configureRoutes(server, logger, storageManager);
      server.listen(3000, serv => {
        logger.info(`Server listening on port 3000`);
      });
    })
    .catch(err => {
      logger.error('error connecting to db', err);
    });
}

start();
