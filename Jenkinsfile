#!/usr/bin/env groovy

node('rhel7'){
	stage('Checkout repo') {
		deleteDir()
		git url: 'https://github.com/windup/rhamt-vscode-extension.git'
	}

	stage('Install requirements') {
		def nodeHome = tool 'nodejs-8.11.1'
		env.PATH="${env.PATH}:${nodeHome}/bin"
		sh "npm install -g typescript vsce"
	}

	stage('Build') {
		sh "npm install"
		sh "npm run vscode:prepublish"
	}

	stage('Package') {
		try {
			def packageJson = readJSON file: 'package.json'
			sh "vsce package -o adapters-${packageJson.version}-${env.BUILD_NUMBER}.vsix"
		}
		finally {
			archiveArtifacts artifacts: '*.vsix'
		}
	}
	if(params.UPLOAD_LOCATION) {
		stage('Snapshot') {
			def filesToPush = findFiles(glob: '**.vsix')
			sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${filesToPush[0].path} ${UPLOAD_LOCATION}/snapshots/rhamt-vscode-extension"
			stash name:'vsix', includes:filesToPush[0].path
		}
	}
}