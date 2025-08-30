// Polyfills for browser compatibility
import { Buffer } from 'buffer';

// Make Buffer available globally
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
  window.global = window.global || window;
  
  // Add process polyfill
  window.process = window.process || {
    env: {},
    nextTick: (fn: Function) => setTimeout(fn, 0),
    version: '',
    platform: 'browser'
  };
}

export {};
