import * as Sequelize from 'sequelize';
import { BookingModel, BookingInstance, BookingAttributes } from './Interfaces';
import { isBefore } from 'date-fns';

export const defineBooking = (sequelize: Sequelize.Sequelize): BookingModel => {
  return sequelize.define<BookingInstance, BookingAttributes>(
    'booking',
    {
      start: { type: Sequelize.DATE },
      end: { type: Sequelize.DATE }
    },
    {
      validate: {
        startBeforeEnd() {
          if (isBefore(this.end, this.start)) {
            throw new Error('The end must be after the start');
          }
        }
      }
    }
  );
};
