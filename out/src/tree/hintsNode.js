"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const abstractNode_1 = require("./abstractNode");
const path = require("path");
const hintsItem_1 = require("./hintsItem");
class HintsNode extends abstractNode_1.AbstractNode {
    constructor(config, file, modelService, onNodeCreateEmitter, dataProvider, root) {
        super(config, modelService, onNodeCreateEmitter, dataProvider);
        this.loading = false;
        this.children = [];
        this.file = file;
        this.root = root;
        this.treeItem = this.createItem();
        this.listen();
    }
    createItem() {
        return new hintsItem_1.HintsItem(this.file);
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
        }, 1000);
    }
    refresh(node) {
        const unsorted = this.root.getChildNodes(this);
        this.children = unsorted.sort(HintsNode.compareHint);
        this.children.forEach(child => child.parentNode = this);
        this.treeItem.refresh(this.children.length);
        super.refresh(node);
    }
    static compareHint(node1, node2) {
        const one = node1.hint.lineNumber;
        const other = node2.hint.lineNumber;
        const a = one || 0;
        const b = other || 0;
        if (a !== b) {
            return a < b ? -1 : 1;
        }
        return 0;
    }
}
exports.HintsNode = HintsNode;
//# sourceMappingURL=hintsNode.js.map