"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const cp = require("child_process");
const os = require("os");
const STARTED_REGEX = /.*Red Hat Application Migration Toolkit (.*)/;
class RhamtRunner {
    static run(executable, data, startTimeout, out) {
        return new Promise((resolve, reject) => {
            let started = false;
            const process = cp.spawn(executable, data, { cwd: os.homedir() });
            const outputListener = (data) => {
                const line = data.toString();
                out(line);
                if (STARTED_REGEX.exec(line) && !started) {
                    started = true;
                    resolve(process);
                }
            };
            process.stdout.addListener('data', outputListener);
            setTimeout(() => {
                if (!started) {
                    process.kill();
                    reject(`rhamt-cli startup time exceeded ${startTimeout}ms.`);
                }
            }, startTimeout);
        });
    }
}
exports.RhamtRunner = RhamtRunner;
//# sourceMappingURL=rhamtRunner.js.map