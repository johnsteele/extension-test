"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rhamtExplorer_1 = require("./rhamtExplorer");
class RhamtView {
    constructor(context, modelService) {
        this.context = context;
        this.modelService = modelService;
        this.createExplorer();
        this.context.subscriptions.push(this);
    }
    createExplorer() {
        return new rhamtExplorer_1.RhamtExplorer(this.context, this.modelService);
    }
    dispose() {
    }
}
exports.RhamtView = RhamtView;
//# sourceMappingURL=rhamtView.js.map