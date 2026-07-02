module.exports = {
  apps: [
    {
      name: "backend",
      script: "src/app.js",
      watch: ["src"],
      ignore_watch: [
        "node_modules",
        "src/public/archivos",
        "src\\public\\archivos",
        "src/public/fotos",        
        "src\\public\\fotos",      
        "src/public/uploads",
        "src\\public\\uploads",
        "logs",
        "*.log"
      ],
      watch_options: {
        ignored: [
          "**/public/archivos/**",
          "**/public/fotos/**",    
          "**/public/uploads/**",
          "**/*.log"
        ],
        persistent: true,
        ignoreInitial: true
      },
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