/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ObjectHash } from 'backbone';
import { default as d3ClusterForce } from 'd3-force-cluster-3d';
import { NodeObject } from 'force-graph/dist/force-graph';

import { IBackboneModelOptions } from '@jupyter-widgets/base';

import { isNumeric, makeForceNodeTemplate } from '../../../template-utils';
import { IBehave, IForce, TAnyForce } from '../../../tokens';

import { ForceBehaviorModel } from './force';

// interface Cluster{
//   x: number,
//   y: number,
//   z: number,
// }

export class ClusterForceModel extends ForceBehaviorModel implements IBehave, IForce {
  static model_name = 'ClusterForceModel';
  _force: d3ClusterForce;
  strength: CallableFunction | Number | null;
  clusters: object;
  get_cluster: CallableFunction; // render the cluster template

  defaults() {
    return {
      ...super.defaults(),
      _model_name: ClusterForceModel.model_name,
      x: null,
      strength: null,
    };
  }

  initialize(attributes: ObjectHash, options: IBackboneModelOptions): void {
    super.initialize(attributes, options);
    this.clusters = {};
    this.get_cluster = () => 0;
  }

  forceFactory(): d3ClusterForce {
    return d3ClusterForce();
  }

  get triggerChanges(): string {
    return 'change:centers change:strength change:Inertia';
  }

  get force(): TAnyForce {
    const { centers, strength, centerInertia } = this;

    let force = this._force;
    force = centerInertia == null ? force : force.centerInertia(centerInertia);
    force = centers == null ? force : force.centers(centers);
    force = strength == null ? force : force.strength(strength);
    return force;
  }

  async onChanged() {
    await this.update_centers();
    await this.update_strength();
    this._updateRequested.emit(void 0);
  }

  async update_centers() {
    let value = this.get('centers');
    this.get_cluster = await makeForceNodeTemplate(value);
  }

  centers = (node: NodeObject, i: number, nodes: NodeObject[]) => {
    if (!(node as any)?.radius) {
      (node as any).radius = 1;
    }
    let key = this.get_cluster(node, i, nodes);

    // get the cluster center and reset if the position has gone NaN
    if (!(key in this.clusters)) {
      this.clusters[key] = { x: 0, y: 0, z: 0, radius: 0 };
    }
    let center = this.clusters[key];
    if (isNaN(center.x)) {
      center.x = 0;
    }
    if (isNaN(center.y)) {
      center.y = 0;
    }
    if (isNaN(center.z)) {
      center.z = 0;
    }
    if (isNaN(center.radius) || center.radius == undefined) {
      center.radius = 0;
    }

    return center;
  };

  async update_strength() {
    let value = this.get('strength');
    if (isNumeric(value)) {
      this.strength = Number(value);
    } else {
      this.strength = await makeForceNodeTemplate(value);
    }
  }

  get centerInertia() {
    return this.get('center_inertia');
  }
}
