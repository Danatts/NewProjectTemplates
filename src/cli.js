import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main.js';
import templatesDic from './templatesDic.js';

function parseArgumentIntoOptions(rawArgs) {
	const args = arg(
		{
			'--git': Boolean,
			'-g': '--git',
		},
		{
			argv: rawArgs.slice(2),
		}
	);
	return {
		git: args['--git'] || false,
		template: args._[0],
	};
}

async function promptForMissingOptions(options) {
	const questions = [];
	if (!options.template) {
		questions.push({
			type: 'list',
			name: 'template',
			message: 'Please choose which porject template to use',
			choices: Array.from(templatesDic.keys()),
		});
	}

	if (!options.git) {
		questions.push({
			type: 'confirm',
			name: 'git',
			message: 'Initialize a git repository?',
			default: false,
		});
	}

	const answers = await inquirer.prompt(questions);

	return {
		...options,
		template: options.template || templatesDic.get(answers.template),
		git: options.git || answers.git,
	};
}

export async function cli(args) {
	let options = parseArgumentIntoOptions(args);
	options = await promptForMissingOptions(options);
	await createProject(options);
}
