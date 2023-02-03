/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { ForceGraph3DGenericInstance, ForceGraph3DInstance } from '3d-force-graph';
import type { WebGLRenderer } from 'three';

import { IRenderOptions } from '../../tokens';

import { ForceGraphModel, ForceGraphView } from './2d';

export class ForceGraph3DModel extends ForceGraphModel {
  static model_name = 'ForceGraph3DModel';
  static serializers = {
    ...ForceGraphModel.serializers,
  };

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ForceGraph3DModel.model_name,
      _view_name: ForceGraph3DView.view_name,
    };
  }
}

export class ForceGraph3DView extends ForceGraphView<
  ForceGraph3DGenericInstance<ForceGraph3DInstance>
> {
  static view_name = 'ForceGraph3DView';

  model: ForceGraph3DModel;

  protected get graphJsClass(): string {
    return 'ForceGraph3D';
  }

  protected async getJsUrl(): Promise<string> {
    return (
      await import(
        '!!file-loader!../../../node_modules/3d-force-graph/dist/3d-force-graph.js'
      )
    ).default as any;
  }

  protected get threeRenderer(): WebGLRenderer {
    const graph = this.graph as ForceGraph3DInstance;
    return graph.renderer() as WebGLRenderer;
  }

  protected getOnRenderPostUpdate() {
    this.threeRenderer.setAnimationLoop(this.wrapFunction(this.onRender));
  }

  protected updateRenderOptions(options: IRenderOptions): IRenderOptions {
    delete options.context2d;
    delete options.globalScale;
    options.renderer3d = this.threeRenderer;
    return options;
  }
}
