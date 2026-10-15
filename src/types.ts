import { TidyFSAPI } from '../electron/preload.js';

declare global {
  interface Window {
    tidyFS: TidyFSAPI;
  }
}

export * from '../engine/types.js';
