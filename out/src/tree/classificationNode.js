"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const abstractNode_1 = require("./abstractNode");
const classificationItem_1 = require("./classificationItem");
class ClassificationNode extends abstractNode_1.AbstractNode {
    constructor(classification, config, modelService, onNodeCreateEmitter, dataProvider) {
        super(config, modelService, onNodeCreateEmitter, dataProvider);
        this.classification = classification;
        this.treeItem = this.createItem();
    }
    getChildren() {
        return Promise.resolve([]);
    }
    delete() {
        return Promise.resolve();
    }
    createItem() {
        const item = new classificationItem_1.ClassificationItem(this.classification);
        return item;
    }
    getReport() {
        return this.classification.report;
    }
    getIssue() {
        return this.classification;
    }
    setComplete() {
        this.classification.complete = true;
        this.config.markIssueAsComplete(this.getIssue());
        this.treeItem.refresh();
        this.dataProvider.refresh(this);
    }
}
exports.ClassificationNode = ClassificationNode;
//# sourceMappingURL=classificationNode.js.map