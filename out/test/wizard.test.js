"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode = require("vscode");
const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require("sinon");
const path = require("path");
const optionsBuilder_1 = require("../src/optionsBuilder");
const modelService_1 = require("../src/model/modelService");
const model_1 = require("../src/model/model");
const expect = chai.expect;
chai.use(sinonChai);
suite('RHAMT / Wizard', () => {
    let sandbox;
    let inputStub;
    const name = 'val';
    const modelService = new modelService_1.ModelService(new model_1.RhamtModel(), __dirname, getReportEndpoints(__dirname));
    setup(() => {
        sandbox = sinon.createSandbox();
        inputStub = sandbox.stub(vscode.window, 'showInputBox');
    });
    teardown(() => {
        sandbox.restore();
    });
    suite('create configuration', () => {
        suite('validation', () => {
            setup(() => {
                inputStub.restore();
            });
            test('valid configuration name', () => __awaiter(this, void 0, void 0, function* () {
                let result;
                inputStub = sandbox.stub(vscode.window, 'showInputBox').onFirstCall().callsFake((options, token) => {
                    result = options.validateInput(name);
                    return Promise.resolve(name);
                });
                optionsBuilder_1.OptionsBuilder.build(modelService);
                expect(result).is.undefined;
            }));
            test('empty configuration name', () => __awaiter(this, void 0, void 0, function* () {
                let result;
                inputStub = sandbox.stub(vscode.window, 'showInputBox').onFirstCall().callsFake((options, token) => {
                    result = options.validateInput('');
                    return Promise.resolve('');
                });
                optionsBuilder_1.OptionsBuilder.build(modelService);
                expect(result).is.equals('Configuration name required');
            }));
        });
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
//# sourceMappingURL=wizard.test.js.map