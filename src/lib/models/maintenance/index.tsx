import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	DataTypes,
} from 'sequelize'
import { sequelize } from '../config'
import dayjs from 'dayjs'

export class Maintenance extends Model<
	InferAttributes<Maintenance>,
	InferCreationAttributes<Maintenance>
> {
	declare id: CreationOptional<number>

	declare type:
		| 'start'
		| 'air-test'
		| 'general'
		| 'filter-change'
		| 'oil-change'
		| 'unknown'

	declare description?: string

	declare date: dayjs.Dayjs

	declare hours: number

	// timestamps!
	// createdAt can be undefined during creation
	declare createdAt: CreationOptional<Date>
	// updatedAt can be undefined during creation
	declare updatedAt: CreationOptional<Date>
}

Maintenance.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		description: {
			type: DataTypes.STRING,
			validate: {
				len: [0, 255],
			},
		},
		hours: {
			type: DataTypes.FLOAT(10, 2),
			allowNull: false,
		},
		date: {
			type: DataTypes.DATE,
			allowNull: false,
			get() {
				return dayjs(this.getDataValue('date'))
			},
		},
		type: {
			type: DataTypes.ENUM,
			values: [
				'start',
				'air-test',
				'general',
				'filter-change',
				'oil-change',
				'unknown',
			],
			allowNull: false,
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		tableName: 'Maintenance',
		modelName: 'Maintenance',
		sequelize,
	},
)
