/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { default as d3ClusterForce } from 'd3-force-cluster-3d';
import { NodeObject } from 'force-graph/dist/force-graph';

import { IBehave, IForce, TAnyForce } from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';

import { FacetedForceModel } from './force';

export interface IClusterCenter {
  radius: number;
  x: number;
  y: number;
  z: number;
}

export interface IClusterFunctions {
  radius: CallableFunction | null;
  x: CallableFunction | null;
  y: CallableFunction | null;
  z: CallableFunction | null;
}

export interface INodeObjectWithCluster {
  radius?: number;
}

export class ClusterForceModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'ClusterForceModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    strength: widget_serialization,
    inertia: widget_serialization,
    // node template
    key: widget_serialization,
    // cluster template
    radius: widget_serialization,
    y: widget_serialization,
    x: widget_serialization,
    z: widget_serialization,
  };

  _force: d3ClusterForce;
  _clusters = new Map<string | number, IClusterCenter>();

  protected get _modelClass(): typeof ClusterForceModel {
    return ClusterForceModel;
  }

  forceFactory(): d3ClusterForce {
    return d3ClusterForce();
  }

  get force(): TAnyForce {
    const { strength, inertia, key, radius, x, y, z } = this._nodeFacets;

    let force = this._force;
    force = inertia == null ? force : force.centerInertia(inertia());
    force = strength == null ? force : force.strength(strength());

    force =
      key == null
        ? force
        : force.centers(this.makeCenters(this.wrapForNode(key), { radius, x, y, z }));

    return force;
  }

  makeCenters(clusterKey: CallableFunction, clusterFunctions: IClusterFunctions) {
    const centers = (node: INodeObjectWithCluster, i: number, nodes: NodeObject[]) => {
      if (!node.radius) {
        node.radius = 1;
      }
      const key = clusterKey(node, i, nodes);
      let cluster = this._clusters.get(key);
      if (cluster == null) {
        cluster = { x: 0, y: 0, z: 0, radius: 0 };
        this._clusters.set(key, cluster);
      }

      const { x, y, z, radius } = clusterFunctions;
      const ctx = { cluster, node, key, nodes };
      if (radius != null) {
        cluster.radius = radius(ctx);
      }
      if (x != null) {
        cluster.x = x(ctx);
      }
      if (y != null) {
        cluster.y = y(ctx);
      }
      if (z != null) {
        cluster.z = z(ctx);
      }
      this.fixCenter(cluster);
      return cluster;
    };

    return centers;
  }

  fixCenter(center: IClusterCenter) {
    if (isNaN(center.x)) {
      center.x = 0;
    }
    if (isNaN(center.y)) {
      center.y = 0;
    }
    if (isNaN(center.z)) {
      center.z = 0;
    }
    if (isNaN(center.radius) || center.radius == null) {
      center.radius = 0;
    }
  }
}
