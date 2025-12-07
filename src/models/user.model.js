import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    defaultValue: () => `Usuario_${Math.floor(Math.random() * 100000)}`
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: 'https://via.placeholder.com/150'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Métodos estáticos
User.findByEmail = async (email) => {
  try {
    return await User.findOne({
      where: { email }
    });
  } catch (error) {
    console.error('Error buscando usuario por email:', error);
    throw error;
  }
};

User.findById = async (id) => {
  try {
    return await User.findByPk(id);
  } catch (error) {
    console.error('Error buscando usuario por ID:', error);
    throw error;
  }
};

User.addUser = async (email, hashedPassword) => {
  try {
    const user = await User.create({email: email, password: hashedPassword});
    return user;
  } catch (err) {
    console.error("Error registrando al usuario", err);
    throw err; // Re-lanzar el error para que se maneje en el controlador
  }
};

export default User;