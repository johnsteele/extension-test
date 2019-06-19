"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const fs = require("fs");
const cheerio = require("cheerio");
const modelService_1 = require("./modelService");
const open = require("opn");
const mkdirp = require("mkdirp");
class AnalysisResultsUtil {
    static loadFromLocation(location) {
        return new Promise((resolve, reject) => {
            fs.readFile(location, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(cheerio.load(data, { xmlMode: true, recognizeSelfClosing: true }));
                }
            });
        });
    }
    static loadFomData(data) {
        return cheerio.load(data, { xmlMode: true, recognizeSelfClosing: true });
    }
    static save(dom, location) {
        return new Promise((resolve, reject) => {
            fs.writeFile(location, dom.xml(), null, e => {
                if (e)
                    reject(e);
                else
                    resolve();
            });
        });
    }
    static openReport(report) {
        open(report);
    }
}
exports.AnalysisResultsUtil = AnalysisResultsUtil;
class AnalysisResults {
    constructor(config, dom) {
        this.reports = new Map();
        this.config = config;
        this.dom = dom;
        this.loadReports();
    }
    loadReports() {
        this.dom('report-links').children().each((i, ele) => {
            const link = {};
            ele.children.forEach((child, i) => {
                switch (child.name) {
                    case 'input-file': {
                        const node = child.children[0];
                        if (node) {
                            link.input = node.nodeValue;
                        }
                        break;
                    }
                    case 'report-file': {
                        const node = child.children[0];
                        if (node) {
                            link.report = node.nodeValue;
                        }
                        break;
                    }
                }
            });
            this.reports.set(link.input, link.report);
        });
    }
    getHints() {
        const hints = [];
        this.dom('hints').children().each((i, ele) => {
            if (this.dom(ele).attr('deleted')) {
                return;
            }
            const id = modelService_1.ModelService.generateUniqueId();
            const hint = {
                id,
                quickfixes: this.getQuickfixes(ele),
                file: '',
                severity: '',
                ruleId: '',
                effort: '',
                title: '',
                links: [],
                report: '',
                originalLineSource: '',
                lineNumber: 0,
                column: 0,
                length: 0,
                sourceSnippet: '',
                category: '',
                hint: '',
                getConfiguration: () => {
                    return this.config;
                },
                dom: ele,
                complete: false
            };
            if (this.dom(ele).attr('complete')) {
                hint.complete = true;
            }
            ele.children.forEach((child, i) => {
                switch (child.name) {
                    case 'title': {
                        const node = child.children[0];
                        if (node) {
                            hint.title = node.nodeValue;
                        }
                        break;
                    }
                    case 'effort': {
                        const node = child.children[0];
                        if (node) {
                            hint.effort = node.nodeValue;
                        }
                        break;
                    }
                    case 'file': {
                        const node = child.children[0];
                        if (node) {
                            hint.file = node.nodeValue;
                            const report = this.reports.get(hint.file);
                            if (report) {
                                hint.report = report;
                            }
                        }
                        break;
                    }
                    case 'hint': {
                        const node = child.children[0];
                        if (node) {
                            hint.hint = node.nodeValue;
                        }
                        break;
                    }
                    case 'issue-category': {
                        const node = child.children[0];
                        if (node) {
                            hint.category = node.children[0].nodeValue;
                        }
                        break;
                    }
                    case 'links': {
                        break;
                    }
                    case 'quickfixes': {
                        break;
                    }
                    case 'rule-id': {
                        const node = child.children[0];
                        if (node) {
                            hint.ruleId = node.nodeValue;
                        }
                        break;
                    }
                    case 'length': {
                        const node = child.children[0];
                        if (node) {
                            hint.length = Number(node.nodeValue);
                        }
                        break;
                    }
                    case 'line-number': {
                        const node = child.children[0];
                        if (node) {
                            hint.lineNumber = Number(node.nodeValue);
                        }
                        break;
                    }
                    case 'column': {
                        const node = child.children[0];
                        if (node) {
                            hint.column = Number(node.nodeValue);
                        }
                        break;
                    }
                }
            });
            hints.push(hint);
        });
        return hints;
    }
    getQuickfixes(ele) {
        const quickfixes = [];
        return quickfixes;
    }
    getClassifications() {
        const classifications = [];
        this.dom('classifications').children().each((i, ele) => {
            if (this.dom(ele).attr('deleted')) {
                return;
            }
            const id = modelService_1.ModelService.generateUniqueId();
            const classification = {
                id,
                quickfixes: this.getQuickfixes(ele),
                file: '',
                severity: '',
                ruleId: '',
                effort: '',
                title: id,
                messageOrDescription: '',
                links: [],
                report: '',
                description: '',
                category: '',
                getConfiguration: () => {
                    return this.config;
                },
                dom: ele,
                complete: false
            };
            if (this.dom(ele).attr('complete')) {
                classification.complete = true;
            }
            ele.children.forEach((child, i) => {
                switch (child.name) {
                    case 'classification': {
                        const node = child.children[0];
                        if (node) {
                            classification.title = node.nodeValue;
                        }
                        break;
                    }
                    case 'description': {
                        const node = child.children[0];
                        if (node) {
                            classification.description = node.nodeValue;
                        }
                        break;
                    }
                    case 'effort': {
                        const node = child.children[0];
                        if (node) {
                            classification.effort = node.nodeValue;
                        }
                        break;
                    }
                    case 'file': {
                        const node = child.children[0];
                        if (node) {
                            classification.file = node.nodeValue;
                            const report = this.reports.get(classification.file);
                            if (report) {
                                classification.report = report;
                            }
                        }
                        break;
                    }
                    case 'issue-category': {
                        const node = child.children[0];
                        if (node) {
                            classification.category = node.children[0].nodeValue;
                        }
                        break;
                    }
                    case 'links': {
                        child.children.forEach((ele, i) => {
                            const link = {
                                id: modelService_1.ModelService.generateUniqueId(),
                                title: '',
                                url: ''
                            };
                            ele.children.forEach(theLink => {
                                switch (theLink.name) {
                                    case 'description': {
                                        const node = theLink.children[0];
                                        if (node) {
                                            link.title = node.nodeValue;
                                        }
                                        break;
                                    }
                                    case 'url': {
                                        const node = theLink.children[0];
                                        if (node) {
                                            link.url = node.nodeValue;
                                        }
                                        break;
                                    }
                                }
                            });
                            classification.links.push(link);
                        });
                        break;
                    }
                    case 'quickfixes': {
                        break;
                    }
                    case 'rule-id': {
                        const node = child.children[0];
                        if (node) {
                            classification.ruleId = node.nodeValue;
                        }
                        break;
                    }
                }
            });
            classifications.push(classification);
        });
        return classifications;
    }
    getClassificationsFor(file) {
        const classifications = [];
        this.getClassifications().forEach(classification => {
            if (classification.file === file) {
                classifications.push(classification);
            }
        });
        return classifications;
    }
    getHintsFor(file) {
        const hints = [];
        this.getHints().forEach(hint => {
            if (hint.file === file) {
                hints.push(hint);
            }
        });
        return hints;
    }
    deleteIssue(issue) {
        this.dom(issue.dom).attr('deleted', true);
    }
    markIssueAsComplete(issue) {
        this.dom(issue.dom).attr('complete', true);
    }
    save(out) {
        return new Promise((resolve, reject) => {
            mkdirp(require('path').dirname(out), (e) => {
                if (e)
                    reject(e);
                fs.writeFile(out, this.dom.html(), null, e => {
                    if (e)
                        reject(e);
                    else
                        resolve();
                });
            });
        });
    }
}
exports.AnalysisResults = AnalysisResults;
//# sourceMappingURL=analysisResults.js.map