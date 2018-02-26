import { Router, Request, Response } from 'express';
import { BaseController } from './BaseController';
import { SequelizeStorageManager } from '../storage';
import { Logger } from 'bunyan';

export class BookingsController extends BaseController {
  private bookingsRoutes: Router;
  constructor(logger: Logger, storageManager: SequelizeStorageManager) {
    super(logger.child({ component: 'BookingsController' }), storageManager);
  }
  get routes(): Router {
    if (!this.bookingsRoutes) {
      this.bookingsRoutes = Router();
      this.bookingsRoutes.get('/', this.getBookings.bind(this));
      this.bookingsRoutes.post('/', this.addBooking.bind(this));
    }
    return this.bookingsRoutes;
  }

  async getBookings(req: Request, res: Response) {
    res.send(await this.storageManager.getAllBookings());
  }

  async addBooking(req: Request, res: Response) {
    const user = await this.storageManager.getUserById(req['user']['id']);
    try {
      res.send(
        await this.storageManager.addBooking({
          user,
          start: req.body.start,
          end: req.body.end
        })
      );
    } catch (err) {
      res.status(400).send(err);
    }
  }
}
