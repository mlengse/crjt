const Core = require('./core')

const app = new Core()

const exclude = [ 278 ]

module.exports = async (isPM2) => {
  try{
    await app.init()

    for(let [id, nik] of Object.entries(Object.keys(app.people)))
    if(id >  55 /*&& exclude.indexOf(id) === -1*/)
    {
      app.spinner.succeed(`processing ${id}, ${nik}`)
      await app.inputCorJat( { person: app.people[nik] } )
    }

    await app.close(isPM2)

    console.log(`${app.config.npm_package_name} process done: ${new Date()}`)
  }catch(e){
    console.error(`${app.config.npm_package_name} process error: ${new Date()} ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`)
  }
}