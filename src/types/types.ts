import { Sequelize, ModelStatic, Model } from 'sequelize';

export interface SequelizeModels {
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
  [key: string]: ModelStatic<Model<any, any>> | Sequelize | typeof Sequelize;
}
