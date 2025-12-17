import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	DataTypes,
} from 'sequelize'
import { sequelize } from '../config'

export class Client extends Model<
	InferAttributes<Client>,
	InferCreationAttributes<Client>
> {
	// 'CreationOptional' is a special type that marks the field as optional
	// when creating an instance of the model (such as using Model.create()).
	declare id: CreationOptional<number>

	declare name: string
	declare nitroxCert: string
	declare advancedNitroxCert: string
	declare trimixCert: string
	declare inspectionCert: CreationOptional<string>

	// timestamps!
	// createdAt can be undefined during creation
	declare createdAt: CreationOptional<Date>
	// updatedAt can be undefined during creation
	declare updatedAt: CreationOptional<Date>
}

Client.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		nitroxCert: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		advancedNitroxCert: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		trimixCert: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		inspectionCert: {
			type: DataTypes.STRING,
			allowNull: true,
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		modelName: 'Client',
		sequelize,
	},
)

Client.sync({ alter: true })
