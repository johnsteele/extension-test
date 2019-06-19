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
const localize_1 = require("./localize");
const path = require("path");
const configurationNode_1 = require("./configurationNode");
const resultsNode_1 = require("./resultsNode");
class DataProvider {
    constructor(grouping, modelService, context) {
        this.grouping = grouping;
        this.modelService = modelService;
        this.context = context;
        this._onDidChangeTreeDataEmitter = new vscode_1.EventEmitter();
        this._onNodeCreateEmitter = new vscode_1.EventEmitter();
        this.children = [];
        this._disposables = [];
        this._disposables.push(this.modelService.onModelLoaded(() => {
            this.refresh(undefined);
        }));
        this._disposables.push(vscode_1.commands.registerCommand('rhamt.modelReload', () => {
            this.refresh(undefined);
        }));
        this._disposables.push(vscode_1.commands.registerCommand('rhamt.refreshResults', item => {
            item.reload();
        }));
    }
    reveal(node, expand) {
        this.view.reveal(node, { expand });
    }
    dispose() {
        for (const disposable of this._disposables) {
            disposable.dispose();
        }
    }
    getParent(element) {
        if (element instanceof resultsNode_1.ResultsNode) {
            return element.root;
        }
    }
    get onDidChangeTreeData() {
        return this._onDidChangeTreeDataEmitter.event;
    }
    get onNodeCreate() {
        return this._onNodeCreateEmitter.event;
    }
    getTreeItem(node) {
        if (node instanceof vscode_1.TreeItem && !node.treeItem) {
            return node;
        }
        return node.treeItem;
    }
    getChildren(node) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.doGetChildren(node);
            }
            catch (error) {
                const item = new vscode_1.TreeItem(localize_1.localize('errorNode', 'Error: {0}', error));
                item.contextValue = 'rhamtextensionui.error';
                return Promise.resolve([item]);
            }
        });
    }
    doGetChildren(node) {
        return __awaiter(this, void 0, void 0, function* () {
            let result;
            if (node) {
                result = yield node.getChildren();
            }
            else {
                result = yield this.populateRootNodes();
            }
            return result;
        });
    }
    refresh(node) {
        return __awaiter(this, void 0, void 0, function* () {
            this._onDidChangeTreeDataEmitter.fire(node);
        });
    }
    populateRootNodes() {
        return __awaiter(this, void 0, void 0, function* () {
            let nodes;
            if (this.modelService.loaded) {
                for (let i = this.children.length; i--;) {
                    const config = this.modelService.model.configurations.find(item => item.id === this.children[i].config.id);
                    if (!config) {
                        this.children.splice(i, 1);
                    }
                }
                nodes = this.modelService.model.configurations.map(config => {
                    let node = this.children.find(node => node.config.id === config.id);
                    if (!node) {
                        node = new configurationNode_1.ConfigurationNode(config, this.grouping, this.modelService, this._onNodeCreateEmitter, this);
                        this.children.push(node);
                    }
                    return node;
                });
            }
            else {
                const item = new vscode_1.TreeItem(localize_1.localize('loadingNode', 'Loading...'));
                const base = [__dirname, '..', '..', '..', 'resources'];
                item.iconPath = {
                    light: path.join(...base, 'light', 'Loading.svg'),
                    dark: path.join(...base, 'dark', 'Loading.svg')
                };
                nodes = [item];
                (() => __awaiter(this, void 0, void 0, function* () {
                    return setTimeout(() => {
                        this.modelService.load().catch(e => {
                            console.log('error while loading model service.');
                            console.log(e);
                        });
                    }, 500);
                }))();
            }
            return nodes;
        });
    }
}
exports.DataProvider = DataProvider;
//# sourceMappingURL=dataProvider.js.map