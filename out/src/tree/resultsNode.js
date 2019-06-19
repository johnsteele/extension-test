"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const abstractNode_1 = require("./abstractNode");
const path = require("path");
const resultsItem_1 = require("./resultsItem");
const reportNode_1 = require("./reportNode");
class ResultsNode extends abstractNode_1.AbstractNode {
    constructor(config, modelService, onNodeCreateEmitter, dataProvider, root) {
        super(config, modelService, onNodeCreateEmitter, dataProvider);
        this.loading = false;
        this.children = [];
        this.root = root;
        this.reportNode = new reportNode_1.ReportNode(config, modelService, onNodeCreateEmitter, dataProvider, root);
        this.treeItem = this.createItem();
        this.listen();
    }
    createItem() {
        return new resultsItem_1.ResultsItem();
    }
    delete() {
        return Promise.resolve();
    }
    getChildren() {
        if (this.loading) {
            return Promise.resolve([]);
        }
        return Promise.resolve(this.children);
    }
    hasMoreChildren() {
        return this.children.length > 0;
    }
    listen() {
        this.loading = true;
        const base = [__dirname, '..', '..', '..', 'resources'];
        this.treeItem.iconPath = {
            light: path.join(...base, 'light', 'Loading.svg'),
            dark: path.join(...base, 'dark', 'Loading.svg')
        };
        this.treeItem.collapsibleState = vscode_1.TreeItemCollapsibleState.None;
        setTimeout(() => {
            this.treeItem.iconPath = undefined;
            this.loading = false;
            this.refresh(this);
            this.dataProvider.reveal(this, true);
        }, 1000);
    }
    refresh(node) {
        this.children = [this.reportNode];
        this.children = this.children.concat(this.root.getChildNodes(this));
        this.children.forEach(child => child.parentNode = this);
        this.treeItem.refresh(this.config.summary.executedTimestamp);
        super.refresh(node);
    }
}
exports.ResultsNode = ResultsNode;
//# sourceMappingURL=resultsNode.js.map