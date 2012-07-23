# Depository

A NPM registry HTTP server that gets package information from GitHub and falls back
to query the original NPM registry if a package is not provided from GitHub.

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

Using the server from another shell:

~~~bash
mkdir foo && cd foo
npm --registry=http://localhost:4337/ install depository colors
# will download the depository-tarball from GitHub and color from registry.npmjs.org
~~~

If you want to start the server on a different port or you want to query GitHub differently
check the command-line parameters:

~~~bash
depository --help
~~~

