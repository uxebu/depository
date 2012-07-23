# Depository

A NPM registry HTTP server that gets package information from GitHub and falls back
to query the original NPM registry if a package is not provided from GitHub.

This project grabs node package information from GitHub through the 
[GitHub API](http://developer.github.com/) and provides this information through a 
similar data structure as the NPM registry for a particular node package. Depository
can provide the NPM registry information from a GitHub project, if the following 
conditions are met:

* the GitHub project name is used as the node package name
* versions of a particular GitHub project need to be tagged using [semantic versioning](http://semver.org/)
* there needs to be a `package.json` on the repository root
* the node package name in `package.json` needs to be equal to its GitHub project name
* the version-string in the `package.json` of a tagged version need to comply with the version of the tagname 

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

If you want to start the server on a different port or you want to query GitHub differently
check the command-line parameters:

~~~bash
depository --help
~~~
