"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const modelService_1 = require("../model/modelService");
const path = require("path");
class HintItem extends vscode_1.TreeItem {
    constructor(hint) {
        super(hint.title);
        this._id = modelService_1.ModelService.generateUniqueId();
        this.collapsibleState = vscode_1.TreeItemCollapsibleState.None;
        this.hint = hint;
        this.refresh();
    }
    delete() {
    }
    getIconPath() {
        const base = [__dirname, '..', '..', '..', 'resources'];
        if (this.hint.complete) {
            return {
                light: path.join(...base, 'light', 'complete.svg'),
                dark: path.join(...base, 'dark', 'complete.svg')
            };
        }
        else if (!this.hint.category || this.hint.category.includes('error') || this.hint.category.includes('mandatory')) {
            return {
                light: path.join(...base, 'light', 'status-error.svg'),
                dark: path.join(...base, 'dark', 'status-error-inverse.svg')
            };
        }
        else if (this.hint.category.includes('potential')) {
            return {
                light: path.join(...base, 'light', 'status-warning.svg'),
                dark: path.join(...base, 'dark', 'status-warning-inverse.svg')
            };
        }
        return {
            light: path.join(...base, 'light', 'status-info.svg'),
            dark: path.join(...base, 'dark', 'status-info-inverse.svg')
        };
    }
    get id() {
        return this._id;
    }
    get tooltip() {
        return this.hint.hint;
    }
    get commandId() {
        return 'rhamt.openDoc';
    }
    get command() {
        return {
            command: 'rhamt.openDoc',
            title: '',
            arguments: [
                {
                    uri: this.hint.file,
                    line: this.hint.lineNumber - 1,
                    column: this.hint.column,
                    length: this.hint.length + this.hint.column,
                    issue: this.hint
                }
            ]
        };
    }
    get contextValue() {
        return 'issue';
    }
    refresh() {
        this.iconPath = this.getIconPath();
        this.label = `${this.hint.title} [rule-id: ${this.hint.ruleId}]`;
    }
}
exports.HintItem = HintItem;
//# sourceMappingURL=hintItem.js.map