"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const abstractNode_1 = require("./abstractNode");
const hintItem_1 = require("./hintItem");
class HintNode extends abstractNode_1.AbstractNode {
    constructor(hint, config, modelService, onNodeCreateEmitter, dataProvider) {
        super(config, modelService, onNodeCreateEmitter, dataProvider);
        this.hint = hint;
        this.treeItem = this.createItem();
    }
    getChildren() {
        return Promise.resolve([]);
    }
    delete() {
        return Promise.resolve();
    }
    createItem() {
        const item = new hintItem_1.HintItem(this.hint);
        return item;
    }
    getReport() {
        return this.hint.report;
    }
    getIssue() {
        return this.hint;
    }
    setComplete() {
        this.hint.complete = true;
        this.config.markIssueAsComplete(this.getIssue());
        this.treeItem.refresh();
        this.dataProvider.refresh(this);
    }
}
exports.HintNode = HintNode;
//# sourceMappingURL=hintNode.js.map