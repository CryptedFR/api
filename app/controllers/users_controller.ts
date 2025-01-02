import type { HttpContext } from "@adonisjs/core/http";
import { UserService } from "#services/user_service";
import {
	createUserValidator,
	updateEmailValidator,
	updateLastnameValidator,
	updatePasswordValidator,
	updateUsernameValidator,
	uploadAvatarValidator,
} from "#validators/user";
import { successCodes } from "../../types/response_codes.js";
import { SuccessResponse } from "../utils/HttpResponse.js";

export default class UsersController {
	private userService = new UserService();

	async me({ auth, response }: HttpContext) {
		const user = auth.getUserOrFail();

		return SuccessResponse(response, 200, successCodes.SUCCESS, user);
	}

	async store({ request, response }: HttpContext) {
		const payload = await request.validateUsing(createUserValidator);

		const user = await this.userService.createUser(payload);

		return SuccessResponse(response, 201, successCodes.USER_CREATED, user);
	}

	async updateLastname({ request, auth, response }: HttpContext) {
		const payload = await request.validateUsing(updateLastnameValidator);
		const user = auth.getUserOrFail();

		await this.userService.updateLastname({ lastname: payload.lastname, user });

		return SuccessResponse(response, 200, successCodes.USER_LASTNAME_UPDATED);
	}

	async updatePassword({ request, auth, response }: HttpContext) {
		const payload = await request.validateUsing(updatePasswordValidator);
		const user = auth.getUserOrFail();

		await this.userService.updatePassword({
			old_password: payload.old_password,
			password: payload.password,
			user,
		});

		return SuccessResponse(response, 200, successCodes.USER_PASSWORD_UPDATED);
	}

	async updateUsername({ request, auth, response }: HttpContext) {
		const payload = await request.validateUsing(updateUsernameValidator);
		const user = auth.getUserOrFail();

		await this.userService.updateUsername({ username: payload.username, user });

		return SuccessResponse(response, 200, successCodes.USER_USERNAME_UPDATED);
	}

	async updateEmail({ request, auth, response }: HttpContext) {
		const payload = await request.validateUsing(updateEmailValidator);
		const user = auth.getUserOrFail();

		await this.userService.updateEmail({ email: payload.email, user });

		return SuccessResponse(response, 200, successCodes.USER_EMAIL_UPDATED);
	}

	async uploadAvatar({ request, auth, response }: HttpContext) {
		const payload = await request.validateUsing(uploadAvatarValidator);
		const user = auth.getUserOrFail();

		await this.userService.uploadAvatar({ avatar: payload.avatar, user });

		return SuccessResponse(response, 200, successCodes.AVATAR_UPLOADED);
	}

	async removeAvatar({ auth, response }: HttpContext) {
		const user = auth.getUserOrFail();

		await this.userService.deleteAvatar(user);

		return SuccessResponse(response, 200, successCodes.AVATAR_DELETED);
	}

	async delete({ auth, response }: HttpContext) {
		const user = auth.getUserOrFail();

		await this.userService.deleteUser(user);

		return SuccessResponse(response, 200, successCodes.USER_DELETED);
	}
}
