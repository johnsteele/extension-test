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
const model_1 = require("./model");
const fs = require("fs");
const events_1 = require("../events");
const path = require("path");
const fse = require("fs-extra");
const mkdirp = require("mkdirp");
const analysisResults_1 = require("./analysisResults");
class ModelService {
    constructor(model, outDir, reportEndpoints) {
        this.model = model;
        this.outDir = outDir;
        this.reportEndpoints = reportEndpoints;
        this.loaded = false;
        this.onLoaded = new events_1.rhamtEvents.TypedEvent();
    }
    addConfiguration(config) {
        this.model.configurations.push(config);
        return this.save();
    }
    getConfiguration(id) {
        return this.model.configurations.find(config => config.id === id);
    }
    getConfigurationWithName(name) {
        return this.model.configurations.find(item => item.name === name);
    }
    createConfiguration() {
        return this.createConfigurationWithName(this.generateConfigurationName());
    }
    createConfigurationWithName(name) {
        const config = new model_1.RhamtConfiguration();
        config.id = ModelService.generateUniqueId();
        config.name = name;
        config.options['output'] = path.resolve(this.outDir, config.id);
        return config;
    }
    deleteConfiguration(configuration) {
        const index = this.model.configurations.indexOf(configuration, 0);
        if (index > -1) {
            this.model.configurations.splice(index, 1);
            const output = configuration.options['output'];
            if (output) {
                this.deleteOuputLocation(output);
            }
            this.save();
            return true;
        }
        return false;
    }
    deleteOuputLocation(location) {
        fs.exists(location, exists => {
            if (exists) {
                fse.remove(location);
            }
        });
    }
    deleteConfigurationWithName(name) {
        const config = this.model.configurations.find(item => item.name === name);
        if (config) {
            return this.deleteConfiguration(config);
        }
        return false;
    }
    load() {
        return new Promise((resolve, reject) => {
            const location = this.getModelPersistanceLocation();
            fs.exists(location, exists => {
                if (exists) {
                    fs.readFile(location, (e, data) => {
                        if (e)
                            reject(e);
                        else
                            this.parse(data).then(() => resolve(this.model)).catch(reject);
                    });
                }
                else {
                    this.loaded = true;
                    this.onLoaded.emit(this.model);
                    resolve();
                }
            });
        });
    }
    reload() {
        return new Promise((resolve, reject) => {
            const parse = (data) => __awaiter(this, void 0, void 0, function* () {
                if (data.byteLength > 0) {
                    const newConfigs = [];
                    const configs = JSON.parse(data).configurations;
                    for (const entry of configs) {
                        const config = new model_1.RhamtConfiguration();
                        ModelService.copy(entry, config);
                        if (!config.id) {
                            continue;
                        }
                        const existing = this.getConfiguration(config.id);
                        if (existing) {
                            existing.name = config.name;
                            existing.options = config.options;
                            existing.rhamtExecutable = config.rhamtExecutable;
                            existing.summary = config.summary;
                            existing.results = undefined;
                            newConfigs.push(existing);
                        }
                        else {
                            newConfigs.push(config);
                        }
                    }
                    this.model.configurations.forEach(config => {
                        const output = config.options['output'];
                        if (output) {
                            const found = newConfigs.find(item => {
                                const out = item.options['output'];
                                return out && out === output;
                            });
                            if (!found) {
                                this.deleteOuputLocation(output);
                            }
                        }
                    });
                    newConfigs.forEach((config) => __awaiter(this, void 0, void 0, function* () { return yield ModelService.loadResults(config); }));
                    this.model.configurations = newConfigs;
                }
                else {
                    this.model.configurations = [];
                }
                resolve();
            });
            const location = this.getModelPersistanceLocation();
            fs.exists(location, exists => {
                if (exists) {
                    fs.readFile(location, (e, data) => {
                        if (e)
                            reject(e);
                        else
                            parse(data);
                    });
                }
            });
        });
    }
    parse(data) {
        return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            if (data.byteLength > 0) {
                const configs = JSON.parse(data).configurations;
                for (const entry of configs) {
                    const config = new model_1.RhamtConfiguration();
                    ModelService.copy(entry, config);
                    yield ModelService.loadResults(config);
                    this.model.configurations.push(config);
                }
            }
            this.loaded = true;
            this.onLoaded.emit(this.model);
            resolve();
        }));
    }
    static loadResults(target) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(resolve => {
                const location = target.getResultsLocation();
                fs.exists(location, (exists) => __awaiter(this, void 0, void 0, function* () {
                    if (exists) {
                        try {
                            const dom = yield analysisResults_1.AnalysisResultsUtil.loadFromLocation(location);
                            target.results = new analysisResults_1.AnalysisResults(target, dom);
                        }
                        catch (e) {
                            console.log(`Error loading analysis results for configuration at ${location} - ${e}`);
                        }
                    }
                    resolve();
                }));
            });
        });
    }
    static copy(source, target) {
        target.id = source.id;
        target.name = source.name;
        Object.keys(source.options).forEach(key => {
            target.options[key] = source.options[key];
        });
        if (source.summary) {
            target.summary = source.summary;
        }
    }
    save() {
        const configurations = [];
        this.model.configurations.forEach(config => {
            const data = {
                id: config.id,
                name: config.name,
                options: config.options
            };
            if (config.summary) {
                data.summary = config.summary;
            }
            configurations.push(data);
            if (config.results) {
                config.results.save(config.getResultsLocation()).catch(e => {
                    console.log(`Error saving RHAMT configuration ${config.name} results: ${e} `);
                });
            }
        });
        return this.doSave(this.getModelPersistanceLocation(), { configurations });
    }
    doSave(out, data) {
        return new Promise((resolve, reject) => {
            mkdirp(require('path').dirname(out), (e) => {
                if (e)
                    reject(e);
                fs.writeFile(out, JSON.stringify(data, null, 4), null, e => {
                    if (e)
                        reject(e);
                    else
                        resolve();
                });
            });
        });
    }
    generateConfigurationName() {
        let newName = 'rhamtConfiguration';
        if (this.model.exists(newName)) {
            for (let i = 0; i < 1000; i++) {
                if (!this.model.exists(`${newName}-${i}`)) {
                    newName = `${newName}-${i}`;
                    break;
                }
            }
        }
        return newName;
    }
    static generateUniqueId() {
        return `-${Math.random().toString(36).substr(2, 9)}-${Math.random().toString(36).substr(2, 9)}`;
    }
    onModelLoaded(listen) {
        if (this.loaded) {
            listen(this.model);
        }
        return this.onLoaded.on(listen);
    }
    getModelPersistanceLocation() {
        return path.join(this.outDir, 'model.json');
    }
}
exports.ModelService = ModelService;
//# sourceMappingURL=modelService.js.map