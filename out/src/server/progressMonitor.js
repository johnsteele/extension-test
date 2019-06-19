"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
class ProgressMonitor {
    constructor(delegate, onComplete) {
        this.delegate = delegate;
        this.onComplete = onComplete;
        this.started = false;
        this.preWork = 0;
        this.title = '';
        this.totalWork = 0;
        this.finalizing = false;
        this._done = false;
    }
    handleMessage(msg) {
        this.delegateMessage(msg);
    }
    delegateMessage(msg) {
        if (msg.op === 'beginTask') {
            const task = msg.task;
            const work = msg.totalWork;
            this.beginTask(task, work);
            return;
        }
        if (msg.op === 'complete') {
            this.finalize();
            return;
        }
        const value = msg.value;
        switch (msg.op) {
            case 'logMessage':
                this.logMessage(value);
                break;
            case 'done':
                this.done();
                break;
            case 'setTaskName':
                this.setTaskName(value);
                break;
            case 'subTask':
                this.subTask(value);
                break;
            case 'worked':
                this.worked(value);
                break;
        }
        if (!this.started) {
            this.started = true;
            this.report('Launching analysis...');
        }
    }
    logMessage(message) {
    }
    beginTask(task, total) {
        this.title = 'Analysis in progress';
        this.totalWork = total;
        this.setTitle(this.title);
    }
    done() {
        this._done = true;
        this.report('Finalizing...');
    }
    isDone() {
        return this._done;
    }
    setTaskName(task) {
        this.report(task);
    }
    subTask(name) {
    }
    worked(worked) {
        this.preWork += worked;
        this.setTitle(this.computeTitle());
    }
    getPercentangeDone() {
        return Math.trunc(Math.min((this.preWork * 100 / this.totalWork), 100));
    }
    computeTitle() {
        const done = this.getPercentangeDone();
        let label = this.title;
        if (done > 0) {
            label += ` (${done} % done)`;
        }
        return label;
    }
    setTitle(value) {
        this.report(value);
    }
    report(msg) {
        if (!this._done && !this.finalizing) {
            if (this.getPercentangeDone() === 99) {
                this.finalizing = true;
                setTimeout(() => null, 500);
                msg = 'Finalizing...';
            }
            this.delegate.report({ message: msg });
        }
        else {
            console.log('progress done or cancelled, cannot report: ' + msg);
        }
    }
    finalize() {
        console.log('analysis complete...');
        this.finalizing = true;
        setTimeout(() => null, 500);
        this.onComplete();
    }
}
exports.ProgressMonitor = ProgressMonitor;
//# sourceMappingURL=progressMonitor.js.map