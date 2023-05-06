/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import { ObjectHash } from 'backbone';

import {
  IBackboneModelOptions,
} from '@jupyter-widgets/base';

import { EMOJI, IBehave, ILinkBehaveOptions } from '../../tokens';
import { widget_serialization } from '../serializers/widget';

import { FacetedModel } from './base';

export type TCustomEmit = 'emitParticles';

export interface IEmitMessage {
  action: TCustomEmit;
  (...links: any): string;
}

export class LinkParticleModel extends FacetedModel implements IBehave {
  static model_name = 'LinkParticleModel';

  static serializers = {
    ...FacetedModel.serializers,
    color: widget_serialization,
    density: widget_serialization,
    speed: widget_serialization,
    width: widget_serialization,
  };

  initialize(attributes: ObjectHash, options: ILinkBehaveOptions): void {
    super.initialize(attributes, options);
    this.graph = options.view.graph as any;
    this.on('msg:custom', this.handleMessage, this);
  }

  handleMessage(message: IEmitMessage): void {
    const graph = this.view.graph ;

    if (!graph) {
      console.warn(`${EMOJI} graph was not yet initialized, discarding`, message);
      return;
    }

    switch (message.action) {
      case 'emitParticles':
        foreach (link in message.links) {
          graph.emit(link)
        }
      default:
        const exhaustiveCheck: never = message.action;
        console.error(`${EMOJI} Unhandled custom action: ${exhaustiveCheck}`);
    }
  }

  protected get _modelClass(): typeof LinkParticleModel {
    return LinkParticleModel;
  }
  

  getLinkDirectionalParticleColor(options: ILinkBehaveOptions): string | null {
    return this._facets.color ? this._facets.color(options) : null;
  }

  getLinkDirectionalParticleSpeed(options: ILinkBehaveOptions): number | null {
    return this._facets.speed ? this._facets.speed(options) : null;
  }

  getLinkDirectionalParticles(options: ILinkBehaveOptions): number | null {
    return this._facets.density ? this._facets.density(options) : null;
  }

  getLinkDirectionalParticleWidth(options: ILinkBehaveOptions): number | null {
    return this._facets.width ? this._facets.width(options) : null;
  }
}
