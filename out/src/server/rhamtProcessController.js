"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RhamtProcessController {
    constructor(executable, server, onShutdown) {
        this.executable = executable;
        this.server = server;
        this.onShutdown = onShutdown;
        this.init();
    }
    init() {
        const shutdown = this.shutdown.bind(this);
        this.server.on('exit', shutdown);
        this.server.once('error', shutdown);
    }
    shutdown() {
        if (this.server.pid && !this.server.killed) {
            this.server.kill();
        }
        this.onShutdown();
    }
}
exports.RhamtProcessController = RhamtProcessController;
//# sourceMappingURL=rhamtProcessController.js.map