var config = {
  "test":{
    "db":{
      "uri": "mongodb://localhost/test"
    },
    "logger":{
      "api": "logs/test_api.log",
      "debug": "logs/test_debug.log",
      "exception": "logs/test_exceptions.log"
    }
  },

  "development":{
    "db":{
      "uri": "mongodb://localhost/meetup"
    },
    "logger":{
      "api": "logs/api.log",
      "debug": "logs/debug.log",
      "exception": "logs/exceptions.log"
    }
  },

  "production":{
    "db":{
      "uri": "ds049854.mlab.com:49854/meetup",
      "options":  {
          "user": 'dodo',
          "pass": 'baote1211'
      }
    },
    "logger":{
      "api": "logs/api.log",
      "debug": "logs/debug.log",
      "exception": "logs/exceptions.log"
    }
  }
}

var node_env = process.env.NODE_ENV || 'development'
console.log('node env:' + node_env);
module.exports = config[node_env]
