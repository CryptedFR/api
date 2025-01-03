import { UserFactory } from "#database/factories/user_factory";
import Friendship from "#models/friendship";
import User from "#models/user";
import testUtils from "@adonisjs/core/services/test_utils";
import { test } from "@japa/runner";
import { errorCodes, successCodes } from "../../../types/response_codes.js";

test.group("Friendship block", (group) => {
	let user1: User;
	let user2: User;
	let user3: User;

	let user_1_token: string;
	let user_2_token: string;
	let user_3_token: string;

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
		const { token: user3Token } = (
			await User.accessTokens.create(user3)
		).toJSON();
		user_1_token = token as string;
		user_2_token = user2Token as string;
		user_3_token = user3Token as string;

		await Friendship.create({
			requesterId: user3.id,
			recipientId: user1.id,
			status: "accepted",
		});
	});

	test("Should success when user 1 blocks user 2", async ({
		client,
		assert,
	}) => {
		const response = await client
			.patch(`/v1/friendship/block/${user2.id}`)
			.header("Authorization", `Bearer ${user_1_token}`);

		response.assertStatus(200);
		assert.equal(response.body().code, successCodes.FRIENDSHIP_USER_BLOCKED);
	});
	test("Should fail when user 1 tries to block again user 2", async ({
		client,
		assert,
	}) => {
		const response = await client
			.patch(`/v1/friendship/block/${user2.id}`)
			.header("Authorization", `Bearer ${user_1_token}`);

		response.assertStatus(403);
		assert.equal(
			response.body().code,
			errorCodes.FRIENDSHIP_USER_IS_ALREADY_BLOCKED,
		);
	});
	test("Should success when user 3 blocks user 1", async ({
		client,
		assert,
	}) => {
		const response = await client
			.patch(`/v1/friendship/block/${user1.id}`)
			.header("Authorization", `Bearer ${user_3_token}`);

		response.assertStatus(200);
		assert.equal(response.body().code, successCodes.FRIENDSHIP_USER_BLOCKED);
	});
	test("Should success when user 2 blocks user 1", async ({
		client,
		assert,
	}) => {
		const response = await client
			.patch(`/v1/friendship/block/${user1.id}`)
			.header("Authorization", `Bearer ${user_2_token}`);

		response.assertStatus(200);
		assert.equal(response.body().code, successCodes.FRIENDSHIP_USER_BLOCKED);
	});
	test("Should fail when user tries block inexistant user", async ({
		client,
		assert,
	}) => {
		const response = await client
			.patch("/v1/friendship/block/234")
			.header("Authorization", `Bearer ${user_2_token}`);

		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);
		assert.equal(response.body().errors[0].code, "exists");
		assert.equal(response.body().errors[0].field, "userId");
	});
});
