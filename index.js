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
  alias: {
    after: 'a',
    user: 'u',
    cwd: 'c',
    env: 'e',
    nice: 'n',
    restart: 'r',
    option: 'o'
  },
  default: {
    after: ['syslog.target', 'network.target', 'remote-fs.target', 'nss-lookup.target'],
    cwd: process.cwd()
  }
})

var TEMPLATE = fs.readFileSync(path.join(__dirname, 'template.service'), 'utf-8')

if (!name) {
  console.error('Usage: add-to-systemd name [options] command...')
  console.error()
  console.error('  -a, --after          [target]    Target the service will wait for')
  console.error('  -u, --user           [user]      User the service will run as')
  console.error('  -c, --cwd            [dir]       Set the cwd of the service')
  console.error('  -n, --nice           [integer]   Set the process niceness')
  console.error('  -e, --env            [name=val]  Add env vars to the service')
  console.error('  -r, --restart        [integer]   Wait this many secs when restarting')
  console.error('  -N, --no-rate-limit              Disable restart rate limits')
  console.error('  -o, --option         [name=val]   Set any systemd option')
  console.error()
  process.exit(1)
}
if (!fs.existsSync('/etc/systemd/system/')) {
  console.error('/etc/systemd/system/ does not exist. Is systemd installed?')
  process.exit(2)
}

var v = Number(cp.execSync('systemctl --version').toString().trim().split('\n')[0].trim().split(' ').pop() || 0)

var opts = ''
var uopts = ''
if (argv.user) opts += 'User=' + argv.user + '\n'
if (argv.cwd) opts += 'WorkingDirectory=' + fs.realpathSync(argv.cwd) + '\n'
if (argv.nice) opts += 'Nice=' + argv.nice + '\n'
if (argv.env) {
  [].concat(argv.env).forEach(function (e) {
    opts += 'Environment=' + e + '\n'
  })
}
if (argv.restart) opts += 'RestartSec=' + argv.restart + '\n'
if (argv.N || argv['rate-limit'] === false) {
  if (v < 230) opts += 'StartLimitInterval=0\n'
  else uopts += 'StartLimitIntervalSec=0\n'
}

var options = [].concat(argv.option || [])

options.forEach(function (pair) {
  opts += pair + '\n'
})

var after = [].concat(argv.after || []).join(' ')
var command = process.argv.slice(i).join(' ')
var service = TEMPLATE
.replace('{after}', after)
.replace('{command}', command)
.replace('{service-options}', opts)
.replace('{unit-options}', uopts)
var filename = '/etc/systemd/system/' + name + '.service'

fs.writeFileSync(filename, service)
console.log('Wrote service file to: ' + filename)
cp.spawn('systemctl', ['enable', name + '.service'], {stdio: 'inherit'}).on('exit', function () {
  cp.spawn('systemctl', ['daemon-reload'], {stdio: 'inherit'})
})
