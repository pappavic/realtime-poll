module.exports = {
  database: {
    db: "play",
    host: process.env.RDB_HOST || "localhost",
    port: process.env.RDB_PORT || 28015
  },

  port: 8091
}
