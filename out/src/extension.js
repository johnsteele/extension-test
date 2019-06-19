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
const Utils_1 = require("./Utils");
const path = require("path");
const rhamtView_1 = require("./explorer/rhamtView");
const modelService_1 = require("./model/modelService");
const model_1 = require("./model/model");
const json = require("jsonc-parser");
const rhamtUtil_1 = require("./server/rhamtUtil");
const fs = require("fs-extra");
const issueDetailsView_1 = require("./issueDetails/issueDetailsView");
const reportView_1 = require("./report/reportView");
let rhamtView;
let detailsView;
let modelService;
let stateLocation;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        stateLocation = context.storagePath;
        yield Utils_1.Utils.loadPackageInfo(context);
        const out = path.join(stateLocation, 'data');
        const reportEndpoints = getReportEndpoints(context, out);
        modelService = new modelService_1.ModelService(new model_1.RhamtModel(), out, reportEndpoints);
        rhamtView = new rhamtView_1.RhamtView(context, modelService);
        new reportView_1.ReportView(context, reportEndpoints);
        context.subscriptions.push(rhamtView);
        detailsView = new issueDetailsView_1.IssueDetailsView(context, reportEndpoints);
        const runConfigurationDisposable = vscode.commands.registerCommand('rhamt.runConfiguration', (item) => __awaiter(this, void 0, void 0, function* () {
            const config = item.config;
            try {
                yield rhamtUtil_1.RhamtUtil.analyze(config, modelService);
            }
            catch (e) {
                console.log(e);
            }
        }));
        context.subscriptions.push(runConfigurationDisposable);
        context.subscriptions.push(vscode.commands.registerCommand('rhamt.openDoc', data => {
            detailsView.open(data.issue);
            vscode.workspace.openTextDocument(vscode.Uri.file(data.uri)).then((doc) => __awaiter(this, void 0, void 0, function* () {
                const editor = yield vscode.window.showTextDocument(doc);
                if (data.line) {
                    editor.selection = new vscode.Selection(new vscode.Position(data.line, data.column), new vscode.Position(data.line, data.length));
                    editor.revealRange(new vscode.Range(data.line, 0, data.line + 1, 0), vscode.TextEditorRevealType.InCenter);
                }
            }));
        }));
        context.subscriptions.push(vscode.commands.registerCommand('rhamt.openConfiguration', (config) => {
            const location = modelService.getModelPersistanceLocation();
            fs.exists(location, exists => {
                if (exists) {
                    vscode.workspace.openTextDocument(vscode.Uri.file(location)).then((doc) => __awaiter(this, void 0, void 0, function* () {
                        const editor = yield vscode.window.showTextDocument(doc);
                        const node = getNode(json.parseTree(doc.getText()), doc.getText(), config);
                        if (node) {
                            const range = new vscode.Range(doc.positionAt(node.offset), doc.positionAt(node.offset + node.length));
                            editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
                            editor.selection = new vscode.Selection(range.start, range.end);
                        }
                    }));
                }
                else {
                    vscode.window.showErrorMessage('Unable to find configuration persistance file.');
                }
            });
        }));
        context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(doc => {
            if (doc.fileName === modelService.getModelPersistanceLocation()) {
                modelService.reload().then(() => {
                    vscode.commands.executeCommand('rhamt.modelReload');
                }).catch(e => {
                    vscode.window.showErrorMessage(`Error reloading configurations - ${e}`);
                });
            }
        }));
        Utils_1.Utils.checkCli(modelService.outDir, context);
    });
}
exports.activate = activate;
function getNode(node, text, config) {
    let found = false;
    let container = undefined;
    json.visit(text, {
        onObjectProperty: (property, offset, length, startLine, startCharacter) => {
            if (!found && property === 'name') {
                const childPath = json.getLocation(text, offset).path;
                const childNode = json.findNodeAtLocation(node, childPath);
                if (childNode && childNode.value === config.name) {
                    found = true;
                    container = childNode.parent.parent;
                }
            }
        }
    });
    return container;
}
function getReportEndpoints(ctx, out) {
    const port = () => {
        return process.env.RAAS_PORT || String(61435);
    };
    const host = () => {
        return 'localhost';
    };
    const location = () => {
        return `http://${host()}:${port()}`;
    };
    return {
        port,
        host,
        location,
        resourcesRoot: () => {
            return vscode.Uri.file(path.join(ctx.extensionPath, 'resources'));
        },
        reportsRoot: () => {
            return out;
        }
    };
}
//# sourceMappingURL=extension.js.map