import { test } from "@japa/runner";
import { errorCodes, successCodes } from "../../../types/response_codes.js";
import testUtils from "@adonisjs/core/services/test_utils";
import { buildUser } from "#tests/user_request_factory";

test.group("User Creation", (group) => {
	group.setup(async () => {
		const func = await testUtils.db().truncate();
		await func();
	});

	test("Should create a user successfully with valid data", async ({
		assert,
		client,
	}) => {
		const payload = buildUser({
			email: "some-email@gmail.com",
			username: "SuperUser3",
		});

		const response = await client.post("/v1/user").json(payload);
		response.assertStatus(201);
		assert.equal(response.body().code, successCodes.USER_CREATED);

		assert.equal(response.body().data.username, payload.username);
		assert.equal(response.body().data.email, payload.email);
		assert.equal(response.body().data.firstname, payload.firstname);
		assert.equal(response.body().data.lastname, payload.lastname);
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

	test("Should fail when email is taken", async ({ client, assert }) => {
		const payload = buildUser({
			email: "some-email@gmail.com",
		});

		const response = await client.post("/v1/user").json(payload);

		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);

		assert.equal(response.body().errors[0].code, "unique");
		assert.equal(response.body().errors[0].field, "email");
	});

	test("Should fail when username is taken", async ({ client, assert }) => {
		const payload = buildUser({
			username: "SuperUser3",
		});

		const response = await client.post("/v1/user").json(payload);

		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);

		assert.equal(response.body().errors[0].code, "unique");
		assert.equal(response.body().errors[0].field, "username");
	});

	test("Should fail when password is too weak", async ({ client, assert }) => {
		const payload = buildUser({ password: "password123" });

		const response = await client.post("/v1/user").json(payload);

		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);

		assert.equal(response.body().errors[0].code, "regex");
		assert.equal(response.body().errors[0].field, "password");
	});

	test("Should fail when firstname contains not valid characters", async ({
		client,
		assert,
	}) => {
		const payload = buildUser({
			firstname: "John>",
		});

		const response = await client.post("/v1/user").json(payload);

		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);

		assert.equal(response.body().errors[0].code, "regex");
		assert.equal(response.body().errors[0].field, "firstname");
	});

	test("Should fail when user is under 13 years old", async ({
		client,
		assert,
	}) => {
		const payload = buildUser({
			birthdate: "2019-04-24",
		});

		const response = await client.post("/v1/user").json(payload);

		response.assertStatus(422);
		assert.equal(response.body().code, errorCodes.VALIDATION_ERROR);

		assert.equal(response.body().errors[0].code, "age");
		assert.equal(response.body().errors[0].field, "birthdate");
	});
});
