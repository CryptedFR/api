import { defineConfig, services } from "@adonisjs/drive";
import env from "#start/env";

const driveConfig = defineConfig({
	default: env.get("DRIVE_DISK"),

	/**
	 * The services object can be used to configure multiple file system
	 * services each using the same or a different driver.
	 */
	services: {
		s3: services.s3({
			credentials: {
				accessKeyId: env.get("MINIO_ACCESS_KEY_ID"),
				secretAccessKey: env.get("MINIO_SECRET_ACCESS_KEY"),
			},
			region: env.get("MINIO_REGION"),
			endpoint: env.get("MINIO_ENDPOINT"),
			cdnUrl: env.get("MINIO_ENDPOINT"),
			bucket: env.get("S3_BUCKET"),
			visibility: "public",
		}),
		spaces: services.s3({
			credentials: {
				accessKeyId: env.get("SPACES_KEY"),
				secretAccessKey: env.get("SPACES_SECRET"),
			},
			region: env.get("SPACES_REGION"),
			bucket: env.get("SPACES_BUCKET"),
			endpoint: env.get("SPACES_ENDPOINT"),
			visibility: "public",
		}),
	},
});

export default driveConfig;

declare module "@adonisjs/drive/types" {
	export interface DriveDisks extends InferDriveDisks<typeof driveConfig> {}
}
