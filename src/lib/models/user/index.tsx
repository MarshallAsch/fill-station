import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	DataTypes,
	ForeignKey,
} from 'sequelize'
import { sequelize } from '../config'
import { Client } from '../client'

export const VALID_ROLES = ['user', 'admin', 'filler', 'inspector']

export class User extends Model<
	InferAttributes<User>,
	InferCreationAttributes<User>
> {
	declare id: CreationOptional<string>
	declare name: CreationOptional<string | null>
	declare email: CreationOptional<string | null>
	declare emailVerified: CreationOptional<Date | null>
	declare image: CreationOptional<string | null>
	declare theme: CreationOptional<'light' | 'dark' | 'system'>
	declare role: CreationOptional<'user' | 'admin' | 'filler' | 'inspector'>
	declare clientId: ForeignKey<CreationOptional<number | null>>
	declare lastLogin: CreationOptional<Date | null>
	declare notifyContact: CreationOptional<boolean>
	declare notifyHydro: CreationOptional<boolean>
	declare notifyVisual: CreationOptional<boolean>
	declare hydroReminderDays1: CreationOptional<number>
	declare hydroReminderDays2: CreationOptional<number>
	declare visualReminderDays1: CreationOptional<number>
	declare visualReminderDays2: CreationOptional<number>
}

User.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
		},
		email: {
			type: DataTypes.STRING,
			unique: 'email',
		},
		emailVerified: {
			type: DataTypes.DATE,
		},
		image: {
			type: DataTypes.STRING,
		},
		theme: {
			type: DataTypes.ENUM('light', 'dark', 'system'),
			allowNull: false,
			defaultValue: 'system',
		},
		role: {
			type: DataTypes.ENUM('user', 'admin', 'filler', 'inspector'),
			allowNull: false,
			defaultValue: 'user',
		},
		clientId: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: true,
			defaultValue: null,
			references: {
				model: Client,
				key: 'id',
			},
		},
		lastLogin: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: null,
		},
		notifyContact: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		notifyHydro: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		notifyVisual: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		hydroReminderDays1: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 180,
		},
		hydroReminderDays2: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 30,
		},
		visualReminderDays1: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 60,
		},
		visualReminderDays2: {
			type: DataTypes.INTEGER,
			allowNull: false,
			defaultValue: 30,
		},
	},
	{
		modelName: 'user',
		sequelize,
		underscored: true,
		timestamps: false,
	},
)

User.belongsTo(Client, { foreignKey: 'clientId', as: 'client' })
