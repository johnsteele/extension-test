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
const dataProvider_1 = require("../tree/dataProvider");
const optionsBuilder_1 = require("../optionsBuilder");
const rhamtUtil_1 = require("../server/rhamtUtil");
class RhamtExplorer {
    constructor(context, modelService) {
        this.context = context;
        this.modelService = modelService;
        this.grouping = {
            groupByFile: true,
            groupBySeverity: false
        };
        this.dataProvider = this.createDataProvider();
        this.createViewer();
        this.createCommands();
    }
    createCommands() {
        this.context.subscriptions.push(vscode.commands.registerCommand('rhamt.createConfiguration', () => __awaiter(this, void 0, void 0, function* () {
            const config = yield optionsBuilder_1.OptionsBuilder.build(this.modelService);
            if (config) {
                yield this.modelService.addConfiguration(config);
                this.dataProvider.refresh();
                vscode.window.showInformationMessage(`Successfully Created: ${config.name}`);
                const run = yield vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: 'Run the analysis?' });
                if (!run || run === 'No') {
                    return;
                }
                try {
                    yield rhamtUtil_1.RhamtUtil.analyze(config, this.modelService);
                }
                catch (e) {
                    console.log(e);
                }
            }
        })));
        this.context.subscriptions.push(vscode.commands.registerCommand('rhamt.deleteConfiguration', item => {
            const config = item.config;
            this.modelService.deleteConfiguration(config);
            this.dataProvider.refresh();
        }));
        this.dataProvider.context.subscriptions.push(vscode.commands.registerCommand('rhamt.deleteIssue', item => {
            item.root.deleteIssue(item);
        }));
        this.dataProvider.context.subscriptions.push(vscode.commands.registerCommand('rhamt.markIssueAsComplete', item => {
            item.root.markIssueAsComplete(item);
        }));
        this.dataProvider.context.subscriptions.push(vscode.commands.registerCommand('rhamt.deleteResults', item => {
            const output = item.config.options['output'];
            if (output) {
                this.modelService.deleteOuputLocation(output);
            }
            item.config.results = undefined;
        }));
        this.context.subscriptions.push(vscode.commands.registerCommand('rhamt.newConfiguration', () => __awaiter(this, void 0, void 0, function* () {
            const config = this.modelService.createConfiguration();
            yield this.modelService.addConfiguration(config);
            vscode.commands.executeCommand('rhamt.openConfiguration', config);
            this.dataProvider.refresh();
        })));
    }
    createViewer() {
        const treeDataProvider = this.dataProvider;
        const viewer = vscode.window.createTreeView('rhamtExplorerView', { treeDataProvider });
        this.context.subscriptions.push(viewer);
        this.dataProvider.view = viewer;
        return viewer;
    }
    createDataProvider() {
        const provider = new dataProvider_1.DataProvider(this.grouping, this.modelService, this.context);
        this.context.subscriptions.push(provider);
        return provider;
    }
}
exports.RhamtExplorer = RhamtExplorer;
//# sourceMappingURL=rhamtExplorer.js.map