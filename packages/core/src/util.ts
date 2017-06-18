import {  } from "zone.js";

declare var WorkGlobalScope:any;
declare var global:any;
const __window = typeof window !== 'undefined' && window;
const __self = typeof self !== 'undefined' && typeof WorkGlobalScope !== 'undefined' && self instanceof WorkGlobalScope && self;
const __global = typeof global !== 'undefined' && global;
const _global: { [name: string]: any } = __window || __global || __self;
export { _global as global };


export function stringify(token: any): string {
  if (typeof token === 'string') {
    return token;
  }

  if (token == null) {
    return '' + token;
  }

  if (token.overriddenName) {
    return `${token.overriddenName}`;
  }

  if (token.name) {
    return `${token.name}`;
  }

  const res = token.toString();

  if (res == null) {
    return '' + res;
  }

  const newLineIndex = res.indexOf('\n');
  return newLineIndex === -1 ? res : res.substring(0, newLineIndex);
}