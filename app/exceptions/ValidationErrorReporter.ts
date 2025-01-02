import { errors } from "@vinejs/vine";
import type { ErrorReporterContract, FieldContext } from "@vinejs/vine/types";

export class ValidationErrorReporter implements ErrorReporterContract {
	hasErrors = false;

	errors: Array<{ code: string; field: string }> = [];

	report(message: string, rule: string, field: FieldContext, meta?: unknown) {
		this.hasErrors = true;

		this.errors.push({
			code: rule,
			field: field.wildCardPath,
		});
	}
	createError() {
		return new errors.E_VALIDATION_ERROR(this.errors);
	}
}
