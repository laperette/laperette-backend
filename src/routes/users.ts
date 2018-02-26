import { Request, Router, Response } from 'express';
import { BaseController } from './BaseController';
import { SequelizeStorageManager } from '../storage';
import { Logger } from 'bunyan';

export class UsersController extends BaseController {
  private usersRoutes: Router;
  constructor(logger: Logger, storageManager: SequelizeStorageManager) {
    super(logger.child({ component: 'UsersController' }), storageManager);
  }
  get routes(): Router {
    if (!this.usersRoutes) {
      this.usersRoutes = Router();
      this.usersRoutes.get('/', this.getUsers.bind(this));
    }
    return this.usersRoutes;
  }
  async getUsers(req: Request, res: Response) {
    res.send(await this.storageManager.getAllUsers());
  }
}
