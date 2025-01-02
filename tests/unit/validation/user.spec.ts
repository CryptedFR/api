import { test } from "@japa/runner";
import vine from "@vinejs/vine";
import { createUserSchema } from "#validators/user";
import { errorCodes } from "../../../types/response_codes.js";

test.group("Validating user", () => {
	const valid_users = [
		{
			username: "johndoe13",
			email: "john.doe13@gmail.com",
			firstname: "John",
			lastname: "Doe",
			password: "John123Doe$*",
			password_confirmation: "John123Doe$*",
			birthdate: "1956-01-31",
		},
		{
			username: "johnnydee22",
			email: "johnnydee@pm.me",
			firstname: "Johnny",
			lastname: "Dee",
			password: "DeezNut$51",
			password_confirmation: "DeezNut$51",
			birthdate: "1987-04-22",
		},
		{
			username: "michael3",
			email: "mika-cool3@yahoo.fr",
			firstname: "Michael",
			lastname: "Dans",
			password: "L0veD01phin$",
			password_confirmation: "L0veD01phin$",
			birthdate: "2004-12-12",
		},
	];
	const invalid_users = [
		{
			username: "<script>johndoe13</script>",
			email: "john.doe13@gmail.com",
			firstname: "John</>",
			lastname: "Doe*",
			password: "John123Doe$-",
			password_confirmation: "John123Doe$-",
			birthdate: "1956-01-31",
		},
		{
			username:
				"johnnydee22johnnydee22johnnydee22johnnydee22johnnydee22johnnydee22johnnydee22johnnydee22johnnydee22johnnydee22",
			email: "johnnydee@pm.me",
			firstname: "Johnny",
			lastname: "Dee",
			password: "DeezNut$51",
			password_confirmation: "DeezNut$51",
			birthdate: "1987-04-22",
		},
		{
			username: "michael3",
			email: "mika-cool3@yahoo.fr",
			firstname: "Michael",
			lastname: "Dans",
			password: "password123",
			password_confirmation: "password123",
			birthdate: "2004-12-12",
		},
		{
			username: "jordanloool",
			email: "jordy3@apple.com",
			firstname: "Jordan",
			lastname: "McField",
			password: "L0veD01phin$",
			password_confirmation: "L0veD01phin$",
			birthdate: "2019-05-19",
		},
	];

	test("Should success validating for valid user {$i}")
		.with(valid_users)
		.run(async ({ assert }, user) => {
			try {
				await vine.validate({
					schema: createUserSchema,
					data: user,
				});
			} catch (error) {
				assert.fail("Validation should have passed");
			}
		});
	test("Should fail validating for invalid user {$i}")
		.with(invalid_users)
		.run(async ({ assert }, user) => {
			try {
				await vine.validate({ schema: createUserSchema, data: user });

				assert.fail("Validation should have failed but passed");
			} catch (error) {
				assert.exists(error);
				assert.equal(error.code, errorCodes.VALIDATION_ERROR);
				assert.isArray(error.messages);
			}
		});
});
