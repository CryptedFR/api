import vine from "@vinejs/vine";
import type { FieldContext } from "@vinejs/vine/types";

async function age(value: unknown, _: unknown, field: FieldContext) {
	if (!(value instanceof Date)) return;

	const today = new Date();
	const ageDate = new Date(
		today.getFullYear() - 13,
		today.getMonth(),
		today.getDate(),
	);

	if (value > ageDate) {
		field.report("The {{ field }} must be at least 13 years old", "age", field);
	}
}

const minAgeRule = vine.createRule(age);

export default minAgeRule;
