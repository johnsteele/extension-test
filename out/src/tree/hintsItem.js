"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const modelService_1 = require("../model/modelService");
class HintsItem extends vscode_1.TreeItem {
    constructor(file) {
        super(file);
        this.id = modelService_1.ModelService.generateUniqueId();
        this.collapsibleState = vscode_1.TreeItemCollapsibleState.None;
    }
    refresh(count) {
        this.label = `Hints (${count})`;
        this.collapsibleState = vscode_1.TreeItemCollapsibleState.Collapsed;
    }
}
exports.HintsItem = HintsItem;
//# sourceMappingURL=hintsItem.js.map