import type { HttpContext } from "@adonisjs/core/http";
import { UserService } from "#services/user_service";
import { authenticateUserValidator } from "#validators/user";
import { successCodes } from "../../types/response_codes.js";
import { SuccessResponse } from "../utils/HttpResponse.js";

export default class AuthController {
	private userService = new UserService();
	async authenticate({ request, response }: HttpContext) {
		const payload = await request.validateUsing(authenticateUserValidator);

		const token = await this.userService.authenticateUser(payload);

		return SuccessResponse(response, 201, successCodes.AUTH_SUCCESS, token);
	}

	async logout({ auth, response }: HttpContext) {
		const user = auth.getUserOrFail();

		await this.userService.logoutUser(user);

		return SuccessResponse(response, 200, successCodes.LOGOUT_SUCCESS);
	}
}
