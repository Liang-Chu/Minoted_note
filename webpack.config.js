const path = require("path");
const webpack = require("webpack");

// Base configuration
const baseConfig = {
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
    fallback: {
      path: require.resolve("path-browserify"),
    },
  },
  optimization: {
    minimize: false,
  },
  watchOptions: {
    ignored: /database/, // This will ignore any paths that include 'database'
  },
};

// Main configuration
const mainConfig = {
  ...baseConfig,
  target: "electron-main",
  entry: "./src/App.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
};

// Editor Renderer configuration
const editorRendererConfig = {
  ...baseConfig,
  target: "electron-renderer",
  entry: "./src/renderer/editorRenderer.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "editorRenderer.bundle.js",
  },
};

// Preview Renderer configuration
const previewRendererConfig = {
  ...baseConfig,
  target: "electron-renderer",
  entry: "./src/renderer/previewRenderer.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "previewRenderer.bundle.js",
  },
};

module.exports = [mainConfig, editorRendererConfig, previewRendererConfig];
