import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "friendships";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments("id");
			table
				.integer("requester_id")
				.references("id")
				.inTable("users")
				.onDelete("CASCADE");
			table
				.integer("recipient_id")
				.references("id")
				.inTable("users")
				.onDelete("CASCADE");
			table
				.enum("status", ["accepted", "pending", "blocked"])
				.defaultTo("pending");
			table.timestamp("created_at");
			table.timestamp("updated_at");
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
