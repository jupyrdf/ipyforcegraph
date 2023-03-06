/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { ForceGraph3DGenericInstance, ForceGraph3DInstance } from '3d-force-graph';
import type { NodeObject } from 'force-graph';
import type THREE from 'three';

import { INodeThreeBehaveOptions, IRenderOptions } from '../../tokens';

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

  protected get extraJsClasses(): string {
    return `{
      SpriteText: window.SpriteText,
      THREE: window.THREE,
    }`;
  }

  protected async getJsUrls(): Promise<string[]> {
    return [
      (await import('!!file-loader!../../../node_modules/three/build/three.js'))
        .default as any,
      (
        await import(
          '!!file-loader!../../../node_modules/3d-force-graph/dist/3d-force-graph.js'
        )
      ).default as any,
      (
        await import(
          '!!file-loader!../../../node_modules/three-spritetext/dist/three-spritetext.js'
        )
      ).default as any,
    ];
  }

  protected get threeRenderer(): THREE.WebGLRenderer {
    const graph = this.graph as ForceGraph3DInstance;
    return graph.renderer() as THREE.WebGLRenderer;
  }

  protected getOnRenderPostUpdate() {
    const graph = this.graph as ForceGraph3DInstance;

    graph.nodeThreeObject(
      this.model.nodeBehaviorsForMethod('getNodeThreeObject').length
        ? this.wrapFunction(this.getNodeThreeObject)
        : null
    );

    this.threeRenderer.setAnimationLoop(
      this.model.graphBehaviorsForMethod('onRender').length
        ? this.wrapFunction(this.onRender)
        : null
    );
  }

  protected getNodeThreeObject = (node: NodeObject): THREE.Object3D | null => {
    let value: THREE.Object3D | null;
    const graphData = (this.graph as ForceGraph3DInstance).graphData();
    const options: INodeThreeBehaveOptions = {
      view: this,
      graphData,
      node,
      iframeClasses: this._iframeClasses,
    };

    for (const behavior of this.model.nodeBehaviorsForMethod('getNodeThreeObject')) {
      let method = behavior.getNodeThreeObject;
      value = method.call(behavior, options);
      if (value != null) {
        return value;
      }
    }
  };

  protected updateRenderOptions(options: IRenderOptions): IRenderOptions {
    delete options.context2d;
    delete options.globalScale;
    options.renderer3d = this.threeRenderer;
    return options;
  }
}
