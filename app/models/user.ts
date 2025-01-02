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
	hasOne,
} from "@adonisjs/lucid/orm";
import type { HasOne } from "@adonisjs/lucid/types/relations";
import type { DateTime } from "luxon";
import Profile from "./profile.js";

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

	@beforeFind()
	@beforeFetch()
	public static preloadProfile(user: User) {
		user.preload("profile");
	}
}
