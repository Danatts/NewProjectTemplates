import chalk from 'chalk';
import fs from 'fs';
import { access } from 'fs/promises';
import ncp from 'ncp';
import path from 'path';
import { execa } from 'execa';
import { promisify } from 'util';
import Listr from 'listr';

const copy = promisify(ncp);

async function copyTemplateFiles(options) {
	return copy(options.templateDirectory, options.targetDirectory, {
		clobber: false,
	});
}

async function initGit(options) {
	const result = await execa('git', ['init'], {
		cwd: options.targetDirectory,
	});
	if (result.failed) {
		return Promise.reject(new Error('Failed to initialize git'));
	}
	return;
}

export async function createProject(options) {
	options = {
		...options,
		targetDirectory: options.targetDirectory || process.cwd(),
	};

	const currentFileUrl = import.meta.url;
	const templateDir = path.resolve(
		new URL(currentFileUrl).pathname,
		'../../templates/',
		options.template
	);
	options.templateDirectory = templateDir;

	try {
		await access(templateDir, fs.constants.R_OK);
	} catch (err) {
		console.error(`${chalk.red.bold('ERROR')} Invalid template name.`);
		process.exit(1);
	}

	const tasks = new Listr([
		{
			title: 'Copy project files',
			task: () => copyTemplateFiles(options),
		},
		{
			title: 'Initialize git',
			task: () => initGit(options),
			enabled: () => options.git,
		}
	]);

	await tasks.run();
	console.log(`${chalk.green.bold('DONE')} Project ready.`);
	console.log(`${chalk.yellow.bold('REMEMBER')} Install dependecies with your package manager.`);
	return true;
}

