import { FriendshipService } from "#services/friendship_service";
import {
	actionFriendshipValidator,
	blockUserValidator,
	requestFriendshipValidator,
} from "#validators/friendship";
import type { HttpContext } from "@adonisjs/core/http";
import { SuccessResponse } from "../utils/HttpResponse.js";
import { successCodes } from "../../types/response_codes.js";

export default class FriendshipController {
	private friendshipService = new FriendshipService();

	async request({ request, auth, response }: HttpContext) {
		const payload = await request.validateUsing(requestFriendshipValidator, {
			meta: {
				userId: auth.getUserOrFail().id,
			},
		});
		const user = auth.getUserOrFail();

		await this.friendshipService.sendRequest({
			user,
			friendId: payload.friendId,
		});

		return SuccessResponse(response, 201, successCodes.FRIENDSHIP_REQUEST_SENT);
	}

	async listSentRequests({ auth, response }: HttpContext) {
		const user = auth.getUserOrFail();

		const sent_requests = await user.listPendingSentRequests();

		return SuccessResponse(response, 200, successCodes.SUCCESS, sent_requests);
	}
	async listReceivedRequests({ auth, response }: HttpContext) {
		const user = auth.getUserOrFail();

		const received_requests = await user.listPendingReceivedRequests();

		return SuccessResponse(
			response,
			200,
			successCodes.SUCCESS,
			received_requests,
		);
	}

	async listFriends({ auth, response }: HttpContext) {
		const user = auth.getUserOrFail();

		const friends = await user.listFriends();

		return SuccessResponse(response, 200, successCodes.SUCCESS, friends);
	}

	async listBlocked({ auth, response }: HttpContext) {
		const user = auth.getUserOrFail();

		const blocked_users = await user.listBlockedUsers();

		return SuccessResponse(response, 200, successCodes.SUCCESS, blocked_users);
	}

	async accept({ params, auth, response }: HttpContext) {
		const { requestId } = await actionFriendshipValidator.validate(params);
		const user = auth.getUserOrFail();

		await this.friendshipService.acceptRequest({ requestId, user });

		return SuccessResponse(
			response,
			200,
			successCodes.FRIENDSHIP_REQUEST_ACCEPTED,
		);
	}
	async reject({ params, auth, response }: HttpContext) {
		const { requestId } = await actionFriendshipValidator.validate(params);
		const user = auth.getUserOrFail();

		await this.friendshipService.rejectRequest({ requestId, user });

		return SuccessResponse(
			response,
			200,
			successCodes.FRIENDSHIP_REQUEST_REJECTED,
		);
	}

	async block({ params, auth, response }: HttpContext) {
		const { userId } = await blockUserValidator.validate(params);
		const user = auth.getUserOrFail();

		await this.friendshipService.blockUser({ userId, user });

		return SuccessResponse(response, 200, successCodes.FRIENDSHIP_USER_BLOCKED);
	}

	async unblock({ params, auth, response }: HttpContext) {
		const { userId } = await blockUserValidator.validate(params);
		const user = auth.getUserOrFail();

		await this.friendshipService.unblockUser({ userId, user });

		return SuccessResponse(
			response,
			200,
			successCodes.FRIENDSHIP_USER_UNBLOCKED,
		);
	}

	async delete({ params, auth, response }: HttpContext) {
		const { requestId } = await actionFriendshipValidator.validate(params);
		const user = auth.getUserOrFail();

		await this.friendshipService.deleteFriendship({ requestId, user });

		return SuccessResponse(response, 200, successCodes.FRIENDSHIP_DELETED);
	}
}
