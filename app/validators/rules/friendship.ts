import db from "@adonisjs/lucid/services/db";
import vine from "@vinejs/vine";
import type { FieldContext } from "@vinejs/vine/types";

async function friendshipExists(
	value: unknown,
	_: unknown,
	field: FieldContext,
) {
	if (typeof value !== "number") return;

	const row = await db
		.from("friendships")
		.select("id")
		.where((query) => {
			query
				.where("requester_id", field.meta.userId)
				.andWhere("recipient_id", value);
		})
		.orWhere((query) => {
			query
				.where("requester_id", value)
				.andWhere("recipient_id", field.meta.userId);
		})
		.first();

	if (row) {
		field.report(
			"A friendship request already exists between these users",
			"friendship_exists",
			field,
		);
	}
}

const friendshipExistsRule = vine.createRule(friendshipExists);

export default friendshipExistsRule;
