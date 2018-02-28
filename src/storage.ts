import * as Sequelize from 'sequelize';
//import * as Promise from 'bluebird';
import { Logger } from 'bunyan';
import { defineUser } from './models/User';
import { defineBooking } from './models/Booking';
import {
  UserModel,
  BookingModel,
  UserInstance,
  BookingInstance
} from './models/Interfaces';
import { areRangesOverlapping } from 'date-fns';

// CONFIG
export interface SequelizeStorageConfig {
  host: string;
  database: string;
  username: string;
  password: string;
}

export class SequelizeStorageManager {
  public sequelize: Sequelize.Sequelize;
  public User: UserModel;
  public Booking: BookingModel;
  private logger: Logger;

  constructor(private config: SequelizeStorageConfig, logger: Logger) {
    this.logger = logger.child({ component: 'SequelizeStorageManager' });
    this.sequelize = new Sequelize(
      this.config.database,
      this.config.username,
      this.config.password,
      {
        host: this.config.host,
        dialect: 'postgres',
        operatorsAliases: false,
        logging: false, // logger.debug.bind(logger),
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );
    // USER
    this.User = defineUser(this.sequelize);
    // BOOKING
    this.Booking = defineBooking(this.sequelize);
    // RELATIONSHIPS
    this.Booking.belongsTo(this.User, { as: 'booker', foreignKey: 'user_id' });
    this.User.hasMany(this.Booking, { foreignKey: 'user_id' });
  }

  async init(force?: boolean): Promise<any> {
    force = force || false;
    return this.sequelize.sync({
      force,
      logging: false //logger.info(logger)
    });
  }

  async register(
    firstname: string,
    lastname: string,
    email: string,
    rawPassword: string,
    role?: string,
    phone?: string
  ): Promise<UserInstance> {
    return this.User.create({
      firstname,
      lastname,
      email,
      password: rawPassword,
      phone,
      role
    });
  }

  async authenticateUser(rawUser: {
    email: string;
    password: string;
  }): Promise<string> {
    const user = await this.getUserByEmail(rawUser.email);
    if (user && (await user.comparePassword(rawUser.password))) {
      return user.genToken();
    }
    return null;
  }

  async getUserById(id: string): Promise<UserInstance> {
    return this.User.findOne({ where: { id } });
  }

  async getUserByEmail(email: string): Promise<UserInstance> {
    return this.User.findOne({ where: { email } });
  }
  async userExists(email: string): Promise<boolean> {
    return (await this.User.count({ where: { email } })) > 0 ? true : false;
  }

  async addBooking(booking: {
    user: UserInstance;
    start: Date;
    end: Date;
  }): Promise<BookingInstance> {
    const { start, end } = booking;
    if (await this.isValidBooking({ start, end })) {
      return booking.user.createBooking({
        start: booking.start,
        end: booking.end
      });
    } else {
      throw 'booking dates are overlapping with other bookings';
    }
  }

  private async isValidBooking(booking: {
    start: Date;
    end: Date;
  }): Promise<boolean> {
    const { start, end } = booking;
    // TODO : verify if start is after today

    // range overlapping verification
    return !(await this.getAllBookings(false)).some(b => {
      return areRangesOverlapping(start, end, b.start, b.end);
    });
  }

  async getAllBookings(populateBookers = true): Promise<BookingInstance[]> {
    const options = populateBookers
      ? {
          include: [
            {
              model: this.User,
              as: 'booker',
              attributes: [
                'firstname',
                'lastname',
                'email',
                'role',
                'phone',
                'createdAt',
                'updatedAt'
              ]
            }
          ]
        }
      : {};
    return await this.Booking.findAll<BookingInstance[]>(options);
  }
  async getAllUsers(): Promise<UserInstance[]> {
    return await this.User.findAll<UserInstance[]>({
      include: [
        {
          model: this.Booking,
          attributes: ['id', 'start', 'end', 'createdAt', 'updatedAt']
        }
      ]
    });
  }
}
