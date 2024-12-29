import { args, BaseCommand } from "@adonisjs/core/ace";
import type { CommandOptions } from "@adonisjs/core/types/ace";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export default class Services extends BaseCommand {
	static commandName = "services";
	static description =
		"Prépare les services de l'application avec Docker Compose et lance les migrations, ou détruit les composants";

	static options: CommandOptions = {};

	@args.string({
		description: "Action à executer : prepare ou reset",
		required: true,
	})
	declare action: "prepare" | "reset";

	public async run() {
		if (this.action === "prepare") {
			await this.runPrepare();
		} else if (this.action === "reset") {
			await this.runReset();
		} else {
			this.logger.error(
				`Action invalide : ${this.action}. Utilisez "prepare" ou "reset".`,
			);
			process.exit(1);
		}
	}
	async runPrepare() {
		const animation = this.logger.await("Démarrage des conteneurs...", {
			suffix: "podman compose up -d",
		});

		animation.start();
		await this.runCommand("podman compose up -d");
		this.logger.success("Conteneurs démarrés.");

		animation.update("Exécution des migrations...", {
			suffix: "node ace migration:run",
		});
		await this.runCommand("node ace migration:run");
		animation.stop();
		this.logger.success("Migrations exécutées.");
	}

	/**
	 * Réinitialiser le serveur (arrêter et démonter les conteneurs)
	 */
	async runReset() {
		const animation = this.logger.await("Arrêt des conteneurs...", {
			suffix: "podman compose down -v",
		});
		animation.start();
		await this.runCommand("podman compose down -v");
		animation.stop();
		this.logger.success("Conteneurs arrêtés et démontés.");
	}
	/**
	 * Exécute une commande shell
	 */
	private async runCommand(command: string) {
		try {
			await execAsync(command);
		} catch (error) {
			this.logger.error(
				`Erreur lors de l'exécution de la commande : ${command}`,
			);
			this.logger.fatal(error.message);
			process.exit(1);
		}
	}
}
