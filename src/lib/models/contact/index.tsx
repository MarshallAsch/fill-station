import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	DataTypes,
} from 'sequelize'
import { sequelize } from '../config'

export class Contact extends Model<
	InferAttributes<Contact>,
	InferCreationAttributes<Contact>
> {
	declare id: CreationOptional<number>

	declare name: string
	declare email: string
	declare message: string

	declare status: CreationOptional<'submited' | 'responded' | 'closed' | 'spam'>

	// timestamps!
	// createdAt can be undefined during creation
	declare createdAt: CreationOptional<Date>
	// updatedAt can be undefined during creation
	declare updatedAt: CreationOptional<Date>
}

Contact.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
		},
		email: {
			type: DataTypes.STRING,
			validate: {
				isEmail: true,
			},
		},
		status: {
			type: DataTypes.ENUM,
			defaultValue: 'submited',
			values: ['submited', 'responded', 'closed', 'spam'],
		},
		message: {
			type: DataTypes.TEXT,
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		tableName: 'Contacts',
		modelName: 'Contact',
		sequelize,
	},
)
