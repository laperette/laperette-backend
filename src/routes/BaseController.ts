import { Logger } from 'bunyan';
import { SequelizeStorageManager } from '../storage';

export abstract class BaseController {
  protected logger: Logger;
  protected storageManager: SequelizeStorageManager;

  constructor(logger: Logger, storageManager: SequelizeStorageManager) {
    this.logger = logger;
    this.storageManager = storageManager;
  }
}
