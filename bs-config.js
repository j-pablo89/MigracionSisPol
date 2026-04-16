module.exports = {
  proxy: "http://localhost:5000",
  files: [
    "src/views/**/*.ejs",
    "src/public/css/**/*.css",
    "src/public/js/**/*.js"
  ],
  reloadDelay: 200,
  notify: true,
  open: true
};
