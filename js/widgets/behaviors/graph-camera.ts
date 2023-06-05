/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ForceGraph3DInstance } from '3d-force-graph';
import { ForceGraphInstance } from 'force-graph';

import { IBackboneModelOptions } from '@jupyter-widgets/base';

import {
  IBehave,
  IUpdateGraphCameraOptions,
  IZoomData,
  WIDGET_DEFAULTS,
} from '../../tokens';
import { widget_serialization } from '../serializers/widget';

import { FacetedModel } from './base';

class ZoomBase extends FacetedModel implements IBehave {
  get zoom(): number | null {
    return this.get('zoom');
  }

  set zoom(zoom: number | null) {
    this.set('zoom', zoom);
  }

  get lookAt() {
    return this.get('look_at');
  }

  set lookAt(lookAt: number[]) {
    this.set('look_at', lookAt ? lookAt : null);
  }

  get center(): number[] {
    return this.get('center');
  }

  set center(center: number[]) {
    this.set('center', center);
  }

  is3d(graph: ForceGraphInstance | ForceGraph3DInstance) {
    return graph.hasOwnProperty('nodeThreeObject');
  }
}

export class GraphCameraModel extends ZoomBase implements IBehave {
  static model_name = 'GraphCameraModel';

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: GraphCameraModel.model_name,
      zoom: 0,
      center: [0, 0],
      visible: [],
      capture_visible: false,
    };
  }

  get visible(): number[] {
    return this.get('visible') || [];
  }

  set visible(visible: number[]) {
    this.set('visible', visible);
  }

  get captureVisible(): boolean {
    return this.get('capture_visible');
  }

  set captureVisible(captureVisible: boolean) {
    this.set('capture_visible', captureVisible);
  }

  onZoom(zoom: IZoomData): void {
    const { graph, k, lookAt } = zoom;
    const is3d = this.is3d(graph);
    const z = zoom.z == null ? [] : [zoom.z];
    this.center = [zoom.x, zoom.y, ...z];
    this.zoom = k;
    this.lookAt = zoom.lookAt != null ? [lookAt.x, lookAt.y, lookAt.z] : null;
    if (this.captureVisible) {
      this.visible = is3d ? this.getVisible3d(zoom) : this.getVisible2d(zoom);
    }

    this.save();
  }

  protected getVisible3d(zoom: IZoomData): number[] {
    const graph = zoom.graph as any as ForceGraph3DInstance;
    const visible = [];
    let i = 0;

    const { THREE } = zoom.iframeClasses;
    const camera = graph.camera();

    const frustum: THREE.Frustum = new THREE.Frustum().setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
    );

    for (let node of graph.graphData().nodes) {
      let __threeObj: THREE.Object3D = (node as any).__threeObj;
      if (
        frustum.containsPoint(__threeObj.position) ||
        frustum.intersectsObject(__threeObj)
      ) {
        visible.push(i);
      }
      i++;
    }

    return visible;
  }

  protected getVisible2d(zoom: IZoomData): number[] {
    const { graph, k } = zoom;
    const halfW = graph.width() / 2 / k;
    const halfH = graph.height() / 2 / k;
    const bx = [zoom.x - halfW, zoom.x + halfW];
    const by = [zoom.y - halfH, zoom.y + halfH];
    const visible = [];
    let i = 0;
    for (let { x, y } of graph.graphData().nodes) {
      if (x >= bx[0] && x <= bx[1] && y >= by[0] && y <= by[1]) {
        visible.push(i);
      }
      i++;
    }
    return visible;
  }
}

export class GraphDirectorModel extends ZoomBase implements IBehave {
  static model_name = 'GraphDirectorModel';

  private _resetting = false;

  static serializers = {
    ...FacetedModel.serializers,
    fit_nodes: widget_serialization,
  };

  protected get _modelClass(): typeof GraphDirectorModel {
    return GraphDirectorModel;
  }

  defaults() {
    return {
      ...super.defaults(),
      ...WIDGET_DEFAULTS,
      _model_name: GraphCameraModel.model_name,
      zoom: null,
      fit_nodes: null,
      fit_padding: null,
      center: null,
      zoom_first: false,
      zoom_duration: 0.2,
      pan_duration: 0.2,
      fit_duration: 0.2,
    };
  }

  initialize(attributes: Backbone.ObjectHash, options: IBackboneModelOptions) {
    super.initialize(attributes, options);
    this.on(
      'change:zoom change:center change:fit_nodes change:fit_padding',
      this.onZoomChanged,
      this
    );
    this.updateRequested.connect(this.onZoomChanged, this);
    this.onZoomChanged();
  }

  get zoomFirst(): boolean {
    return this.get('zoom_first');
  }

  set zoomFirst(zoomFirst: boolean) {
    this.set('zoom_first', zoomFirst);
  }

  get zoomDuration(): number {
    return (this.get('zoom_duration') || 0) * 1000;
  }

  set zoomDuration(zoomDuration: number) {
    this.set('zoom_duration', zoomDuration);
  }

  get panDuration(): number {
    return (this.get('pan_duration') || 0) * 1000;
  }

  set panDuration(panDuration: number) {
    this.set('pan_duration', panDuration);
  }

  get fitDuration(): number {
    return (this.get('fit_duration') || 0) * 1000;
  }

  set fitDuration(fitDuration: number) {
    this.set('fit_duration', fitDuration);
  }

  get fitPadding(): number {
    return this.get('fit_padding');
  }

  set fitPadding(fitPadding: number) {
    this.set('fit_padding', fitPadding);
  }

  onZoomChanged() {
    if (!this._resetting) {
      this._graphCameraUpdateRequested.emit();
    }
  }

  async updateGraphCamera(options: IUpdateGraphCameraOptions): Promise<void> {
    const { graph } = options;
    const is3d = this.is3d(graph);

    let fitNodes = null;

    if (this.get('fit_nodes')) {
      await this.ensureFacets();
      fitNodes = this._nodeFacets['fit_nodes'];
    }

    if (fitNodes) {
      const wrappedFit = this.wrapForNode(fitNodes) as any;
      graph.zoomToFit(this.fitDuration, this.fitPadding, wrappedFit);
    } else {
      if (is3d) {
        let graph3 = graph as any as ForceGraph3DInstance;
        const Vector3 = options.iframeClasses.THREE.Vector3;
        let lookAt: THREE.Vector3 = new Vector3(...this.lookAt);
        let [x, y, z] = this.center;
        graph3.cameraPosition({ x, y, z }, lookAt, this.zoomDuration);
      } else {
        const k = this.zoom;
        const [x, y] = this.center || [];
        if (this.zoomFirst) {
          k == null ? null : graph.zoom(k, this.zoomDuration);
          this.center == null ? null : graph.centerAt(x, y, this.panDuration);
        } else {
          k == null ? null : graph.centerAt(x, y, this.panDuration);
          this.center == null ? null : graph.zoom(k, this.zoomDuration);
        }
      }
      this._resetting = true;
      this.save({ zoom: null, center: null, look_at: null });
      setTimeout(this._doneResetting, this.panDuration + this.zoomDuration);
    }
  }

  private _doneResetting = () => {
    this._resetting = false;
  };
}
