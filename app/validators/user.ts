import vine from "@vinejs/vine";
import uniqueRule from "./rules/unique.js";
import minAgeRule from "./rules/age.js";

/**
 * Validator for creating a user.
 *
 * Validates:
 * - `username`: Alphanumeric, underscores or hyphens, 3-16 characters, must be unique.
 * - `email`: Valid email address, must be unique.
 * - `password`: Minimum 8 characters, must include uppercase, lowercase, number, and special character.
 * - `firstname`: Maximum 100 characters, only letters, spaces, or hyphens.
 * - `lastname`: Maximum 100 characters, only letters, spaces, or hyphens.
 * - `birthdate`: Valid date.
 */
export const createUserSchema = vine.object({
	username: vine
		.string()
		.trim()
		.minLength(3)
		.maxLength(40)
		.regex(/^[a-zA-Z0-9](?!.*\.\.)[a-zA-Z0-9._-]{1,14}[a-zA-Z0-9]$/)
		.use(uniqueRule({ table: "users", column: "username" })),
	email: vine
		.string()
		.email()
		.use(uniqueRule({ table: "users", column: "email" })),
	password: vine
		.string()
		.trim()
		.minLength(8)
		.confirmed()
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
		),
	firstname: vine
		.string()
		.trim()
		.maxLength(100)
		.regex(/^[a-zA-ZÀ-Ÿ- ]*$/),
	lastname: vine
		.string()
		.trim()
		.maxLength(100)
		.regex(/^[a-zA-ZÀ-Ÿ- ]*$/),
	birthdate: vine.date().use(minAgeRule()),
});
export const createUserValidator = vine.compile(createUserSchema);

/**
 * Validator for updating user's username.
 *
 * Validates:
 * - `username`: Same rules as in createUserValidator.
 */
export const updateUsernameSchema = vine.object({
	username: vine
		.string()
		.trim()
		.minLength(3)
		.maxLength(40)
		.regex(/^[a-zA-Z0-9_-]{3,16}$/)
		.use(uniqueRule({ table: "users", column: "username" })),
});
export const updateUsernameValidator = vine.compile(updateUsernameSchema);

/**
 * Validator for updating user's email.
 *
 * Validates:
 * - `email`: Same rules as in createUserValidator.
 */
export const updateEmailSchema = vine.object({
	email: vine
		.string()
		.email()
		.use(uniqueRule({ table: "users", column: "email" })),
});
export const updateEmailValidator = vine.compile(updateEmailSchema);

/**
 * Validator for updating a user's lastname.
 *
 * Validates:
 * - `lastname`: Maximum 100 characters, only letters, spaces, or hyphens.
 */
export const updateLastnameSchema = vine.object({
	lastname: vine
		.string()
		.trim()
		.maxLength(100)
		.regex(/^[a-zA-ZÀ-Ÿ- ]*$/),
});
export const updateLastnameValidator = vine.compile(updateLastnameSchema);

/**
 * Validator for updating a user's password.
 *
 * Validates:
 * - `password`: Minimum 8 characters, must include uppercase, lowercase, number, and special character.
 */
export const updatePasswordSchema = vine.object({
	old_password: vine.string().trim(),
	password: vine
		.string()
		.trim()
		.minLength(8)
		.confirmed()
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
		),
});
export const updatePasswordValidator = vine.compile(updatePasswordSchema);

/**
 * Validator for authenticating a user.
 *
 * Validates:
 * - `identifier`: Username or email.
 * - `password`: Required password.
 */
export const authenticateUserSchema = vine.object({
	identifier: vine.string(),
	password: vine.string().trim(),
});
export const authenticateUserValidator = vine.compile(authenticateUserSchema);

/**
 * Validator for uploading an avatar.
 *
 * Validates:
 * - `avatar`: File must be a valid image (png, jpg, jpeg, webp) and no larger than 2MB.
 */
export const uploadAvatarSchema = vine.object({
	avatar: vine.file({
		extnames: ["png", "jpg", "jpeg", "webp"],
		size: "2mb",
	}),
});
export const uploadAvatarValidator = vine.compile(uploadAvatarSchema);
