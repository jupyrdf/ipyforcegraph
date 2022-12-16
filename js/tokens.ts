import PKG from '../package.json';

export const NAME = PKG.name;
export const VERSION = PKG.version;

export const FORCEGRAPH_DEBUG = window.location.hash.indexOf('FORCEGRAPH_DEBUG') > -1;
