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
const SOURCE = [
    'websphere',
    'jbpm',
    'soa',
    'seam',
    'eap7',
    'hibernate',
    'oraclejdk',
    'eap6',
    'rmi',
    'jrun',
    'glassfish',
    'java',
    'orion',
    'eap',
    'hibernate-search',
    'log4j',
    'soa-p',
    'rpc',
    'sonic',
    'weblogic',
    'drools',
    'java-ee',
    'javaee',
    'sonicesb',
    'jonas',
    'resin',
    'resteasy'
];
const TARGET = [
    'cloud-readiness',
    'jbpm',
    'drools',
    'fsw',
    'eap7',
    'hibernate',
    'java-ee',
    'eap6',
    'fuse',
    'openjdk',
    'eap',
    'camel',
    'linux',
    'hibernate-search',
    'resteasy'
];
TARGET.sort();
SOURCE.sort();
class OptionsBuilder {
    static build(modelService) {
        return __awaiter(this, void 0, void 0, function* () {
            const name = yield vscode.window.showInputBox({
                prompt: 'Configuration name',
                validateInput: (value) => {
                    if (value.trim().length === 0) {
                        return 'Configuration name required';
                    }
                    else if (modelService.model.exists(value)) {
                        return 'Configuration name already exists';
                    }
                }
            });
            if (!name)
                return;
            const input = yield vscode.window.showWorkspaceFolderPick({
                placeHolder: 'input folder'
            });
            if (!input) {
                if (!vscode.workspace.getWorkspaceFolder(undefined)) {
                    vscode.window.showErrorMessage('No workspace folders found for specifying RHAMT input.');
                }
                return;
            }
            const target = yield vscode.window.showQuickPick(TARGET, {
                canPickMany: true,
                placeHolder: 'target (technology to migrate to. defaults to eap7)'
            });
            if (!target)
                return;
            const source = yield vscode.window.showQuickPick(SOURCE, {
                canPickMany: true,
                placeHolder: 'source (technology to migrate from)'
            });
            const config = modelService.createConfigurationWithName(name);
            config.options['input'] = input.uri.fsPath;
            config.options['target'] = target;
            if (source) {
                config.options['source'] = source;
            }
            return config;
        });
    }
}
exports.OptionsBuilder = OptionsBuilder;
//# sourceMappingURL=optionsBuilder.js.map