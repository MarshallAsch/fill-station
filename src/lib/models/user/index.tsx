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
	},
	{
		modelName: 'user',
		sequelize,
		underscored: true,
		timestamps: false,
	},
)

User.belongsTo(Client, { foreignKey: 'clientId', as: 'client' })
