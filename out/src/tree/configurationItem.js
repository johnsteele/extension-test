"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const modelService_1 = require("../model/modelService");
class ConfigurationItem extends vscode_1.TreeItem {
    constructor(config) {
        super('Loading...');
        this.id = modelService_1.ModelService.generateUniqueId();
        this.collapsibleState = vscode_1.TreeItemCollapsibleState.None;
        this.config = config;
        this.refresh();
    }
    get commandId() {
        return 'rhamt.openConfiguration';
    }
    get command() {
        return {
            command: 'rhamt.openConfiguration',
            title: '',
            arguments: [this.config]
        };
    }
    get contextValue() {
        return 'rhamtConfiguration';
    }
    refresh() {
        this.label = this.config.name;
    }
}
exports.ConfigurationItem = ConfigurationItem;
//# sourceMappingURL=configurationItem.js.map