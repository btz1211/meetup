var config = {
  "development":{
    "db":{
      "mongodb": "mongodb://localhost/local"
    },
    "logger":{
      "api": "logs/api.log",
      "exception": "logs/exceptions.log"
    }
  },

  "production":{
    "db":{
      "mongodb": "mongodb://localhost/local"
    },
    "logger":{
      "api": "logs/api.log",
      "exception": "logs/exceptions.log"
    }
  }
}

var node_env = process.env.NODE_ENV || 'development'
module.exports = config[node_env]
