import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	NonAttribute,
	ForeignKey,
	DataTypes,
} from 'sequelize'
import { sequelize } from '../config'
import dayjs from 'dayjs'
import { Client } from '../client'

export class Cylinder extends Model<
	InferAttributes<Cylinder, { omit: 'owner' }>,
	InferCreationAttributes<Cylinder, { omit: 'owner' }>
> {
	// 'CreationOptional' is a special type that marks the field as optional
	// when creating an instance of the model (such as using Model.create()).
	declare id: CreationOptional<number>

	declare ownerId: ForeignKey<Client['id']>
	declare owner: NonAttribute<Client>

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
		},
		lastHydro: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
		lastVis: {
			type: DataTypes.DATEONLY,
			allowNull: false,
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

Cylinder.belongsTo(Client, { as: 'owner', foreignKey: 'ownerId' })
Client.hasMany(Cylinder)

Cylinder.sync({ alter: true })
