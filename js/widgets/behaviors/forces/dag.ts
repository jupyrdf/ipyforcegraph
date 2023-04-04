/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ForceGraphInstance } from 'force-graph/dist/force-graph';

import { IBehave, IForce } from '../../../tokens';
import { yes } from '../../../utils';
import { widget_serialization } from '../../serializers/widget';

import { FacetedForceModel } from './force';

export class DAGBehaviorModel extends FacetedForceModel implements IBehave, IForce {
  static model_name = 'DAGBehaviorModel';

  static serializers = {
    ...FacetedForceModel.serializers,
    mode: widget_serialization,
    level_distance: widget_serialization,
    // node template
    node_filter: widget_serialization,
  };

  protected get _modelClass(): typeof DAGBehaviorModel {
    return DAGBehaviorModel;
  }

  forceFactory(): void {
    // raises an error otherwise
  }

  refreshBehavior(graph: ForceGraphInstance) {
    const { mode, level_distance, node_filter } = this._nodeFacets;

    const activeMode = this.active && mode ? mode() : null;
    if (activeMode) {
      graph.dagMode(activeMode);
      graph.dagLevelDistance(level_distance ? level_distance() : null);

      const nodeFilter = node_filter ? (this.wrapForNode(node_filter) as any) : yes;

      graph.dagNodeFilter(nodeFilter);
    } else {
      graph.dagMode(null);
      graph.dagLevelDistance(null);
      graph.dagNodeFilter(yes);
    }
  }
}
