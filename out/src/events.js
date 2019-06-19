"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var RhamtEventType;
(function (RhamtEventType) {
    RhamtEventType[RhamtEventType["STARTING"] = 0] = "STARTING";
    RhamtEventType[RhamtEventType["STARTING_ERROR"] = 1] = "STARTING_ERROR";
    RhamtEventType[RhamtEventType["STARTED"] = 2] = "STARTED";
    RhamtEventType[RhamtEventType["STOPPED"] = 3] = "STOPPED";
    RhamtEventType[RhamtEventType["MESSAGE"] = 4] = "MESSAGE";
})(RhamtEventType = exports.RhamtEventType || (exports.RhamtEventType = {}));
var rhamtEvents;
(function (rhamtEvents) {
    class TypedEvent {
        constructor() {
            this.listeners = [];
            this.listenersOncer = [];
            this.on = (listener) => {
                this.listeners.push(listener);
                return {
                    dispose: () => this.off(listener)
                };
            };
            this.once = (listener) => {
                this.listenersOncer.push(listener);
            };
            this.off = (listener) => {
                const callbackIndex = this.listeners.indexOf(listener);
                if (callbackIndex > -1) {
                    this.listeners.splice(callbackIndex, 1);
                }
            };
            this.emit = (event) => {
                this.listeners.forEach(listener => listener(event));
                this.listenersOncer.forEach(listener => listener(event));
                this.listenersOncer = [];
            };
            this.pipe = (te) => {
                return this.on(e => te.emit(e));
            };
        }
    }
    rhamtEvents.TypedEvent = TypedEvent;
})(rhamtEvents = exports.rhamtEvents || (exports.rhamtEvents = {}));
//# sourceMappingURL=events.js.map