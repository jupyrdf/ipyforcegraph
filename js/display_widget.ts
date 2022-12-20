// import { Signal } from '@lumino/signaling';
import ForceGraph from 'force-graph';
import { ForceGraphInstance } from 'force-graph';

import { Signal } from '@lumino/signaling';

import {
  DOMWidgetModel,
  DOMWidgetView,
  WidgetModel,
  unpack_models as deserialize,
} from '@jupyter-widgets/base';

import { NAME, VERSION } from './tokens';

// import {} from "jupyt"

export class SourceModel extends WidgetModel {
  static model_name = 'SourceModel';
  static serializers = {
    ...WidgetModel.serializers,
    nodes: { deserialize },
    links: { deserialize },
    metadata: { deserialize },
  };

  defaults() {
    let defaults = {
      ...super.defaults(),

      _model_name: SourceModel.model_name,
      _model_module_version: VERSION,
      _view_module: NAME,
      nodes: null,
      links: null,
      metadata: null,
    };
    return defaults;
  }

  dataUpdated = new Signal<SourceModel, void>(this);

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
    console.log("initialize Source Model");
    this.on('change:nodes', this.onNodesChange, this);
    this.on('change:links', this.onLinksChange, this);
    this.on('change:metadata', this.onMetadataChange, this);

    this.onNodesChange();
    this.onLinksChange();
    this.onMetadataChange();
    (<any>window).source = this;
  }

  onNodesChange(){
    let nodes = this.get("nodes");
    if (nodes) {
        nodes.on("change:array", this.graphUpdate, this)
    }
  }

  onLinksChange(){
    let links = this.get("links");
    if (links) {
      links.on("change:array", this.graphUpdate, this)
    }
  }

  onMetadataChange(){
    let metadata = this.get("metadata");
    if (metadata) {
      metadata.on("change:array", this.graphUpdate, this)
    }
  }

  graphUpdate(){
    //TODO throttle / debounce emitting events
    console.log("graphUpdate emit");
    this.dataUpdated.emit(void 0);
  }
}

console.log('loading');
export class ForceGraphModel extends DOMWidgetModel {
  static model_name = 'ForceGraphModel';
  static serializers = {
    ...DOMWidgetModel.serializers,
    source: { deserialize },
  };

  defaults() {
    let defaults = {
      ...super.defaults(),

      _model_name: ForceGraphModel.model_name,
      _model_module_version: VERSION,
      _view_module: NAME,
      _view_name: ForceGraphView.view_name,
      _view_module_version: VERSION,
      symbols: {},
      source: null,
      control_overlay: null,
    };
    return defaults;
  }

  initialize(attributes: any, options: any) {
    super.initialize(attributes, options);
  }
}

export class ForceGraphView extends DOMWidgetView {
  static view_name = 'ForceGraphView';
  graph: ForceGraphInstance;

  initialize(parameters: any) {
    super.initialize(parameters);
    this.model.on('change:source', this.onSourceChange, this);
    this.onSourceChange();
  }

  onSourceChange() {
    // TODO move to the model
    // TODO disconnect old ones...
    let source = this.model.get('source');
    if (source) {
      this.update();
    }
  }

  update(): void {
    let source = this.model.get('source');
    console.log('updating...', source);
  }

  async render() {
    const root = this.el as HTMLDivElement;
    const containerDiv = document.createElement('div');

    root.appendChild(containerDiv);

    // don't bother initializing sprotty until actually on the page
    // schedule it

    // this.wait_for_visible(true);

    const N = 300;
    const gData = {
      nodes: [...Array(N).keys()].map((i) => ({ id: i })),
      links: [...Array(N).keys()]
        .filter((id) => id)
        .map((id) => ({
          source: id,
          target: Math.round(Math.random() * (id - 1)),
        })),
    };

    this.graph = ForceGraph()(containerDiv)
      .linkDirectionalParticles(2)
      .graphData(gData);
  }

  // wait_for_visible = (initial = false) => {
  //   if (!this.luminoWidget.isVisible) {
  //     this.was_shown.resolve();
  //   } else {
  //     setTimeout(this.wait_for_visible, initial ? 0 : POLL);
  //   }
  // };
}
