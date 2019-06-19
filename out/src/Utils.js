"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const path = require("path");
const fse = require("fs-extra");
const child_process = require("child_process");
const rhamt_installer_1 = require("./util/rhamt-installer");
const RHAMT_VERSION_REGEX = /^version /;
const findJava = require('find-java-home');
const RHAMT_VERSION = '4.2.0-SNAPSHOT-offline';
const RHAMT_FOLDER = `rhamt-cli-${RHAMT_VERSION}`;
// const DOWNLOAD_CLI_LOCATION = `http://central.maven.org/maven2/org/jboss/windup/rhamt-cli/${RHAMT_VERSION}/${RHAMT_FOLDER}-offline.zip`;
const PREVIEW_DOWNLOAD_CLI_LOCATION = 'https://github.com/johnsteele/windup/releases/download/v0.0.1-alpha/rhamt-cli-4.2.0-SNAPSHOT-offline.zip';
const IGNORE_RHAMT_DOWNLOAD = 'ignoreRhamtDownload';
var Utils;
(function (Utils) {
    let EXTENSION_PUBLISHER;
    let EXTENSION_NAME;
    function loadPackageInfo(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const { publisher, name } = yield fse.readJSON(context.asAbsolutePath('./package.json'));
            EXTENSION_PUBLISHER = publisher;
            EXTENSION_NAME = name;
        });
    }
    Utils.loadPackageInfo = loadPackageInfo;
    function initConfiguration(config, modelService) {
        return __awaiter(this, void 0, void 0, function* () {
            yield vscode_1.window.withProgress({
                location: vscode_1.ProgressLocation.Notification,
                cancellable: false
            }, (progress) => __awaiter(this, void 0, void 0, function* () {
                progress.report({ message: 'Verifying JAVA_HOME' });
                let javaHome;
                let rhamtCli;
                try {
                    javaHome = yield findJavaHome();
                }
                catch (error) {
                    promptForFAQs('Unable to resolve Java Home');
                    progress.report({ message: 'Unable to verify JAVA_HOME' });
                    return Promise.reject(error);
                }
                progress.report({ message: 'Verifying rhamt-cli' });
                try {
                    rhamtCli = yield findRhamtCli(modelService.outDir);
                }
                catch (error) {
                    promptForFAQs('Unable to find rhamt-cli executable', { outDir: modelService.outDir });
                    return Promise.reject(error);
                }
                try {
                    yield findRhamtVersion(rhamtCli, javaHome);
                }
                catch (error) {
                    promptForFAQs('Unable to determine rhamt-cli version: \n' + error.message, { outDir: modelService.outDir });
                    return Promise.reject(error);
                }
                config.rhamtExecutable = rhamtCli;
                config.options['jvm'] = javaHome;
                return config;
            }));
        });
    }
    Utils.initConfiguration = initConfiguration;
    function findJavaHome() {
        return new Promise((resolve, reject) => {
            findJava((err, home) => {
                if (err) {
                    const javaHome = vscode_1.workspace.getConfiguration('java').get('home');
                    if (javaHome) {
                        resolve(javaHome);
                    }
                    else {
                        reject(err);
                    }
                }
                else {
                    resolve(home);
                }
            });
        });
    }
    Utils.findJavaHome = findJavaHome;
    function findRhamtCli(outDir) {
        return new Promise((resolve, reject) => {
            console.log('====================================');
            console.log('resolving preference - rhamt.executable.path');
            console.log('====================================');
            const rhamtPath = vscode_1.workspace.getConfiguration('rhamt.executable').get('path');
            if (rhamtPath) {
                console.log('====================================');
                console.log(`preference rhamt.executable.path found - ${rhamtPath}`);
                console.log('====================================');
                resolve(rhamtPath);
            }
            console.log('====================================');
            console.log(`attempting to resolve rhamt-cli using RHAMT_HOME`);
            console.log('====================================');
            let rhamtHome = process.env['RHAMT_HOME'];
            if (rhamtHome) {
                const executable = Utils.getRhamtExecutable(rhamtHome);
                console.log('====================================');
                console.log(`found rhamt-cli using RHAMT_HOME`);
                console.log(`RHAMT_HOME=${rhamtHome}`);
                console.log(`executable=${executable}`);
                console.log('====================================');
                return resolve(executable);
            }
            console.log('====================================');
            console.log(`attempting to find rhamt-cli download at location - ${outDir}`);
            console.log('====================================');
            rhamtHome = Utils.findRhamtCliDownload(outDir);
            if (rhamtHome) {
                console.log('====================================');
                console.log(`rhamt-cli download found at - ${rhamtHome}`);
                const executable = Utils.getRhamtExecutable(rhamtHome);
                console.log(`rhamt-cli executable - ${executable}`);
                console.log('====================================');
                return resolve(executable);
            }
            else {
                console.log('====================================');
                console.log('Unable to find rhamt-cli download');
                console.log('====================================');
                reject(new Error(''));
            }
        });
    }
    Utils.findRhamtCli = findRhamtCli;
    function getRhamtExecutable(home) {
        const isWindows = process.platform === 'win32';
        const executable = 'rhamt-cli' + (isWindows ? '.bat' : '');
        return path.join(home, 'bin', executable);
    }
    Utils.getRhamtExecutable = getRhamtExecutable;
    function findRhamtCliDownload(outDir) {
        return path.join(outDir, 'rhamt-cli', RHAMT_FOLDER);
    }
    Utils.findRhamtCliDownload = findRhamtCliDownload;
    function findRhamtVersion(rhamtCli, javaHome) {
        return new Promise((resolve, reject) => {
            const env = { JAVA_HOME: javaHome };
            const execOptions = {
                env: Object.assign({}, process.env, env)
            };
            child_process.exec(`"${rhamtCli}" --version`, execOptions, (error, _stdout, _stderr) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(parseVersion(_stdout));
                }
            });
        });
    }
    Utils.findRhamtVersion = findRhamtVersion;
    function parseVersion(raw) {
        return raw.replace(RHAMT_VERSION_REGEX, '');
    }
    function promptForFAQs(message, downloadCli) {
        return __awaiter(this, void 0, void 0, function* () {
            const DOWNLOAD = 'Download';
            const options = [];
            if (downloadCli) {
                options.push(DOWNLOAD);
            }
            const OPTION_SHOW_FAQS = 'Show FAQs';
            const OPTION_OPEN_SETTINGS = 'Open Settings';
            options.push(OPTION_SHOW_FAQS, OPTION_OPEN_SETTINGS);
            const choiceForDetails = yield vscode_1.window.showErrorMessage(message, ...options);
            if (choiceForDetails === DOWNLOAD) {
                Utils.downloadCli(downloadCli.outDir);
            }
            if (choiceForDetails === OPTION_SHOW_FAQS) {
                const faqPath = Utils.getPathToExtensionRoot('FAQ.md');
                vscode_1.commands.executeCommand('markdown.showPreview', vscode_1.Uri.file(faqPath));
            }
            else if (choiceForDetails === OPTION_OPEN_SETTINGS) {
                vscode_1.commands.executeCommand('workbench.action.openSettings');
            }
        });
    }
    Utils.promptForFAQs = promptForFAQs;
    function getExtensionId() {
        return `${EXTENSION_PUBLISHER}.${EXTENSION_NAME}`;
    }
    Utils.getExtensionId = getExtensionId;
    function getPathToExtensionRoot(...args) {
        return path.join(vscode_1.extensions.getExtension(getExtensionId()).extensionPath, ...args);
    }
    Utils.getPathToExtensionRoot = getPathToExtensionRoot;
    function checkCli(dataOut, context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield findRhamtCli(dataOut).catch(() => {
                if (!context.workspaceState.get(IGNORE_RHAMT_DOWNLOAD)) {
                    Utils.showDownloadCliOption(dataOut, context);
                }
            });
        });
    }
    Utils.checkCli = checkCli;
    function showDownloadCliOption(dataOut, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const MSG = 'Unable to find RHAMT CLI';
            const OPTION_DOWNLOAD = 'Download';
            const OPTION_DISMISS = `Don't Show Again`;
            const choice = yield vscode_1.window.showInformationMessage(MSG, OPTION_DOWNLOAD, OPTION_DISMISS);
            if (choice === OPTION_DOWNLOAD) {
                Utils.downloadCli(dataOut);
            }
            else if (choice === OPTION_DISMISS) {
                context.workspaceState.update(IGNORE_RHAMT_DOWNLOAD, true);
            }
        });
    }
    Utils.showDownloadCliOption = showDownloadCliOption;
    function downloadCli(dataOut) {
        return __awaiter(this, void 0, void 0, function* () {
            const handler = { log: msg => console.log(`rhamt-cli download message: ${msg}`) };
            const out = path.resolve(dataOut, 'rhamt-cli');
            rhamt_installer_1.RhamtInstaller.installCli(PREVIEW_DOWNLOAD_CLI_LOCATION, out, handler).then(home => {
                vscode_1.window.showInformationMessage('rhamt-cli download complete');
                vscode_1.workspace.getConfiguration().update('rhamt.executable.path', Utils.getRhamtExecutable(home));
            }).catch(e => {
                console.log(e);
                vscode_1.window.showErrorMessage(`Error downloading rhamt-cli: ${e}`);
            });
        });
    }
    Utils.downloadCli = downloadCli;
})(Utils = exports.Utils || (exports.Utils = {}));
//# sourceMappingURL=Utils.js.map