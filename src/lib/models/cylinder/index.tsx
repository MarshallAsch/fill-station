import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	NonAttribute,
	ForeignKey,
	DataTypes,
	Association,
	HasOneGetAssociationMixin,
	HasOneSetAssociationMixin,
	HasManyGetAssociationsMixin,
	HasManyAddAssociationMixin,
	HasManyAddAssociationsMixin,
	HasManySetAssociationsMixin,
	HasManyRemoveAssociationMixin,
	HasManyRemoveAssociationsMixin,
	HasManyCreateAssociationMixin,
	HasManyHasAssociationsMixin,
	HasManyHasAssociationMixin,
	HasManyCountAssociationsMixin,
} from 'sequelize'
import { sequelize } from '../config'
import dayjs from 'dayjs'
import { Client } from '../client'
import { Fill } from '../fill'
import { Visual } from '../visual'

export class Cylinder extends Model<
	InferAttributes<Cylinder, { omit: 'owner' }>,
	InferCreationAttributes<Cylinder, { omit: 'owner' }>
> {
	// 'CreationOptional' is a special type that marks the field as optional
	// when creating an instance of the model (such as using Model.create()).
	declare id: CreationOptional<number>

	declare ownerId: ForeignKey<Client['id']>
	declare owner?: NonAttribute<Client>

	declare serialNumber: string
	declare material: CreationOptional<
		'undefined' | 'steel' | 'aluminum' | 'composite'
	>

	declare birth: dayjs.Dayjs
	declare lastHydro: dayjs.Dayjs
	declare lastVis: dayjs.Dayjs

	declare oxygenClean: boolean

	// timestamps!
	// createdAt can be undefined during creation
	declare createdAt: CreationOptional<Date>
	// updatedAt can be undefined during creation
	declare updatedAt: CreationOptional<Date>

	declare getOwner: HasOneGetAssociationMixin<Client> // Note the null assertions!
	declare setOwner: HasOneSetAssociationMixin<Client, Client['id']>

	declare getFills: HasManyGetAssociationsMixin<Fill> // Note the null assertions!
	declare addFill: HasManyAddAssociationMixin<Fill, number>
	declare addFills: HasManyAddAssociationsMixin<Fill, number>
	declare setFills: HasManySetAssociationsMixin<Fill, number>
	declare removeFill: HasManyRemoveAssociationMixin<Fill, number>
	declare removeFills: HasManyRemoveAssociationsMixin<Fill, number>
	declare hasFill: HasManyHasAssociationMixin<Fill, number>
	declare hasFills: HasManyHasAssociationsMixin<Fill, number>
	declare countFills: HasManyCountAssociationsMixin
	declare createFill: HasManyCreateAssociationMixin<Fill, 'CylinderId'>

	declare getVisuals: HasManyGetAssociationsMixin<Visual> // Note the null assertions!
	declare addVisual: HasManyAddAssociationMixin<Visual, number>
	declare addVisuals: HasManyAddAssociationsMixin<Visual, number>
	declare setVisuals: HasManySetAssociationsMixin<Visual, number>
	declare removeVisual: HasManyRemoveAssociationMixin<Visual, number>
	declare removeVisuals: HasManyRemoveAssociationsMixin<Visual, number>
	declare hasVisual: HasManyHasAssociationMixin<Visual, number>
	declare hasVisuals: HasManyHasAssociationsMixin<Visual, number>
	declare countVisuals: HasManyCountAssociationsMixin
	declare createVisual: HasManyCreateAssociationMixin<Visual, 'CylinderId'>

	declare fills?: NonAttribute<Fill[]>
	declare visuals?: NonAttribute<Visual[]>

	declare static associations: {
		owner: Association<Cylinder, Client>
		fills: Association<Fill, Cylinder>
		visuals: Association<Visual, Cylinder>
	}
}

Cylinder.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		serialNumber: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		birth: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			get() {
				return dayjs(this.getDataValue('birth'))
			},
		},
		lastHydro: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			get() {
				return dayjs(this.getDataValue('lastHydro'))
			},
		},
		lastVis: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			get() {
				return dayjs(this.getDataValue('lastVis'))
			},
		},
		oxygenClean: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		material: {
			type: DataTypes.ENUM,
			values: ['undefined', 'steel', 'aluminum', 'composite'],
			defaultValue: 'undefined',
			allowNull: false,
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		modelName: 'Cylinder',
		sequelize,
	},
)

Cylinder.belongsTo(Client, { foreignKey: 'ownerId' })
Client.hasMany(Cylinder, { foreignKey: 'ownerId' })

// Cylinder.sync({ alter: true })
