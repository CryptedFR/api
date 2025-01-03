import { DbAccessTokensProvider } from "@adonisjs/auth/access_tokens";
import { withAuthFinder } from "@adonisjs/auth/mixins/lucid";
import { compose } from "@adonisjs/core/helpers";
import hash from "@adonisjs/core/services/hash";
import {
	BaseModel,
	beforeFetch,
	beforeFind,
	column,
	computed,
	hasMany,
	hasOne,
} from "@adonisjs/lucid/orm";
import type { HasMany, HasOne } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import Profile from "./profile.js";
import Friendship from "./friendship.js";

const AuthFinder = withAuthFinder(() => hash.use("argon"), {
	uids: ["username", "email"],
	passwordColumnName: "password",
});

export default class User extends compose(BaseModel, AuthFinder) {
	@column({ isPrimary: true })
	declare id: number;

	@column()
	declare username: string;

	@column()
	declare email: string;

	@computed()
	public get firstname(): string | null {
		return this.profile?.firstname || null;
	}

	@computed()
	public get lastname(): string | null {
		return this.profile?.lastname || null;
	}

	@computed()
	public get avatar(): string | null {
		return this.profile?.avatar || null;
	}

	@computed()
	public get birthDate(): Date | null {
		return this.profile?.birth_date || null;
	}

	@column({ serializeAs: null })
	declare password: string;

	@column.dateTime({ autoCreate: true })
	declare createdAt: DateTime;

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	declare updatedAt: DateTime | null;

	static accessTokens = DbAccessTokensProvider.forModel(User);

	@hasOne(() => Profile, {
		serializeAs: null,
	})
	declare profile: HasOne<typeof Profile>;

	@hasMany(() => Friendship, { foreignKey: "requesterId" })
	public sentRequests!: HasMany<typeof Friendship>;

	@hasMany(() => Friendship, { foreignKey: "recipientId" })
	public receivedRequests!: HasMany<typeof Friendship>;

	public async listPendingSentRequests(this: User) {
		const requests = await this.related("sentRequests")
			.query()
			.where("status", "pending")
			.preload("recipient");

		return requests.map((request) => ({
			id: request.id,
			status: request.status,
			createdAt: request.createdAt,
			requesterId: request.requesterId,
			recipient: {
				id: request.recipient.id,
				username: request.recipient.username,
				firstname: request.recipient.firstname,
				lastname: request.recipient.lastname,
				avatar: request.recipient.avatar,
			},
		}));
	}

	public async listPendingReceivedRequests(this: User) {
		const requests = await this.related("receivedRequests")
			.query()
			.where("status", "pending")
			.preload("requester");

		return requests.map((request) => ({
			id: request.id,
			status: request.status,
			createdAt: request.createdAt,
			recipientId: request.recipientId,
			requester: {
				id: request.requester.id,
				username: request.requester.username,
				firstname: request.requester.firstname,
				lastname: request.requester.lastname,
				avatar: request.requester.avatar,
			},
		}));
	}

	public async listBlockedUsers(this: User) {
		const requests = await this.related("sentRequests")
			.query()
			.where("status", "blocked")
			.preload("recipient");

		return requests.map((request) => ({
			id: request.id,
			status: request.status,
			createdAt: request.createdAt,
			requesterId: request.requesterId,
			recipient: {
				id: request.recipient.id,
				username: request.recipient.username,
				firstname: request.recipient.firstname,
				lastname: request.recipient.lastname,
			},
		}));
	}

	public async listFriends(this: User) {
		const friends = await Friendship.query()
			.where((query) => {
				query.where("recipientId", this.id).orWhere("requesterId", this.id);
			})
			.andWhere("status", "accepted")
			.preload("requester")
			.preload("recipient");

		return friends.map((friend) => {
			if (friend.recipientId === this.id) return friend.requester;

			return friend.recipient;
		});
	}

	@beforeFind()
	@beforeFetch()
	public static preloadProfile(user: User) {
		user.preload("profile");
	}
}
