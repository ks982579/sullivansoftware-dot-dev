// Empty stub module used by Turbopack resolveAlias to satisfy Node.js built-in
// imports (fs, module, path, url) inside mupdf-wasm.js when building for the
// browser. The mupdf WASM loader has conditional Node.js code paths that the
// bundler analyses statically even though they are guarded by a runtime check
// that is always false in the browser.
export {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default {} as any;
