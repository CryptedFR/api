import type User from "#models/user";

export interface RequestFriendshipPayload {
	friendId: number;
	user: User;
}

export interface AcceptFriendShipPayload {
	requestId: number;
	user: User;
}

export interface RejectFriendshipPayload {
	requestId: number;
	user: User;
}

export interface DeleteFriendshipPayload {
	requestId: number;
	user: User;
}

export interface BlockUserPayload {
	userId: number;
	user: User;
}
