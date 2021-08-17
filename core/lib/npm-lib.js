exports.npmls = async () => await new Promise((resolve, reject) => require('child_process').exec('npm ls --json', (err, stdout, stderr) => {
  if (err) reject(err)
  if (stderr) reject(stderr)
  let result = JSON.parse(stdout)
  resolve(result.dependencies)
}))

exports.npmEnv = Object.entries(require('../../package.json')).reduce((prev, [k, v]) => {
  prev[`npm_package_${k}`] = v
  return prev
}, {})
exports.isPuppeteer = async () => !!(await this.npmls()).puppeteer

