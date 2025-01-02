import { test } from "@japa/runner";
import { errorCodes, successCodes } from "../../../types/response_codes.js";
import testUtils from "@adonisjs/core/services/test_utils";
import { buildUser } from "#tests/user_request_factory";

test.group("User authentication and logout", (group) => {
	group.setup(async () => {
		const func = await testUtils.db().truncate();
		await func();
	});
	let authToken: string;
	test("Should authenticate user successfully with valid credentials", async ({
		client,
		assert,
	}) => {
		await client.post("/v1/user").json(
			buildUser({
				username: "johndoe13",
				password: "Johndoe123*",
			}),
		);

		const response = await client.post("/v1/user/auth").json({
			identifier: "johndoe13",
			password: "Johndoe123*",
		});

		response.assertStatus(201);
		assert.equal(response.body().code, successCodes.AUTH_SUCCESS);

		assert.exists(response.body().data.token, "Token should be present");

		authToken = response.body().data.token;
	});
	test("Should fail when password is not correct", async ({
		client,
		assert,
	}) => {
		const response = await client.post("/v1/user/auth").json({
			identifier: "johndoe12",
			password: "john123*",
		});

		response.assertStatus(400);
		assert.equal(response.body().code, errorCodes.INVALID_CREDENTIALS);
	});

	test("Should successfully return user profile", async ({
		client,
		assert,
	}) => {
		const response = await client
			.get("/v1/user/me")
			.header("Authorization", `Bearer ${authToken}`);

		response.assertStatus(200);
		assert.equal(response.body().code, successCodes.SUCCESS);
		assert.exists(
			response.body().data.birthDate,
			"Birthdate should be returned",
		);
		assert.exists(response.body().data.id, "User ID should be returned");
		assert.exists(
			response.body().data.createdAt,
			"Creation timestamp should be returned",
		);
	});

	test("Should fail when token is invalid", async ({ client, assert }) => {
		const response = await client
			.get("/v1/user/me")
			.header("Authorization", "Bearer badToken");

		response.assertStatus(401);
		assert.equal(response.body().code, errorCodes.UNAUTHORIZED);
	});
});
