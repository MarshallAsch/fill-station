import {
	Model,
	InferAttributes,
	InferCreationAttributes,
	CreationOptional,
	ForeignKey,
	DataTypes,
} from 'sequelize'
import { sequelize } from '../config'
import { User } from '../user'

export class AuditLog extends Model<
	InferAttributes<AuditLog>,
	InferCreationAttributes<AuditLog>
> {
	declare id: CreationOptional<string>
	declare userId: ForeignKey<string>
	declare action: 'create' | 'update' | 'delete'
	declare entity: string
	declare entityId: string
	declare details: object | null
	declare createdAt: CreationOptional<Date>
}

AuditLog.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: User, key: 'id' },
		},
		action: {
			type: DataTypes.ENUM('create', 'update', 'delete'),
			allowNull: false,
		},
		entity: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		entityId: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		details: {
			type: DataTypes.JSON,
			allowNull: true,
		},
		createdAt: {
			type: DataTypes.DATE,
			defaultValue: DataTypes.NOW,
		},
	},
	{
		modelName: 'auditLog',
		sequelize,
		underscored: true,
		timestamps: false,
	},
)

AuditLog.belongsTo(User, { foreignKey: 'userId', as: 'user' })
