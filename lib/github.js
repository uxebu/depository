var GitHubApi = require('github');
var semver = require('semver');
var url = require('url');

module.exports = {

  init: function(username, password, callback) {
    this.username = username;
    this.password = password;
    this.github = new GitHubApi({
      version: "3.0.0"
    });
    if (this.username && this.password) {
      this.github.authenticate({
        type: 'basic',
        username: this.username,
        password: this.password
      });
    }
  },

  getAllRepos: function(callback) {
    var retRepos = [];
    var self = this;
    var getMethod = ! this.password ? 'getFromUser' : 'getAll';
    this.github.repos[getMethod]({
      type: 'all',
      user: this.username
    }, function(err, repos) {
      if (err) {
        callback(err);
        return;
      }
      retRepos = self._extractRepoNames(repos || []);
      self.github.orgs.getFromUser({
        user: self.username
      }, function(err, orgs) {
        if (err) {
          callback(err);
          return;
        }
        if (orgs.length == 0) {
          callback(null, retRepos);
          return;
        }
        orgs.forEach(function(org, idx) {
          self.github.repos.getFromOrg({
            org: org.login
          }, function(err, repos) {
            retRepos = retRepos.concat(self._extractRepoNames(repos || []));
            if (idx == orgs.length - 1) {
              callback(null, retRepos);
            }
          });
        });
      });
    });
  },

  getWatchedRepos : function(callback) {
    var self = this;
    var watchMethod = ! this.password ? 'getWatchedFromUser' : 'getWatched';
    this.github.repos[watchMethod]({
      user: this.username
    }, function(err, repos) {
      callback(err, self._extractRepoNames(repos || []));
    });
  },

  _extractRepoNames: function(repos) {
    var retRepos = [];
    repos.forEach(function(repo){
      retRepos.push(repo.full_name);
    });
    return retRepos;
  },

  getInfo: function(repos, callback) {
    var retData = {};
    var self = this;
    repos.forEach(function(item) {
      var userRepo = item.split('/');
      var versions = self.getRepoDetails(userRepo[0], userRepo[1], function(err, data) {
        if(err) callback(err);
        retData[userRepo[1]] = data;
        if(repos.length == Object.keys(retData).length) {
          callback(null, retData);
        }
      });
    });
  },

  getRepoDetails: function(user, repo, callback) {
    var self = this;
    this.github.repos.getTags({
      user: user,
      repo: repo
    }, function(err, res) {
      var ret = {};
      if(err) callback(err);
      res = res.filter(function(item) {
        return item.name.match(/v\d.*/);
      });
      if (res.length == 0) {
        callback(null, []);
      }
      res.forEach(function(item) {
        self.getPackageJson(user, repo, item.commit.sha, function(err, packageJson) {
          var version = semver.clean(item.name);
          packageJson.version = version;
          ret[version] = packageJson;
          ret[version].dist = {
            'tarball': self.addCredentialsToUrl(item.tarball_url)
          }
          if (Object.keys(ret).length == res.length) {
            callback(null, ret);
          }
        });
      });
    });
  },

  getPackageJson: function(user, repo, sha, callback) {
    var self = this;
    this.github.gitdata.getTree({
      user: user,
      repo: repo,
      sha: sha
    }, function(err, tree) {
      if(err) {
        callback(err);
        return;
      }
      var packageJson = tree.tree.filter(function(item) {
        return item.path == 'package.json';
      });
      packageJson = packageJson[0];
      self.github.gitdata.getBlob({
        user: user,
        repo: repo,
        sha: packageJson.sha
      }, function(err, blob) {
        if(err) {
          callback(err);
        } else {
          var blob = new Buffer(blob.content, blob.encoding).toString();
          callback(null, JSON.parse(blob));
        }
      });
    });
  },

  addCredentialsToUrl: function(tarballUrl) {
    if (this.username && this.password) {
      tarballUrl = url.parse(tarballUrl);
      tarballUrl.auth = this.username + ':' + this.password;
      tarballUrl = url.format(tarballUrl);
    }
    return tarballUrl;
  }

};
