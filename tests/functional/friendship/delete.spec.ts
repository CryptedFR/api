import { UserFactory } from "#database/factories/user_factory";
import Friendship from "#models/friendship";
import User from "#models/user";
import testUtils from "@adonisjs/core/services/test_utils";
import { test } from "@japa/runner";
import { errorCodes, successCodes } from "../../../types/response_codes.js";

test.group("Friendship delete", (group) => {
	let user1: User;
	let user2: User;
	let user3: User;

	let user_1_token: string;
	let user_2_token: string;

	let friendship_accepted_id: number;
	let blocked_id: number;

	group.setup(async () => {
		const truncateDb = await testUtils.db().truncate();
		await truncateDb();
		const users = await UserFactory.with("profile").createMany(3);

		user1 = users[0];
		user2 = users[1];
		user3 = users[2];

		const { token } = (await User.accessTokens.create(user1)).toJSON();
		const { token: user2Token } = (
			await User.accessTokens.create(user2)
		).toJSON();
		user_1_token = token as string;
		user_2_token = user2Token as string;

		const { id } = await Friendship.create({
			requesterId: user1.id,
			recipientId: user2.id,
			status: "accepted",
		});

		friendship_accepted_id = id;

		const { id: blockedId } = await Friendship.create({
			requesterId: user3.id,
			recipientId: user2.id,
			status: "blocked",
		});

		blocked_id = blockedId;
	});
	test("Should success when user 1 remove user 2 from friends", async ({
		client,
		assert,
	}) => {
		const response = await client
			.delete(`/v1/friendship/friend/${friendship_accepted_id}`)
			.header("Authorization", `Bearer ${user_1_token}`);

		response.dumpBody();
		response.assertStatus(200);
		assert.equal(response.body().code, successCodes.FRIENDSHIP_DELETED);
	});

	test("Should fail when user 1 try to delete unknown request", async ({
		client,
		assert,
	}) => {
		const response = await client
			.delete("/v1/friendship/friend/23")
			.header("Authorization", `Bearer ${user_1_token}`);

		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);

		assert.equal(response.body().errors[0].code, "exists");
		assert.equal(response.body().errors[0].field, "requestId");
	});

	test("Should fail when user 2 try to delete blocked request from user 3", async ({
		client,
		assert,
	}) => {
		const response = await client
			.delete(`/v1/friendship/friend/${blocked_id}`)
			.header("Authorization", `Bearer ${user_2_token}`);

		response.assertStatus(404);
		assert.equal(response.body().code, errorCodes.FRIENDSHIP_REQUEST_NOT_FOUND);
	});
});
