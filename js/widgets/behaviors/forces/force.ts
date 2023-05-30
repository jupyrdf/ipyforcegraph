/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ObjectHash } from 'backbone';
import type { ForceGraphInstance, NodeObject } from 'force-graph/dist/force-graph';

import { IBackboneModelOptions, WidgetModel } from '@jupyter-widgets/base';

import { EUpdate, IForce, TAnyForce } from '../../../tokens';
import { widget_serialization } from '../../serializers/widget';
import { BehaviorModel, FacetedModel } from '../base';

export type TForceRecord = Record<string, FacetedForceModel | null>;

export class FacetedForceModel extends FacetedModel implements IForce {
  static model_name = 'FacetedForceModel';
  _force: TAnyForce;

  forceFactory(): TAnyForce {
    throw new Error('Not implemented');
  }

  initialize(attributes: ObjectHash, options: IBackboneModelOptions): void {
    super.initialize(attributes, options);
    this._force = this.forceFactory();
    this.on('change:active', this._onFacetsChanged);
  }

  get active(): boolean {
    return this.get('active');
  }

  get force(): TAnyForce {
    return this._force;
  }
}

export class GraphForcesModel extends BehaviorModel {
  static model_name = 'GraphForcesModel';
  static serializers = {
    ...WidgetModel.serializers,
    forces: widget_serialization,
  };

  defaults() {
    return {
      ...super.defaults(),
      _model_name: GraphForcesModel.model_name,
      forces: {},
      warmup_ticks: 0,
      cooldown_ticks: -1,
      alpha_min: 0.0,
      alpha_decay: 0.228,
      velocity_decay: 0.4,
    };
  }

  initialize(attributes: ObjectHash, options: IBackboneModelOptions): void {
    super.initialize(attributes, options);
    this.on(
      'change:forces change:cooldown_ticks change:warmup_ticks change:alpha_min change:alpha_decay change:velocity_decay',
      this.onForcesChange,
      this
    );
    this.onForcesChange();
  }

  get forces(): TForceRecord {
    return this.get('forces') || {};
  }

  async onForcesChange(): Promise<void> {
    const { forces, previousForces } = this;

    for (const force of Object.values(previousForces)) {
      if (force) {
        force.updateRequested.disconnect(this.onForceUpdated, this);
      }
    }

    for (const force of Object.values(forces)) {
      if (force) {
        force.updateRequested.connect(this.onForceUpdated, this);
      }
    }
    void this.onForceUpdated();
  }

  get previousForces(): TForceRecord {
    return (this.previous && this.previous('forces')) || {};
  }

  protected async onForceUpdated(change?: any): Promise<void> {
    const facetPromises: Promise<void>[] = [];
    for (const force of Object.values(this.forces)) {
      if (force instanceof FacetedModel) {
        facetPromises.push(force.ensureFacets());
      }
    }
    if (facetPromises) {
      await Promise.all(facetPromises);
    }

    this._updateRequested.emit(EUpdate.Reheat);
  }

  get warmupTicks(): number {
    return this.get('warmup_ticks');
  }

  get cooldownTicks(): number {
    const ticks = this.get('cooldown_ticks');
    return ticks < 0 ? Infinity : ticks;
  }

  get alphaMin(): number {
    return this.get('alpha_min');
  }

  get alphaDecay(): number {
    return this.get('alpha_decay');
  }

  get velocityDecay(): number {
    return this.get('velocity_decay');
  }

  checkPositions(graph: ForceGraphInstance) {
    let { nodes, links } = graph.graphData();

    let anyNaN = false;
    for (let n of nodes) {
      if (isNaN(n.x) || isNaN(n.y)) {
        anyNaN = true;
        break;
      }
    }
    if (anyNaN) {
      for (let n of nodes) {
        n.x = NaN;
        n.y = NaN;
        // n.z = NaN,
        n.vx = NaN;
        n.vy = NaN;
        // n.vz = NaN;
      }
      initializeNodes(nodes);
      // parse links
      links.forEach((link) => {
        let source = link.source as any;
        if (source !== nodes[source.index]) {
          console.warn('link source mismatch', source, nodes[source.index]);
        }
      });
    }
  }
}

// initializeNodes function from `d3-force-3d/simulation.js`
function initializeNodes(nodes: NodeObject[], numDimensions = 2) {
  let MAX_DIMENSIONS = 3;
  let nDim = Math.min(MAX_DIMENSIONS, Math.max(1, Math.round(numDimensions)));
  var initialRadius = 10,
    initialAngleRoll = Math.PI * (3 - Math.sqrt(5)), // Golden ratio angle
    initialAngleYaw = (Math.PI * 20) / (9 + Math.sqrt(221)); // Markov irrational number

  for (var i = 0, n = nodes.length, node; i < n; ++i) {
    (node = nodes[i]), (node.index = i);
    if (node.fx != null) node.x = node.fx;
    if (node.fy != null) node.y = node.fy;
    if (node.fz != null) node.z = node.fz;
    if (isNaN(node.x) || (nDim > 1 && isNaN(node.y)) || (nDim > 2 && isNaN(node.z))) {
      var radius =
          initialRadius *
          (nDim > 2 ? Math.cbrt(0.5 + i) : nDim > 1 ? Math.sqrt(0.5 + i) : i),
        rollAngle = i * initialAngleRoll,
        yawAngle = i * initialAngleYaw;

      if (nDim === 1) {
        node.x = radius;
      } else if (nDim === 2) {
        node.x = radius * Math.cos(rollAngle);
        node.y = radius * Math.sin(rollAngle);
      } else {
        // 3 dimensions: use spherical distribution along 2 irrational number angles
        node.x = radius * Math.sin(rollAngle) * Math.cos(yawAngle);
        node.y = radius * Math.cos(rollAngle);
        node.z = radius * Math.sin(rollAngle) * Math.sin(yawAngle);
      }
    }
    if (
      isNaN(node.vx) ||
      (nDim > 1 && isNaN(node.vy)) ||
      (nDim > 2 && isNaN(node.vz))
    ) {
      node.vx = 0;
      if (nDim > 1) {
        node.vy = 0;
      }
      if (nDim > 2) {
        node.vz = 0;
      }
    }
  }
}
