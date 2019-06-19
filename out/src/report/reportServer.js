"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const express = require("express");
const path = require("path");
const serveStatic = require("serve-static");
class ReportServer {
    constructor(endpoints) {
        this.endpoints = endpoints;
    }
    start() {
        this.app = express();
        this.server = this.app.listen(this.endpoints.port());
        this.configServer();
    }
    configServer() {
        this.app.use(serveStatic(path.join(this.endpoints.reportsRoot())));
        this.app.use(function (err, req, res, next) {
            err.status = 404;
            next(err);
        });
    }
    dispose() {
        this.server.close();
    }
}
exports.ReportServer = ReportServer;
//# sourceMappingURL=reportServer.js.map