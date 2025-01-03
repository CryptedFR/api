import { faker } from "@faker-js/faker";

interface UserOverrides {
	username?: string;
	email?: string;
	firstname?: string;
	lastname?: string;
	password?: string;
	password_confirmation?: string;
	birthdate?: string;
}

export const generateUsername = () => {
	const firstName = faker.person.firstName().toLowerCase();
	const lastName = faker.person.lastName().toLowerCase();

	// Combine prénom et nom avec un séparateur autorisé
	return `${firstName}.${lastName}`.replace(/[^a-z0-9._-]/g, "").slice(0, 16);
};

export const buildUser = (overrides?: UserOverrides) => {
	const password = overrides?.password || "L0v3D01phin$";
	return {
		username: overrides?.username || generateUsername(),
		email: overrides?.email || faker.internet.email().toLowerCase(),
		firstname: overrides?.firstname || faker.person.firstName(),
		lastname: overrides?.lastname || faker.person.lastName(),
		password: password,
		password_confirmation: overrides?.password_confirmation || password,
		birthdate:
			overrides?.birthdate ||
			faker.date
				.birthdate({ min: 13, max: 90, mode: "age" })
				.toISOString()
				.split("T")[0],
	};
};
