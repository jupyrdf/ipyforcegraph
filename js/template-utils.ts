/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */
import type { NodeObject } from 'force-graph';
import { LinkObject } from 'force-graph/dist/force-graph';
import { Environment, Template } from 'nunjucks';

import { PromiseDelegate } from '@lumino/coreutils';

import { DEBUG, EMOJI } from './tokens';

export const MATH_CONST = {
  E: Math.E,
  LN10: Math.LN10,
  LN2: Math.LN2,
  LOG10E: Math.LOG10E,
  LOG2E: Math.LOG2E,
  PI: Math.PI,
  SQRT1_2: Math.SQRT1_2,
  SQRT2: Math.SQRT2,
};

export const MATH_UNARY = [
  Math.acos,
  Math.acosh,
  Math.asin,
  Math.asinh,
  Math.atan,
  Math.atanh,
  Math.cbrt,
  Math.ceil,
  Math.cos,
  Math.exp,
  Math.expm1,
  Math.floor,
  Math.fround,
  Math.log,
  Math.log10,
  Math.log1p,
  Math.log2,
  Math.sign,
  Math.sin,
  Math.sqrt,
  Math.tan,
  Math.trunc,
];

export const MATH_BINARY = [Math.imul, Math.atan2];

export const MATH_N_ARY = [Math.min, Math.max];

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

export async function newTemplate(src: string): Promise<Template> {
  const env = await nunjucksEnv();
  return new Private.TemplateClass(src, env, null, true);
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
  addCustomGlobals(env);

  // save in namespace
  Private.TemplateClass = nunjucks.Template;
  Private.env = env;
  Private.loading.resolve(env);
  return env;
}

export interface INAryJs {
  (...values: number[]): number;
}

export interface INAryPy {
  (values: number[] | number, ...moreValues: number[]): number;
}

/**
 * Register globals in the environment that can be called by any template.
 */
function addCustomGlobals(env: Environment) {
  for (const [constName, constValue] of Object.entries(MATH_CONST)) {
    env.addGlobal(constName, constValue);
  }
  for (const fn of MATH_UNARY) {
    env.addGlobal(fn.name, fn);
  }
  for (const fn of MATH_BINARY) {
    env.addGlobal(fn.name, fn);
  }
  for (const fn of MATH_N_ARY) {
    env.addGlobal(fn.name, wrapNAry(fn));
  }
  env.addFilter('where', (iterable: any[], attr: string, value: any) => {
    const results: any[] = [];
    for (const item of iterable) {
      if (item[attr] === value) {
        results.push(item);
      }
    }
    return results;
  });
}

/**
 * Make a `Math` method more like python.
 */
function wrapNAry(jsFn: INAryJs): INAryPy {
  function pyFn(values: number[] | number, ...rest: number[]) {
    return Array.isArray(values) ? jsFn(...values) : jsFn(values, ...rest);
  }
  return pyFn;
}

async function makeForceTemplate<T = any>(
  src: string,
  contextName: string,
  contextAllName: string
): Promise<CallableFunction> {
  let template: Template;
  try {
    template = await newTemplate(src);
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
