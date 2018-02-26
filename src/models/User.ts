import * as Sequelize from 'sequelize';
import { UserInstance, UserAttributes, UserModel } from './Interfaces';
import { Roles } from './Roles';
import { hash, compare, genSalt } from 'bcryptjs';
import * as Jwt from 'jsonwebtoken';
import { addDays } from 'date-fns';
import { generateToken } from '../services/Jwt';

export const defineUser = (sequelize: Sequelize.Sequelize): UserModel => {
  const Model = sequelize.define<UserInstance, UserAttributes>(
    'user',
    {
      firstname: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { is: /^[a-zA-Z0-9]+$/ }
      },
      lastname: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { is: /^[a-zA-Z0-9]+$/ }
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: { isEmail: true }
      },
      role: {
        type: Sequelize.ENUM,
        values: [Roles.ADMIN, Roles.USER]
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        validate: {
          is: /^(?:0)\s*[1-9](?:[\s]*\d{2}){4}$/
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      }
    },
    {
      hooks: {
        beforeValidate: async user => {
          // hash password
          const hashedPassword = await hash(user.password, await genSalt(13));
          user.password = hashedPassword;
          // set default value for role
          user.role = Roles.USER.toString();
        }
      }
    }
  );
  (<any>Model).prototype.getFullName = function(): string {
    return (<UserInstance>this).firstname + ' ' + (<UserInstance>this).lastname;
  };
  (<any>Model).prototype.genToken = function(): string {
    return generateToken({
      id: (<UserInstance>this).id,
      name: (<UserInstance>this).getFullName(),
      email: (<UserInstance>this).email,
      role: (<UserInstance>this).role
    });
  };
  (<any>Model).prototype.comparePassword = async function(
    rawPassword: string
  ): Promise<boolean> {
    return compare(rawPassword, (<UserInstance>this).password);
  };
  return Model;
};
