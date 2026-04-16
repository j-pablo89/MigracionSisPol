module.exports = {
  apps: [
    {
      name: "backend",
      script: "src/app.js",
      watch: ["src"],
      ignore_watch: ["node_modules"],
      env: {
        NODE_ENV: "development"
      }
    },
    {
        name: "browser-sync",
        script: "node_modules/browser-sync/dist/bin.js",
        args: "start --config bs-config.js",
        watch: false
    }
  ]
};