import { UserFactory } from "#database/factories/user_factory";
import Friendship from "#models/friendship";
import User from "#models/user";
import testUtils from "@adonisjs/core/services/test_utils";
import { test } from "@japa/runner";
import { errorCodes, successCodes } from "../../../types/response_codes.js";

test.group("Friendship reject", (group) => {
	let user1: User;
	let user2: User;
	let user3: User;

	let user_1_token: string;
	let user_2_token: string;

	let friend_request_id: number;
	let blocked_request_id: number;

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

		await Friendship.create({
			requesterId: user1.id,
			recipientId: user2.id,
			status: "accepted",
		});

		const { id } = await Friendship.create({
			requesterId: user3.id,
			recipientId: user1.id,
			status: "pending",
		});
		friend_request_id = id;

		const { id: blockedId } = await Friendship.create({
			requesterId: 3,
			recipientId: 2,
			status: "blocked",
		});

		blocked_request_id = blockedId;
	});
	test("Should success when user 1 reject request", async ({
		client,
		assert,
	}) => {
		const response = await client
			.patch(`/v1/friendship/reject/${friend_request_id}`)
			.header("Authorization", `Bearer ${user_1_token}`);

		response.assertStatus(200);
		assert.equal(
			response.body().code,
			successCodes.FRIENDSHIP_REQUEST_REJECTED,
		);
	});

	test("Should fail when user 1 try to reject accepted request", async ({
		client,
		assert,
	}) => {
		const response = await client
			.patch(`/v1/friendship/reject/${friend_request_id}`)
			.header("Authorization", `Bearer ${user_1_token}`);

		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);
		assert.equal(response.body().errors[0].code, "exists");
		assert.equal(response.body().errors[0].field, "requestId");
	});
	test("Should fail when user 1 try to reject unknown request", async ({
		client,
		assert,
	}) => {
		const response = await client
			.patch("/v1/friendship/reject/23")
			.header("Authorization", `Bearer ${user_1_token}`);

		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);

		assert.equal(response.body().errors[0].code, "exists");
		assert.equal(response.body().errors[0].field, "requestId");
	});

	test("Should fail when user 2 try to reject blocked request from user 3", async ({
		client,
		assert,
	}) => {
		const response = await client
			.patch(`/v1/friendship/reject/${blocked_request_id}`)
			.header("Authorization", `Bearer ${user_2_token}`);

		response.assertStatus(404);
		assert.equal(response.body().code, errorCodes.FRIENDSHIP_REQUEST_NOT_FOUND);
	});
});
