import db from "@adonisjs/lucid/services/db";
import vine from "@vinejs/vine";
import type { FieldContext } from "@vinejs/vine/types";

/**
 * Options for the exists rule.
 *
 * @typedef {Object} Options
 * @property {string} table - The name of the database table to check against.
 * @property {string} column - The column to look up the value in.
 */
type Options = {
	table: string;
	column: string;
};

/**
 * Asynchronous validation function to check if a value exists in the database.
 *
 * @param {unknown} value - The value to validate.
 * @param {Options} options - The options specifying the table and column for existence check.
 * @param {FieldContext} field - The field context for reporting validation errors.
 * @returns {Promise<void>} Resolves when the validation is complete.
 */
async function exists(value: unknown, options: Options, field: FieldContext) {
	if (typeof value !== "string") return;

	const row = await db
		.from(options.table)
		.select(options.column)
		.where(options.column, value)
		.first();

	if (!row) {
		field.report("The {{ field }} field does not exist", "exists", field);
	}
}

/**
 * A VineJS custom validation rule to enforce existence.
 *
 * This rule checks if a value exists in a specific database column.
 */
const existsRule = vine.createRule(exists);

export default existsRule;
