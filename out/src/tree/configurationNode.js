"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const configurationItem_1 = require("./configurationItem");
const vscode_1 = require("vscode");
const abstractNode_1 = require("./abstractNode");
const classificationNode_1 = require("./classificationNode");
const path = require("path");
const hintNode_1 = require("./hintNode");
const model_1 = require("../model/model");
const fileNode_1 = require("./fileNode");
const folderNode_1 = require("./folderNode");
const hintsNode_1 = require("./hintsNode");
const classificationsNode_1 = require("./classificationsNode");
const sortUtil_1 = require("./sortUtil");
const resultsNode_1 = require("./resultsNode");
class ConfigurationNode extends abstractNode_1.AbstractNode {
    constructor(config, grouping, modelService, onNodeCreateEmitter, dataProvider) {
        super(config, modelService, onNodeCreateEmitter, dataProvider);
        this.classifications = [];
        this.hints = [];
        this.issueFiles = new Map();
        this.issueNodes = new Map();
        this.resourceNodes = new Map();
        this.childNodes = new Map();
        this.results = [];
        this.grouping = grouping;
        this.treeItem = this.createItem();
        this.listen();
    }
    createItem() {
        return new configurationItem_1.ConfigurationItem(this.config);
    }
    delete() {
        return Promise.resolve();
    }
    getChildren() {
        return Promise.resolve(this.results);
    }
    hasMoreChildren() {
        return this.results.length > 0;
    }
    listen() {
        this.reload();
        this.config.onChanged.on(change => {
            if (change.type === model_1.ChangeType.MODIFIED &&
                change.name === 'name') {
                this.refresh(this);
            }
        });
        this.config.onResultsLoaded.on(() => {
            this.reload();
        });
    }
    reload() {
        const base = [__dirname, '..', '..', '..', 'resources'];
        this.treeItem.iconPath = {
            light: path.join(...base, 'light', 'Loading.svg'),
            dark: path.join(...base, 'dark', 'Loading.svg')
        };
        if (!this.config.results) {
            this.results = [];
            this.treeItem.collapsibleState = vscode_1.TreeItemCollapsibleState.None;
            super.refresh(this);
            setTimeout(() => {
                this.treeItem.iconPath = undefined;
                super.refresh(this);
            }, 2000);
            return;
        }
        else {
            this.treeItem.collapsibleState = vscode_1.TreeItemCollapsibleState.Expanded;
            this.results = [
                new resultsNode_1.ResultsNode(this.config, this.modelService, this.onNodeCreateEmitter, this.dataProvider, this)
            ];
            this.computeIssues();
            super.refresh(this);
            this.dataProvider.reveal(this, true);
            setTimeout(() => {
                this.treeItem.iconPath = undefined;
                this.refresh(this);
            }, 2000);
        }
    }
    clearModel() {
        this.classifications = [];
        this.hints = [];
        this.issueFiles.clear();
        this.issueNodes.clear();
        this.resourceNodes.clear();
        this.childNodes.clear();
    }
    computeIssues() {
        this.clearModel();
        if (this.config.results) {
            this.config.results.getClassifications().forEach(classification => {
                const root = vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.file(classification.file));
                if (!root)
                    return;
                this.classifications.push(classification);
                this.initIssue(classification, this.createClassificationNode(classification));
            });
            this.config.results.getHints().forEach(hint => {
                const root = vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.file(hint.file));
                if (!root)
                    return;
                this.hints.push(hint);
                this.initIssue(hint, this.createHintNode(hint));
            });
        }
    }
    initIssue(issue, node) {
        let nodes = this.issueFiles.get(issue.file);
        if (!nodes) {
            nodes = [];
            this.issueFiles.set(issue.file, nodes);
        }
        nodes.push(issue);
        this.issueNodes.set(issue, node);
        this.buildResourceNodes(issue.file);
    }
    buildResourceNodes(file) {
        const root = vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.file(file));
        if (!this.resourceNodes.has(file)) {
            this.resourceNodes.set(file, new fileNode_1.FileNode(this.config, file, this.modelService, this.onNodeCreateEmitter, this.dataProvider, this));
            if (!this.childNodes.has(root.uri.fsPath)) {
                const folder = new folderNode_1.FolderNode(this.config, root.uri.fsPath, this.modelService, this.onNodeCreateEmitter, this.dataProvider, this);
                this.childNodes.set(root.uri.fsPath, folder);
                this.resourceNodes.set(root.uri.fsPath, folder);
            }
            const getParent = location => path.resolve(location, '..');
            let parent = getParent(file);
            while (parent) {
                if (this.resourceNodes.has(parent)) {
                    break;
                }
                this.resourceNodes.set(parent, new folderNode_1.FolderNode(this.config, parent, this.modelService, this.onNodeCreateEmitter, this.dataProvider, this));
                parent = getParent(parent);
            }
        }
    }
    getChildNodes(node) {
        let children = [];
        if (node instanceof resultsNode_1.ResultsNode) {
            if (this.grouping.groupByFile) {
                const children = Array.from(this.childNodes.values());
                return children.sort(sortUtil_1.SortUtil.sort);
            }
            return Array.from(this.issueNodes.values());
        }
        if (node instanceof fileNode_1.FileNode) {
            const issues = this.issueFiles.get(node.file);
            if (issues) {
                issues.forEach(issue => children.push(this.issueNodes.get(issue)));
            }
        }
        else if (node instanceof hintsNode_1.HintsNode) {
            const file = node.file;
            children = this.hints.filter(issue => issue.file === file)
                .map(hint => this.issueNodes.get(hint));
        }
        else if (node instanceof classificationsNode_1.ClassificationsNode) {
            const file = node.file;
            children = this.classifications.filter(issue => issue.file === file)
                .map(classification => this.issueNodes.get(classification));
        }
        else {
            const segments = this.getChildSegments(node.folder);
            segments.forEach(segment => children.push(this.resourceNodes.get(segment)));
        }
        return children;
    }
    getChildSegments(segment) {
        const children = [];
        this.resourceNodes.forEach((value, key) => {
            if (key !== segment && key.includes(segment)) {
                if (path.resolve(key, '..') === segment) {
                    children.push(key);
                }
            }
        });
        return children;
    }
    refresh(node) {
        this.treeItem.refresh();
        super.refresh(node);
    }
    createClassificationNode(classification) {
        const node = new classificationNode_1.ClassificationNode(classification, this.config, this.modelService, this.onNodeCreateEmitter, this.dataProvider);
        node.root = this;
        this.onNodeCreateEmitter.fire(node);
        return node;
    }
    createHintNode(hint) {
        const node = new hintNode_1.HintNode(hint, this.config, this.modelService, this.onNodeCreateEmitter, this.dataProvider);
        node.root = this;
        this.onNodeCreateEmitter.fire(node);
        return node;
    }
    getReport() {
        return this.config.getReport();
    }
    deleteIssue(node) {
        const issue = node.getIssue();
        this.config.deleteIssue(issue);
        this.issueNodes.delete(issue);
        const file = issue.file;
        const nodes = this.issueFiles.get(file);
        if (nodes) {
            const index = nodes.indexOf(issue);
            if (index > -1) {
                nodes.splice(index, 1);
            }
            if (nodes.length === 0) {
                this.resourceNodes.delete(file);
                let parentToRefresh = undefined;
                const getParentFolderPath = location => path.resolve(location, '..');
                let parentFolderPath = getParentFolderPath(file);
                while (parentFolderPath) {
                    const parentFolder = this.resourceNodes.get(parentFolderPath);
                    if (!parentFolder)
                        break;
                    const children = this.getChildSegments(parentFolderPath);
                    if (children.length > 0) {
                        parentToRefresh = parentFolder;
                        break;
                    }
                    this.resourceNodes.delete(parentFolderPath);
                    const root = vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.file(parentFolderPath));
                    if (parentFolderPath === root.uri.fsPath && this.childNodes.has(parentFolderPath)) {
                        this.childNodes.delete(parentFolderPath);
                        parentToRefresh = parentFolder.parentNode;
                        break;
                    }
                    parentFolderPath = getParentFolderPath(parentFolderPath);
                }
                if (parentToRefresh) {
                    parentToRefresh.refresh(parentToRefresh);
                }
            }
            else {
                node.parentNode.refresh(node.parentNode);
            }
        }
    }
    markIssueAsComplete(node) {
        const issue = node.getIssue();
        this.config.markIssueAsComplete(issue);
    }
}
exports.ConfigurationNode = ConfigurationNode;
//# sourceMappingURL=configurationNode.js.map