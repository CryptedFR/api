import factory from "@adonisjs/lucid/factories";
import User from "#models/user";
import { generateUsername } from "#tests/user_request_factory";
import { ProfileFactory } from "./profile_factory.js";

export const UserFactory = factory
	.define(User, async ({ faker }) => {
		return {
			username: generateUsername(),
			email: faker.internet.email().toLowerCase(),
			password: "password123",
		};
	})
	.relation("profile", () => ProfileFactory)
	.build();
