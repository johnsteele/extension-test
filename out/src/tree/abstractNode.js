"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modelService_1 = require("../model/modelService");
class AbstractNode {
    constructor(config, modelService, onNodeCreateEmitter, dataProvider) {
        this._id = modelService_1.ModelService.generateUniqueId();
        this.config = config;
        this.modelService = modelService;
        this.onNodeCreateEmitter = onNodeCreateEmitter;
        this.dataProvider = dataProvider;
    }
    get id() {
        return this._id;
    }
    refresh(node) {
        this.dataProvider.refresh(node);
    }
    getLabel() {
        return this.treeItem.label;
    }
}
exports.AbstractNode = AbstractNode;
//# sourceMappingURL=abstractNode.js.map