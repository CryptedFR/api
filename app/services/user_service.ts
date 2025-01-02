import type { AccessToken } from "@adonisjs/auth/access_tokens";
import { Exception } from "@adonisjs/core/exceptions";
import User from "#models/user";
import { errorCodes } from "../../types/response_codes.js";
import type {
	AuthenticateUserPayload,
	CreateUserPayload,
	UpdateEmailPayload,
	UpdateLastnamePayload,
	UpdatePasswordPayload,
	UpdateUsernamePayload,
	UploadAvatarPayload,
} from "../../types/user.js";
import { deleteFileFromDisk, moveFileToDisk } from "./drive_service.js";
import hash from "@adonisjs/core/services/hash";

export class UserService {
	async createUser(payload: CreateUserPayload) {
		const userPayload = {
			username: payload.username,
			email: payload.email,
			password: payload.password,
		};

		const profilePayload = {
			firstname: payload.firstname,
			lastname: payload.lastname,
			birth_date: payload.birthdate,
		};

		const user = await User.create(userPayload);
		await user.related("profile").create(profilePayload);

		const fullUser = await User.findOrFail(user.id);

		return fullUser;
	}

	async updateLastname(payload: UpdateLastnamePayload) {
		payload.user.profile.lastname = payload.lastname;
		await payload.user.profile.save();
	}

	async updateUsername(payload: UpdateUsernamePayload) {
		payload.user.username = payload.username;
		await payload.user.save();
	}

	async updateEmail(payload: UpdateEmailPayload) {
		payload.user.email = payload.email;
		await payload.user.save();
	}

	async updatePassword(payload: UpdatePasswordPayload) {
		const passwordVerify = await hash.verify(
			payload.user.password,
			payload.old_password,
		);

		if (!passwordVerify) {
			throw new Exception("Old password is invalid", {
				status: 422,
				code: errorCodes.INVALID_OLD_PASSWORD,
			});
		}

		payload.user.password = payload.password;
		await payload.user.save();
	}

	async deleteUser(user: User) {
		if (user.profile.avatar !== null) {
			await deleteFileFromDisk(user.profile.avatar);
		}

		await user.delete();
	}

	async uploadAvatar(payload: UploadAvatarPayload) {
		const url = await moveFileToDisk(payload.avatar, "avatar");

		if (payload.user.profile.avatar !== null) {
			await deleteFileFromDisk(payload.user.profile.avatar);
		}

		payload.user.profile.avatar = url;
		await payload.user.profile.save();
	}

	async deleteAvatar(user: User) {
		if (!user.profile.avatar) {
			throw new Exception("Avatar is null", {
				status: 403,
				code: errorCodes.AVATAR_IS_NULL,
			});
		}

		const url = user.profile.avatar;

		await deleteFileFromDisk(url);

		user.profile.avatar = null;
		await user.profile.save();
	}

	async authenticateUser(
		payload: AuthenticateUserPayload,
	): Promise<AccessToken> {
		const user = await User.verifyCredentials(
			payload.identifier,
			payload.password,
		);

		const token = await User.accessTokens.create(user, ["*"], {
			expiresIn: "30days",
		});

		return token;
	}

	async logoutUser(
		user: User & {
			currentAccessToken: AccessToken;
		},
	) {
		await User.accessTokens.delete(user, user.currentAccessToken.identifier);
	}
}
