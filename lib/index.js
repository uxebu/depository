var optimist = require('optimist');
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
    describe: "Update interval for querying GitHub.",
    default: 60e4 // 10 minutes
  })
  .argv;

if(argv.help) {
  optimist.showHelp();
  process.exit(1);
}

console.log('Starting depository NPM registry ...');

var repos = typeof argv.repo == 'string' ? [argv.repo] : argv.repo;

server.setup({
  username: argv._[0],
  password: argv.password,
  queryAll: argv.all,
  repos: repos,
  updateInterval: argv.interval
}, function(err, data, webServer) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  webServer.listen(argv.port, function() {
    console.log("Started depository NPM registry on port " + webServer.address().port);
    server.printServedPackages(data);
  });
});
