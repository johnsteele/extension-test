"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const abstractNode_1 = require("./abstractNode");
const classificationsItem_1 = require("./classificationsItem");
const path = require("path");
const sortUtil_1 = require("./sortUtil");
class ClassificationsNode extends abstractNode_1.AbstractNode {
    constructor(config, file, modelService, onNodeCreateEmitter, dataProvider, root, parent) {
        super(config, modelService, onNodeCreateEmitter, dataProvider);
        this.loading = false;
        this.children = [];
        this.file = file;
        this.root = root;
        this.treeItem = this.createItem();
        this.listen();
    }
    createItem() {
        return new classificationsItem_1.ClassificationsItem(this.file);
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
        this.children = unsorted.sort(sortUtil_1.SortUtil.sort);
        this.children.forEach(child => child.parentNode = this);
        this.treeItem.refresh(this.children.length);
        super.refresh(node);
    }
}
exports.ClassificationsNode = ClassificationsNode;
//# sourceMappingURL=classificationsNode.js.map