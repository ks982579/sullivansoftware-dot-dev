import type { NextConfig } from "next";

const EMPTY_MODULE = "./src/lib/empty-module.ts";

const nextConfig: NextConfig = {
  // Turbopack (used by `next dev --turbopack`) needs its own alias config —
  // the webpack() function below does NOT apply to Turbopack.
  turbopack: {
    resolveAlias: {
      // Stub out only the Node.js built-ins that mupdf-wasm.js actually
      // statically imports: `module` (via `import("module")`) and `fs`
      // (via `node:fs`). Both are inside `if (isNode)` guards that are
      // always false in the browser, but bundlers resolve them statically.
      //
      // Do NOT alias `path`, `url`, or `crypto` — those have legitimate
      // browser polyfills that Next.js and React internals depend on.
      fs: EMPTY_MODULE,
      module: EMPTY_MODULE,
    },
  },

  webpack(config, { isServer, webpack: wp }) {
    // Required for mupdf WASM to bundle correctly in production
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    // mupdf-wasm.js has conditional Node.js code paths (node:fs, node:module)
    // that webpack tries to resolve statically even though they are guarded by
    // a runtime Node.js environment check. In browser builds we:
    //   1. Strip the "node:" prefix via NormalModuleReplacementPlugin
    //   2. Map the bare names to empty modules via resolve.fallback
    //
    // Only stub `fs` and `module` — do NOT add `path`, `url`, or `crypto`
    // as those have legitimate browser polyfills Next.js sets up.
    if (!isServer) {
      config.plugins.push(
        new wp.NormalModuleReplacementPlugin(
          /^node:/,
          (resource: { request: string }) => {
            resource.request = resource.request.replace(/^node:/, "");
          }
        )
      );

      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
      };
    }

    return config;
  },
};

export default nextConfig;
