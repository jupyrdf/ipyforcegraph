/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { NodeObject } from 'force-graph';
import { LinkObject } from 'force-graph/dist/force-graph';
import { Environment, Template } from 'nunjucks';

import { PromiseDelegate } from '@lumino/coreutils';

import { DEBUG, EMOJI } from './tokens';

export function isNumeric(val: string): boolean {
  return !isNaN(Number(val));
}

function noop() {
  return null;
}

namespace Private {
  export let env: Environment | null = null;
  export let loading: PromiseDelegate<Environment> | null = null;
  export let TemplateClass: typeof Template | null = null;
}

export async function newTemplate(src: string, path?: string): Promise<Template> {
  const env = await nunjucksEnv();
  return new Private.TemplateClass(src, env, path, true);
}

function addCustomFilters(env: Environment) {
  env.addFilter('min', (values: number[], ...rest: number[]) =>
    Array.isArray(values) ? Math.min(...values) : Math.min(values, ...rest)
  );
  env.addFilter('max', (values: number[], ...rest: number[]) =>
    Array.isArray(values) ? Math.max(...values) : Math.max(values, ...rest)
  );
}

export async function nunjucksEnv(): Promise<Environment> {
  if (Private.env) {
    return Private.env;
  }
  if (Private.loading) {
    await Private.loading.promise;
    return Private.env;
  }
  Private.loading = new PromiseDelegate();
  const nunjucks = await import('nunjucks');
  const env = new nunjucks.Environment();
  // install custom tags
  addCustomFilters(env);

  // save in namespace
  Private.TemplateClass = nunjucks.Template;
  Private.env = env;
  Private.loading.resolve(env);
  return env;
}

async function makeForceTemplate<T = any>(
  src: string,
  contextName: string,
  contextAllName: string
): Promise<CallableFunction> {
  let template: Template;
  try {
    template = await newTemplate(src, contextName);
  } catch (err) {
    DEBUG && console.warn(EMOJI, err);
    return noop;
  }

  const renderTemplate = (context: T, i: number, contextAll: T[]) => {
    let value: number | null;
    try {
      let rendered = template.render({
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

export async function makeForceNodeTemplate(
  template: string
): Promise<CallableFunction> {
  return await makeForceTemplate<NodeObject>(template, 'node', 'nodes');
}

export async function makeForceLinkTemplate(
  template: string
): Promise<CallableFunction> {
  return await makeForceTemplate<LinkObject>(template, 'link', 'links');
}
