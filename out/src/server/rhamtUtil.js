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
const vscode = require("vscode");
const Utils_1 = require("../Utils");
const rhamtRunner_1 = require("./rhamtRunner");
const rhamtProcessController_1 = require("./rhamtProcessController");
const progressMonitor_1 = require("./progressMonitor");
const path = require("path");
const analysisResults_1 = require("../model/analysisResults");
const PROGRESS_REGEX = /^:progress: /;
const START_TIMEOUT = 60000;
class RhamtChannelImpl {
    constructor() {
        this.channel = vscode.window.createOutputChannel('RHAMT');
    }
    print(text) {
        this.channel.append(text);
        this.channel.show();
    }
    clear() {
        this.channel.clear();
    }
}
exports.rhamtChannel = new RhamtChannelImpl();
class RhamtUtil {
    static analyze(config, modelService) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Utils_1.Utils.initConfiguration(config, modelService);
            }
            catch (e) {
                return Promise.reject(e);
            }
            return vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                cancellable: true
            }, (progress, token) => __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                    let executable;
                    try {
                        executable = yield Utils_1.Utils.findRhamtCli(modelService.outDir);
                    }
                    catch (e) {
                        vscode.window.showErrorMessage(`Error finding rhamt-cli: ${e}`);
                        return Promise.reject(e);
                    }
                    const windupHome = path.resolve(executable, '..', '..');
                    let params = [];
                    try {
                        params = yield RhamtUtil.buildParams(config, windupHome);
                    }
                    catch (e) {
                        vscode.window.showErrorMessage(`Error: ${e}`);
                        return Promise.reject(e);
                    }
                    exports.rhamtChannel.clear();
                    progress.report({ message: 'Executing rhamt-cli script...' });
                    let cancelled = false;
                    let resolved = false;
                    let serverManager;
                    const date = new Date();
                    const time = date.toLocaleTimeString();
                    const timestamp = time.substring(0, time.lastIndexOf(':'));
                    const sun = time.substring(time.lastIndexOf(' ') + 1);
                    const year = new String(date.getFullYear()).substring(0, 2);
                    const executedTimestamp = `${date.getMonth()}/${date.getDate()}/${year} @ ${timestamp}${sun}`;
                    const onComplete = () => __awaiter(this, void 0, void 0, function* () {
                        serverManager.shutdown();
                        vscode.window.showInformationMessage('Analysis complete', 'Open Report').then(result => {
                            if (result === 'Open Report') {
                                analysisResults_1.AnalysisResultsUtil.openReport(config.getReport());
                            }
                        });
                        yield this.loadResults(config, modelService, executedTimestamp);
                        if (!resolved) {
                            resolve();
                        }
                    });
                    const monitor = new progressMonitor_1.ProgressMonitor(progress, onComplete);
                    const onMessage = (data) => {
                        if (data.includes(':progress:')) {
                            const raw = data.replace(PROGRESS_REGEX, '');
                            monitor.handleMessage(JSON.parse(raw));
                        }
                        else {
                            data = data.trim();
                            if (data && data.length > 1) {
                                exports.rhamtChannel.print(data);
                            }
                        }
                    };
                    const onShutdown = () => {
                        console.log('rhamt-cli shutdown');
                        if (!resolved) {
                            resolved = true;
                            resolve();
                        }
                    };
                    try {
                        serverManager = yield rhamtRunner_1.RhamtRunner.run(config.rhamtExecutable, params, START_TIMEOUT, onMessage).then(cp => {
                            config.results = undefined;
                            return new rhamtProcessController_1.RhamtProcessController(config.rhamtExecutable, cp, onShutdown);
                        });
                        if (cancelled) {
                            console.log('rhamt-cli was cancelled during startup.');
                            serverManager.shutdown();
                            return;
                        }
                    }
                    catch (e) {
                        console.log(e);
                        progress.report({ message: `Error: ${e}` });
                        return Promise.reject();
                    }
                    token.onCancellationRequested(() => {
                        cancelled = true;
                        if (serverManager) {
                            serverManager.shutdown();
                        }
                        if (!resolved) {
                            resolved = true;
                            resolve();
                        }
                    });
                    progress.report({ message: 'Preparing analysis configuration...' });
                }));
            }));
        });
    }
    static buildParams(config, windupHome) {
        const params = [];
        params.push('--toolingMode');
        params.push('--input');
        const input = config.options['input'];
        if (!input || input.length === 0) {
            return Promise.reject('input is missing from configuration');
        }
        params.push(input);
        params.push('--output');
        const output = config.options['output'];
        if (!output || output === '') {
            return Promise.reject('output is missing from configuration');
        }
        params.push(output);
        params.push('--sourceMode');
        params.push('--ignorePattern');
        params.push('\\.class$');
        params.push('--windupHome');
        params.push(windupHome);
        const source = config.options['source'];
        if (source && source.length > 0) {
            params.push('--source');
            params.push(source.join(' '));
        }
        let target = config.options['target'];
        if (!target) {
            target = [];
        }
        if (target.length === 0) {
            target.push('eap7');
        }
        params.push('--target');
        params.push(target.join(' '));
        params.push('--userRulesDirectory');
        params.push('/Users/johnsteele/Desktop/vscode-demo/tests/rules');
        params.push('/Users/johnsteele/Desktop/vscode-demo/tests/rules2');
        return Promise.resolve(params);
    }
    static loadResults(config, modelService, startedTimestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            return analysisResults_1.AnalysisResultsUtil.loadFromLocation(config.getResultsLocation()).then(dom => {
                const summary = {
                    outputLocation: config.options['output'],
                    executedTimestamp: startedTimestamp,
                    executable: config.rhamtExecutable
                };
                config.summary = summary;
                config.results = new analysisResults_1.AnalysisResults(config, dom);
                modelService.save();
            });
        });
    }
}
exports.RhamtUtil = RhamtUtil;
//# sourceMappingURL=rhamtUtil.js.map