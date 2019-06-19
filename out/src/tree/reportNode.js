"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const abstractNode_1 = require("./abstractNode");
const reportItem_1 = require("./reportItem");
class ReportNode extends abstractNode_1.AbstractNode {
    constructor(config, modelService, onNodeCreateEmitter, dataProvider, root) {
        super(config, modelService, onNodeCreateEmitter, dataProvider);
        this.root = root;
        this.treeItem = this.createItem();
    }
    getChildren() {
        return Promise.resolve([]);
    }
    delete() {
        return Promise.resolve();
    }
    createItem() {
        return new reportItem_1.ReportItem(this.config);
    }
}
exports.ReportNode = ReportNode;
//# sourceMappingURL=reportNode.js.map