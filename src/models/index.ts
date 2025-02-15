import { Sequelize, DataTypes} from 'sequelize';
import { SequelizeModels } from '../types/types';
import { readdirSync } from 'fs';
import { basename as _basename, join } from 'path';
import process from 'process';

const basename = _basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.ts')[env];

const db: SequelizeModels = {} as SequelizeModels;

let sequelize: Sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable] as string, config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.ts' && // Expecting .ts model files
      file.indexOf('.test.ts') === -1
    );
  })
  .forEach((file) => {
    const model = require(join(__dirname, file)).default(sequelize, DataTypes);
    db[model.name] = model;
  });

// Check for associations after models are loaded
Object.keys(db).forEach((modelName) => {
  if ((db[modelName] as any).associate) {
    (db[modelName] as any).associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
