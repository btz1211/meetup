var config = {
  "test":{
    "db":{
      "mongodb": "mongodb://localhost/test"
    },
    "logger":{
      "api": "logs/test_api.log",
      "exception": "logs/test_exceptions.log"
    }
  },
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
console.log('node env:' + node_env);
module.exports = config[node_env]
