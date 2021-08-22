const Core = require('./core')

const app = new Core()

const exclude = [ 278 ]

module.exports = async (isPM2) => {
  try{
    await app.init()

    app.spinner.succeed(`total data after cleaning ${Object.keys(app.people).length}`)
    app.spinner.succeed(`total data positif setelah cleaning ${Object.keys(app.people).filter(nik => app.people[nik].hasil_pemeriksaan.toLowerCase().includes('tif') && app.people[nik].hasil_pemeriksaan.toLowerCase().includes('p')).length}`)

    let sisa = Object.keys(app.people)
    let pos = sisa.filter(e => app.people[e].hasil_pemeriksaan 
      && app.people[e].hasil_pemeriksaan.toLowerCase().includes('tif') 
      && app.people[e].hasil_pemeriksaan.toLowerCase().includes('p'))
      .sort((b,a) => app.unixSrt(app.people[a].tanggal_pemeriksaan) - app.unixSrt(app.people[b].tanggal_pemeriksaan));
    let neg = sisa.filter(e => !app.people[e].hasil_pemeriksaan 
      || (app.people[e].hasil_pemeriksaan 
        && app.people[e].hasil_pemeriksaan.toLowerCase().includes('tif') 
        && !app.people[e].hasil_pemeriksaan.toLowerCase().includes('p')))
        .sort((b,a) => app.unixSrt(app.people[a].tanggal_pemeriksaan) - app.unixSrt(app.people[b].tanggal_pemeriksaan));
    sisa = [...pos, ...neg]
    let sl = sisa.length
    let nik
    let id
    
    while(sl !== sl - sisa.length){
      id = sl - sisa.length
      nik = sisa.shift()
      if( id >= 681 /* && exclude.indexOf(id) === -1*/)
      {
        app.person = await app.upsertPerson({ person: app.people[nik] })
        // app.person = app.people[nik]
        app.spinner.succeed(`-----------------------------------`)
        app.spinner.succeed(`processing ${id}, ${nik} ${app.person.nama} ${app.person.hasil_pemeriksaan}`)
        app.spinner.succeed(`sisa data after cleaning ${sisa.length}`)

        if(app.person.hasil_pemeriksaan.toLowerCase().includes('tif') && app.person.hasil_pemeriksaan.toLowerCase().includes('p')){
          app.spinner.succeed(`sisa data positif setelah cleaning ${sisa.filter(nik => app.people[nik].hasil_pemeriksaan.toLowerCase().includes('tif') && app.people[nik].hasil_pemeriksaan.toLowerCase().includes('p')).length}`)
        }
        // await app.inputCorJat()
        // await app.upsertPerson({ person: app.person })
      }
    }

    await app.close(isPM2)

    console.log(`${app.config.npm_package_name} process done: ${new Date()}`)
  }catch(e){
    console.error(`${app.config.npm_package_name} process error: ${new Date()} ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`)
  }
}