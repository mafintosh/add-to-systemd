#!/usr/bin/env node

var fs = require('fs')
var path = require('path')
var cp = require('child_process')
var minimist = require('minimist')

var i = 2
var name = null
var skip = false
for (; i < process.argv.length; i++) {
  if (process.argv[i] === '--') continue

  if (skip) {
    skip = false
    continue
  }
  if (process.argv[i][0] === '-') {
    skip = process.argv[i].indexOf('=') === -1
    continue
  }

  if (name) break
  else name = process.argv[i]
}

var argv = minimist(process.argv.slice(0, i), {
  alias: {user: 'u', cwd: 'c', env: 'e'},
  default: {cwd: process.cwd()}
})

var TEMPLATE = fs.readFileSync(path.join(__dirname, 'template.service'), 'utf-8')

if (!name) {
  console.error('Usage: add-to-systemd name [options] command...')
  console.error()
  console.error('  --user, -u  [user]      User the service will run as')
  console.error('  --cwd,  -c  [dir]       Set the cwd of the service')
  console.error('  --env,  -e  [name=val]  Add env vars to the service')
  console.error()
  process.exit(1)
}
if (!fs.existsSync('/lib/systemd/system/')) {
  console.error('/lib/systemd/system/ does not exist. Is systemd installed?')
  process.exit(2)
}

var opts = ''
if (argv.user) opts += 'User=' + argv.user + '\n'
if (argv.cwd) opts += 'WorkingDirectory=' + fs.realpathSync(argv.cwd) + '\n'
if (argv.env) {
  [].concat(argv.env).forEach(function (e) {
    opts += 'Environment=' + e + '\n'
  })
}

var command = process.argv.slice(i).join(' ')
var service = TEMPLATE.replace('{command}', command).replace('{options}', opts)

fs.writeFileSync('/lib/systemd/system/' + name + '.service', service)
cp.spawn('systemctl', ['enable', name + '.service'], {stdio: 'inherit'})
