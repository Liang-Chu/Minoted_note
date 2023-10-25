const path = require('path');
const webpack = require('webpack');


const mainConfig =  {
  target: 'electron-main', // Targeting electron main process
  entry: './src/App.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      "path": require.resolve("path-browserify")
    }
  }
  
};


const editorRendererConfig = {
  target: 'electron-renderer', // Targeting electron renderer process
  entry: './src/renderer/editorRenderer.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'editorRenderer.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      "path": require.resolve("path-browserify")
    }
  }
};




const previewRendererConfig =  {
  target: 'electron-renderer', // Targeting electron renderer process
  entry: './src/renderer/previewRenderer.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'previewRenderer.bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      "path": require.resolve("path-browserify")
    }
  }
};

module.exports = [mainConfig, editorRendererConfig, previewRendererConfig];
