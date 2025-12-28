import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	DataTypes,
	HasManyGetAssociationsMixin,
	HasManyAddAssociationMixin,
	HasManyAddAssociationsMixin,
	HasManySetAssociationsMixin,
	HasManyRemoveAssociationMixin,
	HasManyRemoveAssociationsMixin,
	HasManyHasAssociationMixin,
	HasManyHasAssociationsMixin,
	HasManyCountAssociationsMixin,
	HasManyCreateAssociationMixin,
	NonAttribute,
	Association,
} from 'sequelize'
import { sequelize } from '../config'
import { Cylinder } from '../cylinder'

export class Client extends Model<
	InferAttributes<Client>,
	InferCreationAttributes<Client>
> {
	// 'CreationOptional' is a special type that marks the field as optional
	// when creating an instance of the model (such as using Model.create()).
	declare id: CreationOptional<number>

	declare name: string
	declare nitroxCert?: string
	declare advancedNitroxCert?: string
	declare trimixCert?: string
	declare inspectionCert?: CreationOptional<string>

	// createdAt can be undefined during creation
	declare createdAt: CreationOptional<Date>
	// updatedAt can be undefined during creation
	declare updatedAt: CreationOptional<Date>

	declare getCylinders: HasManyGetAssociationsMixin<Cylinder> // Note the null assertions!
	declare addCylinder: HasManyAddAssociationMixin<Cylinder, number>
	declare addCylinders: HasManyAddAssociationsMixin<Cylinder, number>
	declare setCylinders: HasManySetAssociationsMixin<Cylinder, number>
	declare removeCylinder: HasManyRemoveAssociationMixin<Cylinder, number>
	declare removeCylinders: HasManyRemoveAssociationsMixin<Cylinder, number>
	declare hasCylinder: HasManyHasAssociationMixin<Cylinder, number>
	declare hasCylinders: HasManyHasAssociationsMixin<Cylinder, number>
	declare countCylinders: HasManyCountAssociationsMixin
	declare createCylinder: HasManyCreateAssociationMixin<Cylinder, 'ownerId'>

	declare cylinders?: NonAttribute<Cylinder[]>

	declare static associations: {
		cylinders: Association<Client, Cylinder>
	}
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
			allowNull: false,
			defaultValue: '',
		},
		advancedNitroxCert: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: '',
		},
		trimixCert: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: '',
		},
		inspectionCert: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: '',
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
