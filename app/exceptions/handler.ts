import type { Exception } from "@adonisjs/core/exceptions";
import { ExceptionHandler, type HttpContext } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";
import { errors as VineErrors } from "@vinejs/vine";
import { ErrorResponse } from "../utils/HttpResponse.js";

export default class HttpExceptionHandler extends ExceptionHandler {
	/**
	 * In debug mode, the exception handler will display verbose errors
	 * with pretty printed stack traces.
	 */
	protected debug = !app.inProduction;

	/**
	 * The method is used for handling errors and returning
	 * response to the client
	 */
	async handle(unknownError: unknown, ctx: HttpContext) {
		if (unknownError instanceof VineErrors.E_VALIDATION_ERROR) {
			return ErrorResponse(
				ctx.response,
				unknownError.status || 500,
				unknownError.code || "UNKNOWN_ERROR",
				unknownError.message,
				unknownError.messages,
			);
		}

		const error = unknownError as Exception;

		return ErrorResponse(
			ctx.response,
			error.status || 500,
			error.code || "UNKNOWN_ERROR",
			error.message,
		);
	}

	/**
	 * The method is used to report error to the logging service or
	 * the third party error monitoring service.
	 *
	 * @note You should not attempt to send a response from this method.
	 */
	async report(error: unknown, ctx: HttpContext) {
		return super.report(error, ctx);
	}
}
