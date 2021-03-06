/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Red Hat. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { TreeDataProvider, Disposable, EventEmitter, Event, TreeItem, commands, TreeView, ProviderResult, ExtensionContext } from 'vscode';
import { localize } from './localize';
import * as path from 'path';
import { ConfigurationNode, Grouping } from './configurationNode';
import { ITreeNode } from './abstractNode';
import { ModelService } from '../model/modelService';
import { ResultsNode } from './resultsNode';

export class DataProvider implements TreeDataProvider<ITreeNode>, Disposable {

    private _onDidChangeTreeDataEmitter: EventEmitter<ITreeNode> = new EventEmitter<ITreeNode>();
    private _onNodeCreateEmitter: EventEmitter<ITreeNode> = new EventEmitter<ITreeNode>();

    private children: ConfigurationNode[] = [];

    view: TreeView<any>;
    private _disposables: Disposable[] = [];

    constructor(private grouping: Grouping, private modelService: ModelService, public context: ExtensionContext) {
        this._disposables.push(this.modelService.onModelLoaded(() => {
            this.refresh(undefined);
        }));
        this._disposables.push(commands.registerCommand('rhamt.modelReload', () => {
            this.refresh(undefined);
        }));
        this._disposables.push(commands.registerCommand('rhamt.refreshResults', item => {
            item.reload();
        }));
    }

    public reveal(node: any, expand: boolean): void {
        this.view.reveal(node, {expand});
    }

    public dispose(): void {
        for (const disposable of this._disposables) {
            disposable.dispose();
        }
    }

    public getParent(element: ITreeNode): ProviderResult<ITreeNode> {
        if (element instanceof ResultsNode) {
            return element.root;
        }
    }

    public get onDidChangeTreeData(): Event<ITreeNode> {
        return this._onDidChangeTreeDataEmitter.event;
    }

    public get onNodeCreate(): Event<ITreeNode> {
        return this._onNodeCreateEmitter.event;
    }

    public getTreeItem(node: ITreeNode): TreeItem {
        if (node instanceof TreeItem && !node.treeItem) {
            return node;
        }
        return node.treeItem;
    }

    public async getChildren(node?: ITreeNode): Promise<any[]> {
        try {
            return this.doGetChildren(node);
        } catch (error) {
            const item = new TreeItem(localize('errorNode', 'Error: {0}', error));
            item.contextValue = 'rhamtextensionui.error';
            return Promise.resolve([item]);
        }
    }

    private async doGetChildren(node?: ITreeNode): Promise<ITreeNode[]> {
        let result: ITreeNode[];
        if (node) {
            result = await node.getChildren();
        } else {
            result = await this.populateRootNodes();
        }
        return result;
    }

    public async refresh(node?: ITreeNode): Promise<void> {
        this._onDidChangeTreeDataEmitter.fire(node);
    }

    private async populateRootNodes(): Promise<any[]> {

        let nodes: any[];

        if (this.modelService.loaded) {
            for (let i = this.children.length; i--;) {
                const config = this.modelService.model.configurations.find(item => item.id === this.children[i].config.id);
                if (!config) {
                    this.children.splice(i, 1);
                }
            }
            nodes = this.modelService.model.configurations.map(config => {
                let node = this.children.find(node => node.config.id === config.id);
                if (!node) {
                    node = new ConfigurationNode(
                        config,
                        this.grouping,
                        this.modelService,
                        this._onNodeCreateEmitter,
                        this);
                    this.children.push(node);
                }
                return node;
            });
        }

        else {
            const item = new TreeItem(localize('loadingNode', 'Loading...'));
            const base = [__dirname, '..', '..', '..', 'resources'];
            item.iconPath = {
                light: path.join(...base, 'light', 'Loading.svg'),
                dark:  path.join(...base, 'dark', 'Loading.svg')
            };
            nodes = [item];
            (async () => setTimeout(() => {
                this.modelService.load().catch(e => {
                    console.log('error while loading model service.');
                    console.log(e);
                });
            }, 500))();
        }
        return nodes;
    }
}