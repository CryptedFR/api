import type { MultipartFile } from "@adonisjs/core/types/bodyparser";
import type User from "#models/user";

export interface CreateUserPayload {
	username: string;
	email: string;
	password: string;
	firstname: string;
	lastname: string;
	birthdate: Date;
}

export interface UpdatePasswordPayload {
	old_password: string;
	password: string;
	user: User;
}

export interface UpdateLastnamePayload {
	lastname: string;
	user: User;
}

export interface UpdateUsernamePayload {
	username: string;
	user: User;
}

export interface UpdateEmailPayload {
	email: string;
	user: User;
}

export interface AuthenticateUserPayload {
	identifier: string;
	password: string;
}

export interface UploadAvatarPayload {
	avatar: MultipartFile;
	user: User;
}
