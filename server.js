const Path = require("path");
const Express = require("express");
const Logger = require("morgan");
const Mongoose = require("mongoose");
const Compression = require("compression");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "dev";
const App = Express();

App.use(Logger(NODE_ENV));

App.use(Compression());
App.use(Express.urlencoded({ extended: true }));
App.use(Express.json());

App.use(Express.static(Path.join(__dirname, "public")));

Mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost/budget", 
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  }
);

// routes
App.use(require("./routes/api.js"));

App.listen(PORT, () => {
  console.log(`App running on port ${PORT} in ${NODE_ENV} mode!`);
});