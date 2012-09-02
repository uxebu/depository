var colors = require('colors');
var github = require('./github.js');
var optimist = require('optimist');
var semver = require('semver');
var server = require('./server.js');

var argv = optimist.usage('Usage: $0 github_username [options]')
  .demand('_')
  .options('p', {
    alias: 'password',
    type: 'string',
    describe: 'The GitHub password to retrieve non-public repos.'
  })
  .options('a', {
    alias: 'all',
    type: 'boolean',
    describe: 'Query all repos of GitHub user (default: query watched repos of user).',
    'default': false
  })
  .options('r', {
    alias: 'repo',
    type: 'string',
    describe: [
      'Repo (e.g. "foo/bar") that should be queried. Use it multiple times to ',
      'query more than one repo.'
    ].join('')
  })
  .options('P', {
    alias: 'port',
    describe: 'Port where the server should listen.',
    'default': 4337
  })
  .options('h', {
    alias: 'help',
    type: 'boolean',
    describe: 'Show help',
    'default': false
  })
  .options('i', {
    alias: 'interval',
    describe: 'Update interval for querying GitHub.',
    default: 60e4 // 10 minutes
  })
  .argv;

if(argv.help) {
  optimist.showHelp();
  process.exit(1);
}

console.log('Starting depository NPM registry ...'.green);

var repos = typeof argv.repo == 'string' ? [argv.repo] : argv.repo;
var config = {
  username: argv._[0],
  password: argv.password,
  queryAll: argv.all,
  repos: repos
};

var printServedPackages = function(data) {
  if (Object.keys(data) == 0) {
    console.log("Serving no GitHub projects!".red);
  } else {
    console.log("Serving GitHub projects:".green);
    for(var project in data) {
      console.log([
        '  ',
        project.blue,
        ': ',
        JSON.stringify(Object.keys(data[project].versions).sort(function(a, b) {
          return semver.lt(a, b) ? 1 : -1;
        })).magenta
      ].join(''));
    }
  }
  var rateLimitOutput = 'GitHub rate limit remaining (reset each hour): ' + github.ratelimitRemaining + ' requests';
  console.log(rateLimitOutput.yellow);
};

server.setup(config, function(err, data, webServer) {
  if (err) {
    console.error(err.red);
    process.exit(1);
  }
  webServer.listen(argv.port, function() {
    console.log('Started depository NPM registry on port '.green + (webServer.address().port + '').magenta);
    printServedPackages(data);

    var updateCallback = function(err, data) {
      if(err) {
        console.log('Update failed: '.red + e.stack.red)
      } else {
        printServedPackages(data);
      }
    };

    setInterval(function() {
      console.log('Updating GitHub information.'.green);
      server.init(config, updateCallback);
    }, argv.interval);

  });
});
