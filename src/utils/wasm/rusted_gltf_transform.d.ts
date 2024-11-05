/* tslint:disable */
/* eslint-disable */
/**
* @param {Uint8Array} input
* @param {any} xmp_data
* @returns {Promise<any>}
*/
export function add_xmp_metadata(input: Uint8Array, xmp_data: any): Promise<any>;
/**
* @param {Uint8Array} input
* @param {string} format
* @param {number} size
* @returns {Promise<any>}
*/
export function optimize_textures(input: Uint8Array, format: string, size: number): Promise<any>;
/**
* @param {Uint8Array} input
* @returns {Promise<any>}
*/
export function optimize_gltf(input: Uint8Array): Promise<any>;
/**
* @param {Uint8Array} input
* @returns {Promise<any>}
*/
export function generate_report(input: Uint8Array): Promise<any>;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly add_xmp_metadata: (a: number, b: number) => number;
  readonly optimize_textures: (a: number, b: number, c: number, d: number) => number;
  readonly optimize_gltf: (a: number) => number;
  readonly generate_report: (a: number) => number;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h6cc147a312b51dc5: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__hc378de2a2d80f3d7: (a: number, b: number, c: number, d: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
