import chalk from 'chalk';
import fs from 'fs';
import { access } from 'fs/promises';
import ncp from 'ncp';
import path from 'path';
import { execa } from 'execa';

async function initGit(options){
	const result = await execa('git', ['init'], {
		cwd: options.targetDirectory,
	});
	if (result.failed){
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
		options.template.toLowerCase()
	);
	options.templateDirectory = templateDir;

	try {
		await access(templateDir, fs.constants.R_OK);
	} catch (err) {
		console.error('%s Invalid template name', chalk.red.bold('ERROR'));
		process.exit(1);
	}

	console.log('Copy project files');
	ncp(options.templateDirectory, options.targetDirectory, {
		clobber: false,
	}, (err) => {
		if (err) {
			console.error('%s Cannot copy files', chalk.red.bold('ERROR'));
			process.exit(1);
		}
	});

	if(options.git) {
		initGit(options);
	}

	console.log('%s Project ready', chalk.green.bold('DONE'));
	return true;
}

