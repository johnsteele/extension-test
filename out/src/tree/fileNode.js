"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const abstractNode_1 = require("./abstractNode");
const path = require("path");
const fileItem_1 = require("./fileItem");
const hintNode_1 = require("./hintNode");
const hintsNode_1 = require("./hintsNode");
const classificationsNode_1 = require("./classificationsNode");
const classificationNode_1 = require("./classificationNode");
class FileNode extends abstractNode_1.AbstractNode {
    constructor(config, file, modelService, onNodeCreateEmitter, dataProvider, root) {
        super(config, modelService, onNodeCreateEmitter, dataProvider);
        this.loading = false;
        this.children = [];
        this.issues = [];
        this.file = file;
        this.root = root;
        this.treeItem = this.createItem();
        this.listen();
    }
    createItem() {
        return new fileItem_1.FileItem(this.file);
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
        super.refresh(this);
        setTimeout(() => {
            this.loading = false;
            this.refresh(this);
        }, 1000);
    }
    refresh(node) {
        this.children = [];
        const ext = path.extname(this.file);
        const icon = ext === '.xml' ? 'file_type_xml.svg' :
            ext === '.java' ? 'file_type_class.svg' :
                'default_file.svg';
        const base = [__dirname, '..', '..', '..', 'resources'];
        this.treeItem.iconPath = {
            light: path.join(...base, 'light', icon),
            dark: path.join(...base, 'dark', icon)
        };
        this.issues = this.root.getChildNodes(this);
        if (this.issues.find(issue => issue instanceof hintNode_1.HintNode)) {
            this.children.push(new hintsNode_1.HintsNode(this.config, this.file, this.modelService, this.onNodeCreateEmitter, this.dataProvider, this.root));
        }
        if (this.issues.find(issue => issue instanceof classificationNode_1.ClassificationNode)) {
            this.children.push(new classificationsNode_1.ClassificationsNode(this.config, this.file, this.modelService, this.onNodeCreateEmitter, this.dataProvider, this.root, this));
        }
        this.treeItem.refresh();
        super.refresh(node);
    }
}
exports.FileNode = FileNode;
//# sourceMappingURL=fileNode.js.map