# Depository

A NPM registry HTTP server that gets package information from GitHub and falls back
to query the original NPM registry if a package is not provided from GitHub.

## Installation

~~~bash
npm install -g git@github.com:uxebu/depository.git
~~~

## Usage

Starting the server (port 4337) with public GitHub projects that are watched by user `uxebu`:

~~~bash
depository uxebu-system
# showing available GitHub projects and their versions
~~~

Using the server from another shell:

~~~bash
mkdir foo && cd foo
npm --registry=http://localhost:8000/ install depository colors
~~~
