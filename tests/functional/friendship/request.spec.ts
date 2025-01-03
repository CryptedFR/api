import { UserFactory } from "#database/factories/user_factory";
import User from "#models/user";
import testUtils from "@adonisjs/core/services/test_utils";
import { test } from "@japa/runner";
import { errorCodes, successCodes } from "../../../types/response_codes.js";
import Friendship from "#models/friendship";

test.group("Friendships creation", (group) => {
	let user1: User;
	let user2: User;
	let user3: User;
	let user_1_token: string;
	let user_2_token: string;

	group.setup(async () => {
		const truncateDb = await testUtils.db().truncate();
		await truncateDb();
		const users = await UserFactory.with("profile").createMany(3);

		user1 = users[0];
		user2 = users[1];
		user3 = users[2];

		const { token } = (await User.accessTokens.create(user1)).toJSON();
		user_1_token = token as string;

		const { token: user2Token } = (
			await User.accessTokens.create(user2)
		).toJSON();
		user_2_token = user2Token as string;

		await Friendship.create({
			requesterId: user3.id,
			recipientId: user1.id,
			status: "blocked",
		});
	});
	test("Should success when user 1 requesting user 2", async ({
		client,
		assert,
	}) => {
		const response = await client
			.post("/v1/friendship/request")
			.header("Authorization", `Bearer ${user_1_token}`)
			.json({
				friendId: user2.id,
			});

		response.assertStatus(201);
		assert.equal(response.body().code, successCodes.FRIENDSHIP_REQUEST_SENT);
	});

	test("Should fail when user 1 try request non existant user", async ({
		client,
		assert,
	}) => {
		const response = await client
			.post("/v1/friendship/request")
			.header("Authorization", `Bearer ${user_1_token}`)
			.json({
				friendId: 34,
			});
		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);

		assert.equal(response.body().errors[0].code, "exists");
		assert.equal(response.body().errors[0].field, "friendId");
	});

	test("Should fail when request already exists", async ({
		client,
		assert,
	}) => {
		const response = await client
			.post("/v1/friendship/request")
			.header("Authorization", `Bearer ${user_1_token}`)
			.json({
				friendId: user2.id,
			});

		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);
		assert.equal(response.body().errors[0].code, "friendship_exists");
		assert.equal(response.body().errors[0].field, "friendId");
	});

	test("Should fail when user 2 try to send friend request to user 1", async ({
		client,
		assert,
	}) => {
		const response = await client
			.post("/v1/friendship/request")
			.header("Authorization", `Bearer ${user_2_token}`)
			.json({
				friendId: user1.id,
			});

		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);

		assert.equal(response.body().errors[0].code, "friendship_exists");
		assert.equal(response.body().errors[0].field, "friendId");
	});

	test("Should fail when user try to request when he's blocked", async ({
		client,
		assert,
	}) => {
		const response = await client
			.post("/v1/friendship/request")
			.header("Authorization", `Bearer ${user_1_token}`)
			.json({
				friendId: user3.id,
			});

		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);
		assert.equal(response.body().errors[0].code, "friendship_exists");
		assert.equal(response.body().errors[0].field, "friendId");
	});

	test("Should list user 1 sent friend requests", async ({
		client,
		assert,
	}) => {
		const response = await client
			.get("/v1/friendship/sent")
			.header("Authorization", `Bearer ${user_1_token}`);

		response.assertStatus(200);
		assert.equal(response.body().code, successCodes.SUCCESS);

		assert.equal(response.body().data[0].requesterId, user1.id);
		assert.equal(response.body().data[0].recipient.id, user2.id);
	});
	test("Should list user 2 received friends requests", async ({
		client,
		assert,
	}) => {
		const response = await client
			.get("/v1/friendship/received")
			.header("Authorization", `Bearer ${user_2_token}`);

		response.assertStatus(200);
		assert.equal(response.body().code, successCodes.SUCCESS);

		assert.equal(response.body().data[0].recipientId, user2.id);
		assert.equal(response.body().data[0].requester.id, user1.id);
	});
});
