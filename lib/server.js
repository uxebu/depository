var github = require('./github.js');
var http = require('http');
var http_proxy = require('http-proxy');
var mimelib = require("mimelib-noiconv");
var semver = require('semver');

var exposed, versionData;

var handle200 = function(res, data) {
  res.writeHead(200);
  res.write(data);
  res.end();
};

var handle404 = function(res, data) {
  res.writeHead(404);
  res.write(data);
  res.end();
};

var handleRequest = function(req, res, proxy) {
  var urlMatch = req.url.match(/\/([^\/]*)\/?([^\/]*)?/);
  var project = urlMatch[1];
  var version = urlMatch[2];
  if ((req.method == 'GET' && project) && (Object.keys(versionData).indexOf(project) > -1 || version == 'latest') ) {
    if (version) {
      if (versionData[project].versions && Object.keys(versionData[project].versions).indexOf(version) > -1) {
        exposed._handle200(res, JSON.stringify(
          versionData[project].versions[version]
        ));
      } else if (version == 'latest') {
        exposed._handle200(res, JSON.stringify(
          getInfoLatestVersion(versionData[project])
        ));
      } else {
        exposed._handle404(res, 'depository: Package not found.');
      }
    } else {
      exposed._handle200(res, JSON.stringify(
        versionData[project]
      ));
    }
  } else {
    // just proxy to npmjs
    req.headers.host = 'registry.npmjs.org'
    proxy.proxyRequest(req, res, {
      host: 'registry.npmjs.org',
      port: 80
    });
  }
};

var server = http_proxy.createServer(handleRequest);
server.proxy.on('end', function(req, res) {
  console.log('Served package from: ' + req.url);
});

var init = function(config, callback) {

  var getInfo = function(repos, callback) {
    github.getInfo(repos, function(err, data) {
      versionData = prepareVersionsForNpm(data);
      callback(err, versionData, server);
    });
  };

  // grab version information from github
  github.init(config.username, config.password);
  if (! config.repos) {
    if (config.queryAll) {
      github.getAllRepos(function(err, repos) {
        if (err) {
          callback(err);
        } else {
          getInfo(repos, callback);
        }
      });
    } else {
      github.getWatchedRepos(function(err, repos) {
        if (err) {
          callback(err);
        } else {
          getInfo(repos, callback);
        }
      });
    }
  } else {
    getInfo(repos, callback);
  }

};

var setupServer = function(config, callback) {
  init(config, callback);
};

var prepareVersionsForNpm = function(versionData) {
  var latestVersion, latestVersionData, projectName, projectVersions;
  var retData = {};
  for (projectName in versionData) {
    projectVersions = versionData[projectName];
    projectVersions = Object.keys(projectVersions).sort(function(a, b) {
      return semver.lt(a, b);
    });
    latestVersion = projectVersions[0];
    latestVersionData = versionData[projectName][latestVersion] || {};
    latestVersionData.maintainers = latestVersionData.maintainers || [];
    var latestMaintainers = latestVersionData.maintainers.map(function(address) {
      var parsedAddress = mimelib.parseAddresses(address);
      return {
        email: parsedAddress[0].address,
        name: parsedAddress[0].name
      }
    });
    retData[projectName] = {
      _id: latestVersionData.name,
      name: latestVersionData.name,
      'dist-tags': {
        latest: latestVersion
      },
      versions: versionData[projectName],
      maintainers: latestMaintainers
    };
  }
  return retData;
};

var getInfoLatestVersion = function(projectData) {
  projectData = projectData ||{};
  var latestVersion = projectData['dist-tags'] ? projectData['dist-tags'].latest : null;
  return projectData.versions ? projectData.versions[latestVersion] : {};
};

exposed = module.exports = {
  _handle200: handle200,
  _handle404: handle404,
  _handleRequest: handleRequest,
  _versionData: versionData,
  getInfoLatestVersion: getInfoLatestVersion,
  init: init,
  prepareVersionsForNpm: prepareVersionsForNpm,
  setup: setupServer
};
