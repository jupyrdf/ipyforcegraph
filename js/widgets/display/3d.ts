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

  protected async getJsUrl() {
    return (await import('!!file-loader!3d-force-graph/dist/3d-force-graph.js'))
      .default;
  }

  protected getGraphInitArgs(): Record<string, any> {
    const args = super.getGraphInitArgs();
    // args.extraRenderers = [...(args.extraRenderers || []), new ForceGraph3DView.Renderer(this)];
    return args;
  }

  protected get threeRenderer(): WebGLRenderer {
    const graph = this.graph as ForceGraph3DInstance;
    return graph.renderer() as WebGLRenderer;
  }

  protected getOnRenderPostUpdate() {
    this.threeRenderer.setAnimationLoop(this.wrapFunction(this.onRender));
    // graph.renderer.
    // console.error(`${EMOJI} getOnRenderPostUpdate not implemented for`, graph);
    // graph.onRenderFramePost(this.wrapFunction(this.onRender));
  }

  protected updateRenderOptions(options: IRenderOptions): IRenderOptions {
    delete options.context2d;
    delete options.globalScale;
    options.renderer3d = this.threeRenderer;
    return options;
  }
}

export namespace ForceGraph3DView {
  export class Renderer {
    protected _view: ForceGraph3DView;
    constructor(view: ForceGraph3DView) {
      this._view = view;
    }
    render = (scene: any, camera: any) => {
      console.warn('RENDER', scene, camera);
    };
  }
}
