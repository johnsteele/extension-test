"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const assert = require("assert");
const vscode = require("vscode");
const path = require("path");
const model_1 = require("../src/model/model");
const modelService_1 = require("../src/model/modelService");
suite('RHAMT / Issue Explorer', () => {
    let modelService;
    setup(() => {
        modelService = new modelService_1.ModelService(new model_1.RhamtModel(), __dirname, getReportEndpoints(__dirname));
    });
    test('model service', () => {
        const name = 'rhamtConfiguration';
        const config = modelService.createConfigurationWithName(name);
        assert.equal(config.name, name);
    });
    function getReportEndpoints(out) {
        return {
            port: () => {
                return process.env.RAAS_PORT || String(61435);
            },
            host: () => {
                return 'localhost';
            },
            location: () => {
                return `http://${this.host()}:${this.port()}`;
            },
            resourcesRoot: () => {
                return vscode.Uri.file(path.join(out, 'out'));
            },
            reportsRoot: () => {
                return out;
            }
        };
    }
});
//# sourceMappingURL=extension.test.js.map