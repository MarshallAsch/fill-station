import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	NonAttribute,
	ForeignKey,
	DataTypes,
	HasOneGetAssociationMixin,
	HasOneSetAssociationMixin,
	Association,
} from 'sequelize'
import { sequelize } from '../config'
import { Cylinder } from '../cylinder'

import dayjs from 'dayjs'
import { Client } from '../client'

export class Visual extends Model<
	InferAttributes<Visual, { omit: 'Cylinder' | 'inspector' }>,
	InferCreationAttributes<Visual, { omit: 'Cylinder' }>
> {
	// 'CreationOptional' is a special type that marks the field as optional
	// when creating an instance of the model (such as using Model.create()).
	declare id: CreationOptional<number>

	declare CylinderId: ForeignKey<Cylinder['id']>
	declare Cylinder?: NonAttribute<Cylinder>

	declare valve: 'din' | 'yoke' | 'h' | 'none'

	declare heat: boolean
	declare painted: boolean
	declare odor: boolean
	declare bow: boolean
	declare bulges: boolean
	declare bell: boolean
	declare lineCorrosion: boolean

	declare exteriorDescription: string
	declare exteriorMarks: string
	declare externalStandards: 'acceptable' | 'marginal' | 'fail'

	declare internalContents: string
	declare internalDescription: string
	declare internalMarks: string
	declare internalStandards: 'acceptable' | 'marginal' | 'fail'

	declare threadingDescription: string
	declare badThreadCount: number
	declare threadingStandards: 'acceptable' | 'marginal' | 'fail'

	declare burstDiskReplaced: boolean
	declare oringReplaced: boolean
	declare dipTube: boolean
	declare needService: boolean
	declare rebuilt: boolean

	declare status: 'acceptable' | 'marginal' | 'fail'
	declare date: dayjs.Dayjs
	declare oxygenCleaned: boolean
	declare markedOxygenClean: boolean

	declare inspectorId: ForeignKey<Client['id']>
	declare inspector: NonAttribute<Client>

	// timestamps!
	// createdAt can be undefined during creation
	declare createdAt: CreationOptional<Date>
	// updatedAt can be undefined during creation
	declare updatedAt: CreationOptional<Date>

	declare getCylinder: HasOneGetAssociationMixin<Cylinder> // Note the null assertions!
	declare setCylinder: HasOneSetAssociationMixin<Cylinder, Cylinder['id']>

	declare getInspector: HasOneGetAssociationMixin<Client> // Note the null assertions!
	declare setInspector: HasOneSetAssociationMixin<Client, Client['id']>

	declare static associations: {
		cylinder: Association<Cylinder, Visual>
		inspector: Association<Cylinder, Client>
	}
}

Visual.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		valve: {
			type: DataTypes.ENUM,
			values: ['din', 'yoke', 'h', 'none'],
			defaultValue: 'din',
			allowNull: false,
		},
		heat: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		painted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		odor: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		bow: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		bulges: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		bell: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		lineCorrosion: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		exteriorDescription: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: '',
		},
		exteriorMarks: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: '',
		},
		externalStandards: {
			type: DataTypes.ENUM,
			values: ['acceptable', 'marginal', 'fail'],
			defaultValue: 'acceptable',
			allowNull: false,
		},
		internalContents: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: '',
		},
		internalDescription: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: '',
		},
		internalMarks: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: '',
		},
		internalStandards: {
			type: DataTypes.ENUM,
			values: ['acceptable', 'marginal', 'fail'],
			defaultValue: 'acceptable',
			allowNull: false,
		},
		threadingDescription: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: '',
		},
		badThreadCount: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			validate: {
				min: 0,
				max: 20,
			},
		},
		threadingStandards: {
			type: DataTypes.ENUM,
			values: ['acceptable', 'marginal', 'fail'],
			defaultValue: 'acceptable',
			allowNull: false,
		},
		burstDiskReplaced: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		oringReplaced: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		dipTube: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		needService: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		rebuilt: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		status: {
			type: DataTypes.ENUM,
			values: ['acceptable', 'marginal', 'fail'],
			defaultValue: 'acceptable',
			allowNull: false,
		},
		date: {
			type: DataTypes.DATE,
			get() {
				return dayjs(this.getDataValue('date'))
			},
		},
		oxygenCleaned: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		markedOxygenClean: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		modelName: 'Visual',
		sequelize,
	},
)

Visual.belongsTo(Cylinder)
Cylinder.hasMany(Visual)

Visual.belongsTo(Client, {
	foreignKey: {
		name: 'inspectorId',
		allowNull: false,
	},
})
Client.hasMany(Visual, {
	foreignKey: 'inspectorId',
})

// Visual.sync({ alter: true })
