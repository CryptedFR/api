import type { DateTime } from "luxon";
import { BaseModel, belongsTo, column } from "@adonisjs/lucid/orm";
import User from "./user.js";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";
import { Exception } from "@adonisjs/core/exceptions";
import { errorCodes } from "../../types/response_codes.js";

export default class Friendship extends BaseModel {
	@column({ isPrimary: true })
	declare id: number;

	@column()
	declare requesterId: number;

	@column()
	declare recipientId: number;

	@column()
	declare status: string;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime;

	@belongsTo(() => User, {
		foreignKey: "requesterId",
	})
	public requester!: BelongsTo<typeof User>;

	@belongsTo(() => User, {
		foreignKey: "recipientId",
	})
	public recipient!: BelongsTo<typeof User>;

	public async acceptRequest(this: Friendship) {
		if (this.status !== "pending") {
			throw new Exception("Friendship request is not pending", {
				status: 403,
				code: errorCodes.FRIENDSHIP_REQUEST_NOT_PENDING,
			});
		}

		this.status = "accepted";

		await this.save();
		return this;
	}

	public async unblockUser() {
		if (this.status !== "blocked") {
			throw new Exception("User is not blocked", {
				status: 403,
				code: errorCodes.FRIENDSHIP_REQUEST_NOT_PENDING,
			});
		}

		await this.delete();
	}

	public async rejectRequest(this: Friendship) {
		if (this.status !== "pending") {
			throw new Exception("Friendship request is not pending", {
				status: 403,
				code: errorCodes.FRIENDSHIP_REQUEST_NOT_PENDING,
			});
		}

		await this.delete();
	}
	public async deleteFriendship(this: Friendship) {
		if (this.status !== "accepted") {
			throw new Exception("Friendship request is not accepted", {
				status: 403,
				code: errorCodes.FRIENDSHIP_REQUEST_NOT_PENDING,
			});
		}

		await this.delete();
	}
}
