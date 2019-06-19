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
const fileSystem = require("fs");
const fs = require("fs-extra");
const vscode_1 = require("vscode");
const tmp = require("tmp");
const requestProgress = require('request-progress');
const path = require("path");
const async_1 = require("./async");
const model_1 = require("../model/model");
const downloadFileExtension = '.nupkg';
class Watch {
    constructor() {
        this.started = Date.now();
    }
    get elapsedTime() {
        return Date.now() - this.started;
    }
    reset() {
        this.started = Date.now();
    }
}
exports.Watch = Watch;
class InstallHandler {
}
exports.InstallHandler = InstallHandler;
class RhamtInstaller {
    static installCli(url, downloadDir, handler) {
        return new Promise((resolve, reject) => {
            RhamtInstaller.downloadRhamt(url, downloadDir, handler).then(home => {
                console.log('download & extract complete');
                resolve(home);
            }).catch(e => {
                console.log('error download & extract' + e);
                reject({ type: model_1.ChangeType.ERROR, name: 'installCliChanged', value: { url, downloadDir, e } });
            });
        });
    }
    static downloadRhamt(url, downloadDir, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            const downloadUri = url;
            const timer = new Watch();
            let localTempFilePath = '';
            try {
                localTempFilePath = yield RhamtInstaller.downloadFile(downloadUri, 'Downloading rhamt-cli... ', handler);
            }
            catch (err) {
                return Promise.reject(err);
            }
            timer.reset();
            let home = '';
            try {
                home = yield RhamtInstaller.unpackArchive(downloadDir, localTempFilePath, handler);
            }
            catch (err) {
                return Promise.reject(err);
            }
            finally {
                yield RhamtInstaller.deleteFile(localTempFilePath);
            }
            return Promise.resolve(home);
        });
    }
    static deleteFile(filename) {
        const deferred = async_1.createDeferred();
        fs.unlink(filename, err => err ? deferred.reject(err) : deferred.resolve());
        return deferred.promise;
    }
    static createTemporaryFile(extension) {
        return new Promise((resolve, reject) => {
            tmp.file({ postfix: extension }, (err, tmpFile, _, cleanupCallback) => {
                if (err) {
                    return reject(err);
                }
                resolve({ filePath: tmpFile, dispose: cleanupCallback });
            });
        });
    }
    static createWriteStream(filePath) {
        return fileSystem.createWriteStream(filePath);
    }
    static objectExists(filePath, statCheck) {
        return new Promise(resolve => {
            fs.stat(filePath, (error, stats) => {
                if (error) {
                    return resolve(false);
                }
                return resolve(statCheck(stats));
            });
        });
    }
    static directoryExists(filePath) {
        return RhamtInstaller.objectExists(filePath, (stats) => stats.isDirectory());
    }
    static createDirectory(directoryPath) {
        return fs.mkdirp(directoryPath);
    }
    static downloadFile(uri, title, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            handler.log(`Downloading ${uri}... `);
            const tempFile = yield RhamtInstaller.createTemporaryFile(downloadFileExtension);
            const deferred = async_1.createDeferred();
            const fileStream = RhamtInstaller.createWriteStream(tempFile.filePath);
            fileStream.on('finish', () => {
                fileStream.close();
            }).on('error', (err) => {
                tempFile.dispose();
                deferred.reject(err);
            });
            yield vscode_1.window.withProgress({
                location: vscode_1.ProgressLocation.Window
            }, (progress) => __awaiter(this, void 0, void 0, function* () {
                const req = yield RhamtInstaller.doDownloadFile(uri);
                requestProgress(req)
                    .on('progress', (state) => {
                    const received = Math.round(state.size.transferred / 1024);
                    const total = Math.round(state.size.total / 1024);
                    const percentage = Math.round(100 * state.percent);
                    handler.log(`${title}${received} of ${total} KB (${percentage}%)`);
                    progress.report({
                        message: `${title}${received} of ${total} KB (${percentage}%)`
                    });
                })
                    .on('error', (err) => {
                    deferred.reject(err);
                })
                    .on('end', () => {
                    deferred.resolve();
                })
                    .pipe(fileStream);
                return deferred.promise;
            }));
            return tempFile.filePath;
        });
    }
    static unpackArchive(downloadDir, tempFilePath, handler) {
        return __awaiter(this, void 0, void 0, function* () {
            handler.log('Unpacking archive... ');
            const deferred = async_1.createDeferred();
            const title = 'Extracting rhamt-cli... ';
            yield vscode_1.window.withProgress({
                location: vscode_1.ProgressLocation.Window
            }, (progress) => {
                const StreamZip = require('node-stream-zip');
                const zip = new StreamZip({
                    file: tempFilePath,
                    storeEntries: true
                });
                let totalFiles = 0;
                let extractedFiles = 0;
                zip.on('ready', () => __awaiter(this, void 0, void 0, function* () {
                    totalFiles = zip.entriesCount;
                    if (!(yield RhamtInstaller.directoryExists(downloadDir))) {
                        yield RhamtInstaller.createDirectory(downloadDir);
                    }
                    zip.extract(null, downloadDir, (err) => {
                        if (err) {
                            deferred.reject(err);
                        }
                        else {
                            deferred.resolve();
                        }
                        zip.close();
                    });
                })).on('extract', () => {
                    extractedFiles += 1;
                    progress.report({ message: `${title}${Math.round(100 * extractedFiles / totalFiles)}%` });
                }).on('error', (e) => {
                    deferred.reject(e);
                });
                return deferred.promise;
            });
            const entries = fileSystem.readdirSync(downloadDir);
            const index = entries.findIndex(index => index.startsWith('rhamt-cli'));
            if (index > -1) {
                const executablePath = path.join(downloadDir, entries[index], 'bin', 'rhamt-cli');
                yield fs.chmod(executablePath, '0764');
                return Promise.resolve(path.join(downloadDir, entries[index]));
            }
            else {
                return Promise.reject();
            }
        });
    }
    static doDownloadFile(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const request = yield Promise.resolve().then(() => require('request'));
            return request(uri, {});
        });
    }
}
exports.RhamtInstaller = RhamtInstaller;
//# sourceMappingURL=rhamt-installer.js.map