"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const testRunner = require("vscode/lib/testrunner");
testRunner.configure({
    ui: 'tdd',
    useColors: true
});
module.exports = testRunner;
//# sourceMappingURL=index.js.map