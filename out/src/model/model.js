"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const events_1 = require("../events");
const path = require("path");
class RhamtModel {
    constructor() {
        this.configurations = [];
    }
    exists(name) {
        for (const config of this.configurations) {
            if (config.name === name) {
                return true;
            }
        }
        return false;
    }
}
exports.RhamtModel = RhamtModel;
var AnalysisState;
(function (AnalysisState) {
    AnalysisState.ANALYZING = 0;
    AnalysisState.STOPPED = 1;
    AnalysisState.COMPLETED = 2;
})(AnalysisState = exports.AnalysisState || (exports.AnalysisState = {}));
var ChangeType;
(function (ChangeType) {
    ChangeType.MODIFIED = 0;
    ChangeType.ADDED = 1;
    ChangeType.DELETED = 2;
    ChangeType.PROGRESS = 3;
    ChangeType.CANCELLED = 4;
    ChangeType.ERROR = 5;
    ChangeType.COMPLETE = 6;
    ChangeType.STARTED = 7;
    ChangeType.CLONING = 8;
})(ChangeType = exports.ChangeType || (exports.ChangeType = {}));
class RhamtConfiguration {
    constructor() {
        this.onChanged = new events_1.rhamtEvents.TypedEvent();
        this.onResultsLoaded = new events_1.rhamtEvents.TypedEvent();
        this.options = {};
    }
    set results(results) {
        this._results = results;
        this.onResultsLoaded.emit(undefined);
    }
    get results() {
        return this._results;
    }
    getReport() {
        return path.resolve(this.options['output'], 'index.html');
    }
    getResultsLocation() {
        return path.resolve(this.options['output'], 'results.xml');
    }
    deleteIssue(issue) {
        this.results.deleteIssue(issue);
    }
    markIssueAsComplete(issue) {
        this.results.markIssueAsComplete(issue);
    }
}
exports.RhamtConfiguration = RhamtConfiguration;
//# sourceMappingURL=model.js.map