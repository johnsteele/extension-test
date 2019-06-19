"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const vscode_1 = require("vscode");
const events_1 = require("../events");
const path = require("path");
const openLink = require("opn");
const analysisResults_1 = require("../model/analysisResults");
class IssueDetailsView {
    constructor(context, endpoints) {
        this.onEditorClosed = new events_1.rhamtEvents.TypedEvent();
        this.view = undefined;
        this.context = context;
        this.endpoints = endpoints;
        this.context.subscriptions.push(vscode_1.commands.registerCommand('rhamt.openIssueDetails', item => {
            this.open(item.getIssue(), true);
        }));
        this.context.subscriptions.push(vscode_1.commands.registerCommand('rhamt.openIssueReport', item => {
            analysisResults_1.AnalysisResultsUtil.openReport(item);
        }));
        this.context.subscriptions.push(vscode_1.commands.registerCommand('rhamt.openLink', item => {
            openLink(item);
        }));
    }
    open(issue, reveal) {
        if (!reveal && !this.view) {
            return;
        }
        if (!this.view) {
            this.view = vscode_1.window.createWebviewPanel('rhamtIssueDetails', 'Issue Details', vscode_1.ViewColumn.Two, {
                enableScripts: true,
                enableCommandUris: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this.endpoints.resourcesRoot()]
            });
            this.view.onDidDispose(() => {
                this.view = undefined;
                this.onEditorClosed.emit(undefined);
            });
        }
        this.view.webview.html = this.render(issue);
        if (reveal) {
            this.view.reveal(vscode_1.ViewColumn.Two);
        }
    }
    render(issue) {
        const cssPath = vscode_1.Uri.file(path.join(this.context.extensionPath, 'resources', 'dark', 'issue-details.css'));
        const config = issue.getConfiguration();
        const reports = path.join(config.options['output'], 'reports', path.sep);
        let report = '';
        if (issue.report && issue.report.startsWith(reports)) {
            report = issue.report.replace(reports, '');
            report = `<a class="report-link" href="command:rhamt.openIssueReport?%22${issue.report}%22">Open Report</a>`;
        }
        const showdown = require('showdown');
        const converter = new showdown.Converter();
        const noDetails = '—';
        const isHint = 'hint' in issue;
        let body = '';
        body += '<h3>Title</h3>';
        body += issue.title ? issue.title : noDetails;
        if (report) {
            body += '<h3>Report</h3>';
            body += report;
        }
        body += `<h3>${isHint ? 'Message' : 'Description'}</h3>`;
        body += (isHint && issue.hint) ? converter.makeHtml(issue.hint) : (!isHint && issue.description) ? issue.description : noDetails;
        body += '<h3>Category ID</h3>';
        body += issue.category ? issue.category : noDetails;
        body += '<h3>Level of Effort</h3>';
        body += issue.effort ? issue.effort : noDetails;
        body += '<h3>Rule ID</h3>';
        body += issue.ruleId ? issue.ruleId : noDetails;
        body += '<h3>More Information</h3>';
        if (issue.links.length === 0) {
            body += noDetails;
        }
        issue.links.forEach(link => {
            body += `
                <p>${link.title}</p>
                <ul>
                    <li>
                        <a class="report-link" href="command:rhamt.openLink?%22${link.url}%22">${link.url}</a>
                    </li>
                </ul>
            `;
        });
        if (isHint) {
            body += '<h3>Source Snippet</h3>';
            body += issue.sourceSnippet ? issue.sourceSnippet : noDetails;
        }
        let html;
        if (issue) {
            html = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta http-equiv="Content-Type" content="text/html;charset=utf-8">
                        <link href="${cssPath.with({ scheme: 'vscode-resource' })}" rel="stylesheet" type="text/css">
                    </head>
                    <body">
                    <div style="margin:0px;padding:0px;" class="view">
                        ${body}
                    </div>
                    </body>
                </html>
            `;
        }
        else {
            html = `
                <!DOCTYPE html>
                <html>
                    <body style="margin:0px;padding:0px;overflow:hidden; margin-left: 20px;">
                    <p>No issue details available.</p>
                    </body>
                </html>
            `;
        }
        return html;
    }
}
exports.IssueDetailsView = IssueDetailsView;
//# sourceMappingURL=issueDetailsView.js.map