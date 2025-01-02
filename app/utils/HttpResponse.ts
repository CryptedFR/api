import type { AccessToken } from "@adonisjs/auth/access_tokens";
import type { HttpContext } from "@adonisjs/core/http";
import type { successCodes } from "../../types/response_codes.js";

/**
 * Sends a successful JSON response.
 *
 * @param response - The AdonisJS response object.
 * @param {number} statusCode - HTTP status code for the response (default is 200).
 * @param code - A code indicating the type of success.
 * @param {object} data - Data to include in the response.
 * @param {AccessToken} [token] - Optional access token to include in the response.
 * @returns {void} - Sends the JSON response and does not return any value.
 */
export function SuccessResponse(
	response: HttpContext["response"],
	statusCode: number,
	code: successCodes,
	data?: object,
	token?: AccessToken,
) {
	return response.safeStatus(statusCode).json({
		status: "success",
		statusCode,
		code,
		data,
		token,
	});
}

/**
 * Sends an error JSON response.
 *
 * @param response - The AdonisJS response object.
 * @param {number} statusCode - HTTP status code for the response (default is 400).
 * @param  code - A string indicating the type of error.
 * @param {object} [errors] - Optional details about the error(s).
 * @returns {void} - Sends the JSON response and does not return any value.
 */
export function ErrorResponse(
	response: HttpContext["response"],
	statusCode: number,
	code: string,
	message: string,
	errors?: object,
) {
	return response.safeStatus(statusCode).json({
		status: "error",
		statusCode,
		code,
		message,
		errors,
	});
}
