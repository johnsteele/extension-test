"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const abstractNode_1 = require("./abstractNode");
const folderItem_1 = require("./folderItem");
const path = require("path");
const sortUtil_1 = require("./sortUtil");
class FolderNode extends abstractNode_1.AbstractNode {
    constructor(config, folder, modelService, onNodeCreateEmitter, dataProvider, root) {
        super(config, modelService, onNodeCreateEmitter, dataProvider);
        this.loading = false;
        this.children = [];
        this.folder = folder;
        this.root = root;
        this.treeItem = this.createItem();
        this.listen();
    }
    createItem() {
        return new folderItem_1.FolderItem(this.folder);
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
    updateIcon(name) {
        const base = [__dirname, '..', '..', '..', 'resources'];
        this.treeItem.iconPath = {
            light: path.join(...base, 'light', name),
            dark: path.join(...base, 'dark', name)
        };
    }
    listen() {
        this.loading = true;
        this.updateIcon('Loading.svg');
        this.treeItem.collapsibleState = vscode_1.TreeItemCollapsibleState.None;
        super.refresh(this);
        setTimeout(() => {
            this.loading = false;
            this.refresh(this);
        }, 1000);
    }
    refresh(node) {
        this.updateIcon('default_folder.svg');
        const unsorted = this.root.getChildNodes(this);
        this.children = unsorted.sort(sortUtil_1.SortUtil.sort);
        this.treeItem.refresh();
        super.refresh(node);
    }
}
exports.FolderNode = FolderNode;
//# sourceMappingURL=folderNode.js.map