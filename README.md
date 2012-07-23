# Depository

A NPM registry HTTP server that gets package information from GitHub and falls back
to query the original NPM registry if a package is not provided from GitHub.

This project grabs node package information from GitHub through the 
[GitHub API](http://developer.github.com/) and provides this information through a 
similar data structure as the NPM registry for a particular node package. Depository
can provide the NPM registry information from a GitHub project and its supplied tarballs,
if the following conditions are met:

* the GitHub project name is used as the node package name
* versions of a particular GitHub project need to be tagged using [semantic versioning](http://semver.org/)
* there needs to be a `package.json` on the repository root
* the node package name in `package.json` needs to be equal to its GitHub project name
* the version-string in the `package.json` of a tagged version need to comply with the version of the tagname 

## Advantages

It is useful if you have to manage private NPM packages on GitHub and where you want to have
a similar control as with public hosted NPM packages and you don't want to maintain varying
git or tarball URLs. When using `depository`, installing a GitHub hosted NPM package will 
look like this:

~~~bash
npm install depository@~0.1
~~~

Or in a `package.json`:

~~~js
{
  "name": "foo",
  "dependencies": {
    "depository": "~0.1.0"
  }
}
~~~

Another advantage of using `depository` is that the local NPM cache can be used more efficiently
for non-published NPM packages, because package dependencies don't need to be downloaded / cloned
completely (for the purpose of package verification) every time before they can be installed. This
sometimes can take some time if you want to deploy / update a node application with several private
dependencies.

## Installation

~~~bash
npm install -g git://github.com/uxebu/depository.git
~~~

## Usage

Starting the server (on port 4337) with public GitHub projects that are watched by user `uxebu-system`:

~~~bash
depository uxebu-system
# showing available GitHub projects and their versions
~~~

Using the depository server from another shell to install / query GitHub hosted NPM packages:

~~~bash
mkdir foo && cd foo
# will download the depository tarball from GitHub and colors from registry.npmjs.org
npm --registry=http://localhost:4337/ install depository colors
# showing details about the depository package
npm --registry=http://localhost:4337/ info depository
# jumping to the project site of this package
npm --registry=http://localhost:4337/ docs depository
# jumping to the issue tracker of this package
npm --registry=http://localhost:4337/ bugs depository
~~~

For a permanent change you can do the following

~~~bash
npm config set registry http://localhost:4337
~~~

## Usage with private repositories

If you want to use `depository` for private GitHub repositories you need to provide the password of the
GitHub user:

~~~bash
# providing all watched public and private repositories as npm packages
despository github_user -p github_password
~~~

When a private GitHub project tarball is requested through NPM it'll use the provided username and password 
for authentication (using basic authentication).

## Command-line arguments

If you want to start the server on a different port or you want to query GitHub differently,
check the command-line parameters through:

~~~bash
depository --help
~~~

## TODO

* provide a reloading mechanism for the GitHub project information
