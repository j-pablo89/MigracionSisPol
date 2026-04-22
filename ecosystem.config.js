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
      script: "npm",
      args: "run bs",
      interpreter: "cmd.exe",
      watch: false
    }
  ]
};