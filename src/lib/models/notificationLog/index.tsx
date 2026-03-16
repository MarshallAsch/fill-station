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
import { Cylinder } from '../cylinder'

export class NotificationLog extends Model<
	InferAttributes<NotificationLog>,
	InferCreationAttributes<NotificationLog>
> {
	declare id: CreationOptional<number>
	declare userId: ForeignKey<string>
	declare type: 'hydro_reminder' | 'visual_reminder'
	declare cylinderId: ForeignKey<number>
	declare reminderDays: number
	declare sentAt: string
}

NotificationLog.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		userId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: { model: User, key: 'id' },
		},
		type: {
			type: DataTypes.ENUM('hydro_reminder', 'visual_reminder'),
			allowNull: false,
		},
		cylinderId: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: false,
			references: { model: Cylinder, key: 'id' },
		},
		reminderDays: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		sentAt: {
			type: DataTypes.DATEONLY,
			allowNull: false,
		},
	},
	{
		modelName: 'NotificationLog',
		tableName: 'notification_logs',
		sequelize,
		underscored: true,
		timestamps: false,
		indexes: [
			{
				name: 'notification_logs_dedup_idx',
				fields: ['user_id', 'type', 'cylinder_id', 'reminder_days', 'sent_at'],
			},
		],
	},
)
