const Core = require('./core')

const app = new Core()

const exclude = [ 278 ]

module.exports = async (isPM2) => {
  try{
    await app.init()

    app.spinner.succeed(`total data after cleaning ${Object.keys(app.people).length}`)
    app.spinner.succeed(`total data positif setelah cleaning ${Object.keys(app.people).filter(nik => app.people[nik].isKonfirm).length}`)

    let sisa = Object.keys(app.people)
    let pos = sisa.filter(e => app.people[e].isKonfirm)
      .sort((b,a) => app.unixSrt(app.people[a].tanggal_pemeriksaan) - app.unixSrt(app.people[b].tanggal_pemeriksaan));
    let neg = sisa.filter(e => !app.people[e].isKonfirm)
      .sort((b,a) => app.unixSrt(app.people[a].tanggal_pemeriksaan) - app.unixSrt(app.people[b].tanggal_pemeriksaan));
    sisa = [...pos, ...neg]
    let sl = sisa.length
    let nik
    let id
    
    while(sl !== sl - sisa.length){
      id = sl - sisa.length
      nik = sisa.shift()
      // if( id >= 681 /* && exclude.indexOf(id) === -1*/)
      {
        app.person = await app.upsertPerson({ person: app.people[nik] })
        // app.person = app.people[nik]
        app.spinner.succeed(`-----------------------------------`)
        app.spinner.succeed(`processing ${id}, ${nik} ${app.person.nama} ${app.person.isKonfirm ? 'terkonfirmasi' : ''}. Hasil ag: ${app.person.hasil_pemeriksaan}`)
        app.spinner.succeed(`sisa data after cleaning ${sisa.length}`)

        if(app.person.isKonfirm){
          app.spinner.succeed(`sisa data positif setelah cleaning ${sisa.filter(nik => app.people[nik].isKonfirm).length}`)
        }
        if(!((app.person.checkNIK && app.person.checkNIK.error) || app.person.checkDuplicate)){
          await app.inputCorJat()
          await app.upsertPerson({ person: app.person })
        }
        if((app.person.checkNIK && app.person.checkNIK.error) || app.person.checkDuplicate){
          app.person.checkDuplicate && app.handleDuplicate()
          app.person.checkNIK.error && app.handleNIK()
        } 
    
      }
    }

    await app.close(isPM2)

    console.log(`${app.config.npm_package_name} process done: ${new Date()}`)
  }catch(e){
    console.error(`${app.config.npm_package_name} process error: ${new Date()} ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`)
  }
}