import { cuid } from "@adonisjs/core/helpers";
import type { MultipartFile } from "@adonisjs/core/types/bodyparser";
import drive from "@adonisjs/drive/services/main";
import env from "#start/env";

/**
 * Moves a file to the configured disk and generates a public URL for the file.
 *
 * @param {MultipartFile} file - The file to move. Must be a valid multipart file.
 * @param {string} folder - The folder path (relative to the bucket) where the file will be stored.
 * @returns {Promise<string>} The public URL of the uploaded file.
 *
 * @throws {Error} If the file cannot be moved or if the bucket is not configured.
 */
export const moveFileToDisk = async (file: MultipartFile, folder: string) => {
	const bucket = env.get("S3_BUCKET");

	const key = `${bucket}/${folder}/${cuid()}.${file.extname}`;

	await file.moveToDisk(key);

	return await drive.use().getUrl(key);
};

/**
 * Deletes a file from the configured disk.
 *
 * @param {string} url - The public URL of the file to delete.
 * @returns {Promise<void>} Resolves when the file is successfully deleted.
 *
 * @throws {Error} If the file cannot be deleted or the URL is invalid.
 */
export const deleteFileFromDisk = async (url: string) => {
	const parsedUrl = new URL(url);

	// Récupérer le chemin et supprimer le premier "/"
	const key = parsedUrl.pathname.slice(1);

	const disk = drive.use();

	await disk.delete(key);
};
