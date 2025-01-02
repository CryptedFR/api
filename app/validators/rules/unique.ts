import db from "@adonisjs/lucid/services/db";
import vine from "@vinejs/vine";
import type { FieldContext } from "@vinejs/vine/types";

/**
 * Options for the unique rule.
 *
 * @typedef {Object} Options
 * @property {string} table - The name of the database table.
 * @property {string} column - The column to check for uniqueness.
 */
type Options = {
	table: string;
	column: string;
};

/**
 * Asynchronous validation function to check if a value is unique in the database.
 *
 * @param {unknown} value - The value to validate.
 * @param {Options} options - The options specifying the table and column for uniqueness.
 * @param {FieldContext} field - The field context for reporting validation errors.
 * @returns {Promise<void>} Resolves when the validation is complete.
 */

async function unique(value: unknown, options: Options, field: FieldContext) {
	if (typeof value !== "string") return;

	const row = await db
		.from(options.table)
		.select(options.column)
		.where(options.column, value)
		.first();

	if (row) {
		field.report("The {{ field }} field is not unique", "unique", field);
	}
}

/**
 * A VineJS custom validation rule to enforce uniqueness.
 *
 * This rule checks if a value is unique in a specific database column.
 */
const uniqueRule = vine.createRule(unique);

export default uniqueRule;
