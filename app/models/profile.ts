import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import User from "./user.js";

export default class Profile extends BaseModel {
	@column({ isPrimary: true })
	declare id: number;

	@column()
	declare userId: number;

	@column()
	declare firstname: string;

	@column()
	declare lastname: string;

	@column()
	declare avatar: string | null;

	@column()
	declare birth_date: Date;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@belongsTo(() => User)
	declare user: BelongsTo<typeof User>;
}
