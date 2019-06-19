"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode = require("vscode");
const fs = require("fs");
const os = require("os");
const path_1 = require("path");
function rndName() {
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);
}
exports.rndName = rndName;
function createRandomFile(contents = '', dir = os.tmpdir(), ext = '.java') {
    return new Promise((resolve, reject) => {
        const tmpFile = path_1.join(dir, rndName() + ext);
        fs.writeFile(tmpFile, contents, error => {
            if (error) {
                return reject(error);
            }
            resolve(vscode.Uri.file(tmpFile));
        });
    });
}
exports.createRandomFile = createRandomFile;
//# sourceMappingURL=utils.js.map