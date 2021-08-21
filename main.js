const Core = require('./core')

const app = new Core()

const exclude = [ 278 ]

module.exports = async (isPM2) => {
  try{
    await app.init()

    app.spinner.succeed(`total data after cleaning ${Object.keys(app.people).length}`)
    app.spinner.succeed(`total data positif setelah cleaning ${Object.keys(app.people).filter(nik => app.people[nik].hasil_pemeriksaan.toLowerCase().includes('tif') && app.people[nik].hasil_pemeriksaan.toLowerCase().includes('p')).length}`)

    for(let [id, nik] of Object.entries(Object.keys(app.people)))
    if(id >= 704 /*&& exclude.indexOf(id) === -1*/)
    {
      app.person = await app.upsertPerson({ person: app.people[nik] })
      app.spinner.succeed(`-----------------------------------`)
      // console.log(app.person)
      app.spinner.succeed(`processing ${id}, ${nik} ${app.person.nama}`)
      await app.inputCorJat()
      await app.upsertPerson({ person: app.person })
    }

    await app.close(isPM2)

    console.log(`${app.config.npm_package_name} process done: ${new Date()}`)
  }catch(e){
    console.error(`${app.config.npm_package_name} process error: ${new Date()} ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`)
  }
}