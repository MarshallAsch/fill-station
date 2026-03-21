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
import { Visual } from '../visual'

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

	declare getCylinders: HasManyGetAssociationsMixin<Cylinder>
	declare addCylinder: HasManyAddAssociationMixin<Cylinder, number>
	declare addCylinders: HasManyAddAssociationsMixin<Cylinder, number>
	declare setCylinders: HasManySetAssociationsMixin<Cylinder, number>
	declare removeCylinder: HasManyRemoveAssociationMixin<Cylinder, number>
	declare removeCylinders: HasManyRemoveAssociationsMixin<Cylinder, number>
	declare hasCylinder: HasManyHasAssociationMixin<Cylinder, number>
	declare hasCylinders: HasManyHasAssociationsMixin<Cylinder, number>
	declare countCylinders: HasManyCountAssociationsMixin
	declare createCylinder: HasManyCreateAssociationMixin<Cylinder, 'ownerId'>

	declare getVisuals: HasManyGetAssociationsMixin<Visual>
	declare addVisual: HasManyAddAssociationMixin<Visual, number>
	declare addVisuals: HasManyAddAssociationsMixin<Visual, number>
	declare setVisuals: HasManySetAssociationsMixin<Visual, number>
	declare removeVisual: HasManyRemoveAssociationMixin<Visual, number>
	declare removeVisuals: HasManyRemoveAssociationsMixin<Visual, number>
	declare hasVisual: HasManyHasAssociationMixin<Visual, number>
	declare hasVisuals: HasManyHasAssociationsMixin<Visual, number>
	declare countVisuals: HasManyCountAssociationsMixin
	declare createVisual: HasManyCreateAssociationMixin<Visual, 'inspectorId'>

	declare Cylinders?: NonAttribute<Cylinder[]>
	declare Visuals?: NonAttribute<Visual[]>

	declare static associations: {
		Cylinders: Association<Client, Cylinder>
		Visuals: Association<Client, Visual>
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
