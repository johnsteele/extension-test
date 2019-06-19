"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const folderNode_1 = require("./folderNode");
class SortUtil {
    static sort(node1, node2) {
        if (node1 instanceof folderNode_1.FolderNode && !(node2 instanceof folderNode_1.FolderNode)) {
            return -1;
        }
        if (node2 instanceof folderNode_1.FolderNode && !(node1 instanceof folderNode_1.FolderNode)) {
            return 1;
        }
        return SortUtil.compare(node1.getLabel(), node2.getLabel());
    }
    static compare(one, other) {
        const a = one || '';
        const b = other || '';
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
        const result = collator.compare(a, b);
        if (result === 0 && a !== b) {
            return a < b ? -1 : 1;
        }
        return result;
    }
}
exports.SortUtil = SortUtil;
//# sourceMappingURL=sortUtil.js.map