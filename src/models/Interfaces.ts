import * as Sequelize from 'sequelize';

// ATTRIBUTES
export interface UserAttributes {
  id?: number;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  password?: string;
  role?: string;
}
export interface BookingAttributes {
  id?: number;
  start?: Date;
  end?: Date;
  user_id?: number;
}

// INSTANCES
export interface UserInstance
  extends Sequelize.Instance<UserAttributes>,
    UserAttributes {
  getBookings(): Sequelize.HasManyGetAssociationsMixin<BookingAttributes>;
  setBookings: Sequelize.HasManySetAssociationsMixin<BookingAttributes, string>;
  addBookings: Sequelize.HasManyAddAssociationsMixin<BookingAttributes, string>;
  addBooking: Sequelize.HasManyAddAssociationMixin<BookingAttributes, string>;
  createBooking: Sequelize.HasManyCreateAssociationMixin<
    BookingAttributes,
    BookingInstance
  >;
  removeBooking: Sequelize.HasManyRemoveAssociationMixin<
    BookingAttributes,
    string
  >;
  removeBookings: Sequelize.HasManyRemoveAssociationsMixin<
    BookingAttributes,
    string
  >;
  hasBooking: Sequelize.HasManyHasAssociationMixin<BookingAttributes, string>;
  hasBookings: Sequelize.HasManyHasAssociationsMixin<BookingAttributes, string>;
  countBookings: Sequelize.HasManyCountAssociationsMixin;
  comparePassword: (rawPassword: string) => Promise<boolean>;
  getFullName: () => string;
  genToken: () => string;
}

export interface BookingInstance
  extends Sequelize.Instance<BookingAttributes>,
    BookingAttributes {
  getBooker: Sequelize.BelongsToGetAssociationMixin<UserInstance>;
  setBooker: Sequelize.BelongsToSetAssociationMixin<UserInstance, string>;
  createBooker: Sequelize.BelongsToCreateAssociationMixin<UserInstance>;
}

// MODELS
export interface BookingModel
  extends Sequelize.Model<BookingInstance, BookingAttributes> {}

export interface UserModel
  extends Sequelize.Model<UserInstance, UserAttributes> {}
