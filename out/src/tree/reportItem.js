"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const modelService_1 = require("../model/modelService");
const path = require("path");
class ReportItem extends vscode_1.TreeItem {
    constructor(config) {
        super(ReportItem.LABEL);
        this._id = modelService_1.ModelService.generateUniqueId();
        this.collapsibleState = vscode_1.TreeItemCollapsibleState.None;
        this.config = config;
    }
    delete() {
    }
    get iconPath() {
        const base = [__dirname, '..', '..', '..', 'resources'];
        return {
            light: path.join(...base, 'light', 'file_type_log.svg'),
            dark: path.join(...base, 'dark', 'file_type_log.svg')
        };
    }
    get id() {
        return this._id;
    }
    get tooltip() {
        return '';
    }
    get commandId() {
        return 'rhamt.openReport';
    }
    getReport() {
        return this.config.getReport();
    }
    get command() {
        return {
            command: 'rhamt.openReport',
            title: '',
            arguments: [this]
        };
    }
    get contextValue() {
        return 'report';
    }
}
ReportItem.LABEL = 'Report';
exports.ReportItem = ReportItem;
//# sourceMappingURL=reportItem.js.map