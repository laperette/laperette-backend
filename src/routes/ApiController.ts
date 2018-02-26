import { Logger } from 'bunyan';
import { Express, Router, Response, Request, NextFunction } from 'express';
import { SequelizeStorageManager } from '../storage';
import { BaseController } from './BaseController';
import { UsersController } from './users';
import { BookingsController } from './bookings';
import * as Jwt from 'jsonwebtoken';
import { decodeAndVerifyToken } from '../services/Jwt';

export class ApiController extends BaseController {
  constructor(logger: Logger, storageManager: SequelizeStorageManager) {
    super(logger.child({ component: 'ApiController' }), storageManager);
  }
  private loggedIn = (req: Request, res: Response, next: NextFunction) => {
    if (req['user']) {
      this.logger.info('authenticated user : ', req['user']['email']);
      next();
    } else {
      res.sendStatus(403);
    }
  };
  get routes(): Router {
    const routes = Router();

    routes.use(this.authMiddleware.bind(this));

    routes.use(
      '/bookings',
      this.loggedIn,
      new BookingsController(this.logger, this.storageManager).routes
    );
    routes.use(
      '/users',
      this.loggedIn,
      new UsersController(this.logger, this.storageManager).routes
    );

    routes.use('/login', this.login.bind(this));

    return routes;
  }

  async login(req: Request, res: Response) {
    if (!req.body.email) return res.status(400).send('no user');
    const token = await this.storageManager.authenticateUser(req.body);
    if (token) {
      res.send({ token, user: Jwt.decode(token) });
    } else {
      res.status(403).send('bad credentials');
    }
  }

  async authMiddleware(req: Request, res: Response, next: NextFunction) {
    const bearerToken = req.get('Authorization');
    try {
      const decoded = await decodeAndVerifyToken(bearerToken);
      if (await this.storageManager.userExists(decoded['email'])) {
        req['user'] = decoded;
        next();
      } else {
        throw 'unknown';
      }
    } catch (err) {
      this.logger.info('unauthenticated client : ', err);
      next();
    }
  }
}
