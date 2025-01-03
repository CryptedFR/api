import factory from "@adonisjs/lucid/factories";
import Profile from "#models/profile";

export const ProfileFactory = factory
	.define(Profile, async ({ faker }) => {
		return {
			firstname: faker.person.firstName(),
			lastname: faker.person.lastName(),
			avatar: faker.image.avatar(),
			birth_date: faker.date.birthdate({ min: 13, max: 90, mode: "age" }),
		};
	})
	.build();
