/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

const UsersController = () => import("#controllers/users_controller");
const AuthController = () => import("#controllers/auth_controller");
import router from "@adonisjs/core/services/router";
import { middleware } from "./kernel.js";
const FriendshipController = () => import("#controllers/friendship_controller");

router.get("/", async () => {
	return {
		hello: "world",
	};
});

router
	.group(() => {
		// User routes
		router
			.group(() => {
				router.post("/", [UsersController, "store"]);

				// Authenticated routes
				router
					.group(() => {
						router.get("/me", [UsersController, "me"]);
						router.patch("/password", [UsersController, "updatePassword"]);
						router.patch("/username", [UsersController, "updateUsername"]);
						router.patch("/email", [UsersController, "updateEmail"]);
						router.delete("/", [UsersController, "delete"]);
						// Avatar routes
						router
							.group(() => {
								router.put("/", [UsersController, "uploadAvatar"]);
								router.delete("/", [UsersController, "removeAvatar"]);
							})
							.prefix("avatar");
					})
					.use(middleware.auth());

				// User Auth routes
				router
					.group(() => {
						router.post("/", [AuthController, "authenticate"]);
						router
							.delete("/", [AuthController, "logout"])
							.use(middleware.auth());
					})
					.prefix("auth");
			})
			.prefix("user");
		//

		// Friendship routes
		router
			.group(() => {
				router.get("/sent", [FriendshipController, "listSentRequests"]);
				router.get("/received", [FriendshipController, "listReceivedRequests"]);
				router.get("/list", [FriendshipController, "listFriends"]);
				router.post("/request", [FriendshipController, "request"]);
				router.delete("/friend/:requestId", [FriendshipController, "delete"]);
				router.patch("/accept/:requestId", [FriendshipController, "accept"]);
				router.patch("/reject/:requestId", [FriendshipController, "reject"]);
				router.patch("/block/:userId", [FriendshipController, "block"]);
				router.get("/block/list", [FriendshipController, "listBlocked"]);
				router.patch("/unblock/:userId", [FriendshipController, "unblock"]);
			})
			.use(middleware.auth())
			.prefix("friendship");
	})
	.prefix("v1");
