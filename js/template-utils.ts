/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { NodeObject } from 'force-graph';
import { LinkObject } from 'force-graph/dist/force-graph';
import type { Template } from 'nunjucks';

import { DEBUG, EMOJI } from './tokens';

export function isNumeric(val: string): boolean {
  return !isNaN(Number(val));
}

function noop() {
  return null;
}
export async function makeTemplate<T = any>(
  template: string,
  contextName: string,
  contextAllName: string
): Promise<CallableFunction> {
  const nunjucks = await import('nunjucks');
  let newTemplate: Template;
  try {
    newTemplate = new nunjucks.Template(template, null, null, true);
  } catch (err) {
    DEBUG && console.warn(EMOJI, err);
    return noop;
  }

  const renderTemplate = (context: T, i: number, contextAll: T[]) => {
    let value: number | null;
    try {
      let rendered = newTemplate.render({
        [contextName]: context,
        i,
        [contextAllName]: contextAll,
      });
      value = rendered == null ? null : Number(rendered);

      if (value == null || isNaN(value)) {
        value = null;
      }
    } catch (err) {
      DEBUG && console.warn(EMOJI, err);
      value = null;
    }
    return value;
  };
  return renderTemplate;
}

export async function makeNodeTemplate(template: string): Promise<CallableFunction> {
  return await makeTemplate<NodeObject>(template, 'node', 'nodes');
}

export async function makeLinkTemplate(template: string): Promise<CallableFunction> {
  return await makeTemplate<LinkObject>(template, 'link', 'links');
}
