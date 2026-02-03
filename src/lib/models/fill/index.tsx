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
	Sequelize,
} from 'sequelize'
import { Cylinder } from '../cylinder'
import { sequelize } from '../config'
import dayjs from 'dayjs'

export class Fill extends Model<
	InferAttributes<Fill, { omit: 'cylinder' }>,
	InferCreationAttributes<Fill, { omit: 'cylinder' }>
> {
	// 'CreationOptional' is a special type that marks the field as optional
	// when creating an instance of the model (such as using Model.create()).
	declare id: CreationOptional<number>
	declare date: dayjs.Dayjs

	declare cylinderId: ForeignKey<Cylinder['id']>
	declare cylinder?: NonAttribute<Cylinder>

	declare startPressure: number
	declare endPressure: number

	declare oxygen: CreationOptional<number>
	declare helium: CreationOptional<number>

	// timestamps!
	// createdAt can be undefined during creation
	declare createdAt: CreationOptional<Date>
	// updatedAt can be undefined during creation
	declare updatedAt: CreationOptional<Date>

	declare getCylinder: HasOneGetAssociationMixin<Cylinder> // Note the null assertions!
	declare setCylinder: HasOneSetAssociationMixin<Cylinder, Cylinder['id']>

	declare static associations: {
		cylinder: Association<Cylinder, Fill>
	}
}

Fill.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		startPressure: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 0,
				max: 4500,
			},
		},
		endPressure: {
			type: DataTypes.INTEGER,
			allowNull: false,
			validate: {
				min: 0,
				max: 4500,
			},
		},
		oxygen: {
			type: DataTypes.FLOAT(5, 2),
			allowNull: false,
			defaultValue: 20.9,
			validate: {
				min: 0,
				max: 100,
			},
		},
		helium: {
			type: DataTypes.FLOAT(5, 2),
			allowNull: false,
			defaultValue: 0.0,
			validate: {
				min: 0,
				max: 100,
			},
		},
		date: {
			type: DataTypes.DATE,
			defaultValue: Sequelize.fn('now'),
			validate: {
				isAfter: '2024-11-01', // when I got the compressor, cant do a fill before that
			},
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		modelName: 'Fill',
		sequelize,
	},
)

Fill.belongsTo(Cylinder)
Cylinder.hasMany(Fill)

// Fill.sync({ alter: true })
