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
  .options('t', {
    alias: 'tags_regexp',
    describe: 'Regular expression that matches a git-tag as version.',
    'default': /v\d.*/
  })
  .argv;

console.log('Starting depository NPM registry ...');

var repos = typeof argv.repo == 'string' ? [argv.repo] : argv.repo;

server.setup({
  username: argv._[0],
  password: argv.password,
  queryAll: argv.all,
  repos: repos
}, function(err, data, server) {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  server.listen(8000, function() {
    console.log("Started depository NPM registry on port " + server.address().port);
  });
});
