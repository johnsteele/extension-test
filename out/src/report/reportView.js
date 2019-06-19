"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const reportServer_1 = require("./reportServer");
class ReportView {
    constructor(context, endpoints) {
        this.view = undefined;
        this.context = context;
        this.endpoints = endpoints;
        this.reportServer = new reportServer_1.ReportServer(this.endpoints);
        this.reportServer.start();
        this.context.subscriptions.push(vscode_1.commands.registerCommand('rhamt.openReport', item => {
            const location = item.getReport();
            const relative = location.replace(`${this.endpoints.reportsRoot()}/`, '');
            const report = `${this.endpoints.location()}/${relative}`;
            this.open(report);
        }));
    }
    open(location) {
        if (!this.view) {
            this.view = vscode_1.window.createWebviewPanel('rhamtReportView', 'RHAMT Report', vscode_1.ViewColumn.One, {
                enableScripts: true,
                enableCommandUris: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this.endpoints.resourcesRoot()]
            });
            this.view.onDidDispose(() => {
                this.view = undefined;
            });
        }
        this.view.webview.html = this.render(location);
        this.view.reveal(vscode_1.ViewColumn.One);
    }
    render(location) {
        const html = `
            <!DOCTYPE html>
            <html>
                <body style="margin:0px;padding:0px;overflow:hidden">
                    <iframe src="${location}"
                        frameborder="0" style="overflow:hidden;overflow-x:hidden;overflow-y:hidden;height:100%;width:100%;position:absolute;top:0px;left:0px;right:0px;bottom:0px" height="100%" width="100%"></iframe>
                </body>
            </html>
        `;
        return html;
    }
}
exports.ReportView = ReportView;
//# sourceMappingURL=reportView.js.map