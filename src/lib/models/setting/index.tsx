import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	DataTypes,
} from 'sequelize'
import { sequelize } from '../config'

export class Setting extends Model<
	InferAttributes<Setting>,
	InferCreationAttributes<Setting>
> {
	declare key: string
	declare value: string
}

Setting.init(
	{
		key: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		value: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
	},
	{
		modelName: 'setting',
		sequelize,
		underscored: true,
		timestamps: false,
	},
)
