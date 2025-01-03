import vine from "@vinejs/vine";
import existsRule from "./rules/exists.js";
import friendshipExistsRule from "./rules/friendship.js";

export const requestFriendshipSchema = vine.object({
	friendId: vine
		.number()
		.use(existsRule({ table: "users", column: "id" }))
		.use(friendshipExistsRule()),
});
export const requestFriendshipValidator = vine.compile(requestFriendshipSchema);

export const actionFriendshipSchema = vine.object({
	requestId: vine
		.number()
		.use(existsRule({ table: "friendships", column: "id" })),
});

export const actionFriendshipValidator = vine.compile(actionFriendshipSchema);

export const blockUserSchema = vine.object({
	userId: vine.number().use(existsRule({ table: "users", column: "id" })),
});
export const blockUserValidator = vine.compile(blockUserSchema);
