/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { ForceGraph3DGenericInstance, ForceGraph3DInstance } from '3d-force-graph';
import type { NodeObject } from 'force-graph';
import type THREE from 'three';
import { FlyControls } from 'three/examples/jsm/controls/FlyControls.js';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';

import { Throttler } from '@lumino/polling';

import {
  EGraphBehaveMethod,
  ENodeBehaveMethod,
  INodeThreeBehaveOptions,
  IRenderOptions,
  THROTTLE_OPTS,
} from '../../tokens';

import { ForceGraphModel, ForceGraphView } from './2d';

export type TAnyControls = OrbitControls | TrackballControls | FlyControls;

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

  private _threeRenderer: THREE.WebGLRenderer;
  private _threeControls: TAnyControls;
  private _threeCamera: THREE.PerspectiveCamera;

  model: ForceGraph3DModel;

  protected async onGraphInitialized(): Promise<void> {
    const graph = this.graph as ForceGraph3DInstance;
    this._threeRenderer = graph.renderer() as THREE.WebGLRenderer;
    this._threeControls = graph.controls() as TAnyControls;
    this._threeCamera = graph.camera() as THREE.PerspectiveCamera;

    const throttled = new Throttler(() => this.onControlsChange(), THROTTLE_OPTS);

    this._threeControls.addEventListener('change', () => throttled.invoke());
  }

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
    return this._threeRenderer;
  }

  protected get threeControls(): TAnyControls {
    return this._threeControls;
  }

  protected get threeCamera(): THREE.PerspectiveCamera {
    return this._threeCamera;
  }

  protected onControlsChange = async (): Promise<void> => {
    const position = this.graph.cameraPosition();
    this.onZoom({
      ...position,
      graph: this.graph as any,
      iframeClasses: this._iframeClasses,
    });
  };

  protected getOnRenderPostUpdate() {
    const graph = this.graph as ForceGraph3DInstance;

    graph.nodeThreeObject(
      this._nodeBehaviorsByMethod[ENodeBehaveMethod.getNodeThreeObject].length
        ? this.wrapFunction(this.getNodeThreeObject)
        : null
    );

    this.threeRenderer.setAnimationLoop(
      this._graphBehaviorsByMethod[EGraphBehaveMethod.onRender].length
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

    for (const behavior of this._nodeBehaviorsByMethod[
      ENodeBehaveMethod.getNodeThreeObject
    ]) {
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
