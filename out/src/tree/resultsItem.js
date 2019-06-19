"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const modelService_1 = require("../model/modelService");
class ResultsItem extends vscode_1.TreeItem {
    constructor() {
        super('Loading results...');
        this.id = modelService_1.ModelService.generateUniqueId();
        this.collapsibleState = vscode_1.TreeItemCollapsibleState.None;
    }
    refresh(executedTimestamp) {
        this.label = `Analysis Results (${executedTimestamp})`;
        this.collapsibleState = vscode_1.TreeItemCollapsibleState.Collapsed;
    }
    get contextValue() {
        return 'results';
    }
}
exports.ResultsItem = ResultsItem;
//# sourceMappingURL=resultsItem.js.map