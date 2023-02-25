/*
 * Copyright (c) 2023 ipyforcegraph contributors.
 * Distributed under the terms of the Modified BSD License.
 */

export function noop(...args: any[]): null {
  return null;
}

export function isNumeric(val: string): boolean {
  return !isNaN(Number(val));
}

export function functor(value: any) {
  return () => value;
}
