/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config, { webpack }) {
    // The Emscripten glue contains Node-only dynamic imports guarded by
    // runtime environment checks. The browser bundle never executes them,
    // but Webpack still tries to resolve the node: scheme during build.
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^node:(module|fs|path|url)$/ }),
    );
    return config;
  },
};

export default nextConfig;
