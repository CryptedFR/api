import Friendship from "#models/friendship";
import { Exception } from "@adonisjs/core/exceptions";
import type {
	AcceptFriendShipPayload,
	BlockUserPayload,
	DeleteFriendshipPayload,
	RejectFriendshipPayload,
	RequestFriendshipPayload,
} from "../../types/friendship.js";
import { errorCodes } from "../../types/response_codes.js";

export class FriendshipService {
	async sendRequest(payload: RequestFriendshipPayload) {
		await Friendship.create({
			requesterId: payload.user.id,
			recipientId: payload.friendId,
		});
	}

	async acceptRequest(payload: AcceptFriendShipPayload) {
		await payload.user.load("receivedRequests", (query) => {
			query.where("id", payload.requestId);
		});

		const friendship = payload.user.receivedRequests.find(
			(request) =>
				request.id === payload.requestId && request.status === "pending",
		);

		if (!friendship) {
			throw new Exception("Friendship request not found", {
				status: 404,
				code: errorCodes.FRIENDSHIP_REQUEST_NOT_FOUND,
			});
		}

		await friendship.acceptRequest();
	}

	async rejectRequest(payload: RejectFriendshipPayload) {
		await payload.user.load("receivedRequests", (query) => {
			query.where("id", payload.requestId);
		});

		const friendship = payload.user.receivedRequests.find(
			(request) =>
				request.id === payload.requestId && request.status === "pending",
		);
		if (!friendship) {
			throw new Exception("Friendship request not found", {
				status: 404,
				code: errorCodes.FRIENDSHIP_REQUEST_NOT_FOUND,
			});
		}

		await friendship.rejectRequest();
	}

	async blockUser(payload: BlockUserPayload) {
		await payload.user.load("sentRequests", (query) => {
			query.where("recipientId", payload.userId);
		});

		await payload.user.load("receivedRequests", (query) => {
			query.where("recipientId", payload.user.id) &&
				query.whereNot("status", "blocked");
		});

		const receivedFriendship = payload.user.receivedRequests.find(
			(request) =>
				request.recipientId === payload.user.id && request.status !== "blocked",
		);

		const friendship = payload.user.sentRequests.find(
			(request) => request.recipientId === payload.userId,
		);

		if (!friendship) {
			await Friendship.create({
				requesterId: payload.user.id,
				recipientId: payload.userId,
				status: "blocked",
			});
			return;
		}

		if (receivedFriendship) {
			await receivedFriendship.delete();
		}

		if (friendship.status === "blocked") {
			throw new Exception("User is already blocked", {
				code: errorCodes.FRIENDSHIP_USER_IS_ALREADY_BLOCKED,
				status: 403,
			});
		}

		friendship.status = "blocked";
		await friendship.save();
	}

	async unblockUser(payload: BlockUserPayload) {
		await payload.user.load("sentRequests", (query) => {
			query.where("recipientId", payload.userId);
		});

		const friendship = payload.user.sentRequests.find(
			(request) =>
				request.recipientId === payload.userId && request.status === "blocked",
		);

		if (!friendship) {
			throw new Exception("Friendship block not found", {
				status: 404,
				code: errorCodes.FRIENDSHIP_REQUEST_NOT_FOUND,
			});
		}

		await friendship.delete();
	}

	async deleteFriendship(payload: DeleteFriendshipPayload) {
		await payload.user.load("receivedRequests", (query) => {
			query.where("id", payload.requestId);
		});
		await payload.user.load("sentRequests", (query) => {
			query.where("id", payload.requestId);
		});

		const friendship =
			payload.user.receivedRequests.find(
				(request) =>
					request.id === payload.requestId && request.status === "accepted",
			) ||
			payload.user.sentRequests.find(
				(request) =>
					request.id === payload.requestId && request.status === "accepted",
			);

		if (!friendship) {
			throw new Exception("Friendship request not found", {
				status: 404,
				code: errorCodes.FRIENDSHIP_REQUEST_NOT_FOUND,
			});
		}

		await friendship.deleteFriendship();
	}
}
