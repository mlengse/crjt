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
    // console.log(JSON.stringify(pos.map( e => app.people[e].hasil_pemeriksaan)))
    
    while(sl !== sl - sisa.length){
      id = sl - sisa.length
      nik = sisa.shift()
      // if( id === 10  /* && exclude.indexOf(id) === -1*/)
      {
        // console.log(app.people[nik])
        app.person = await app.upsertPerson({ person: app.people[nik] })

        // if(!app.person.nama){
        //   console.log(app.person)
        // }
        // app.person = app.people[nik]
        app.spinner.succeed(`-----------------------------------`)
        app.spinner.succeed(`processing ${id}, ${nik} ${app.person.nama}${app.person.isKonfirm ? ' terkonfirmasi.' : '.'} tgl ag ${app.person.tanggal_pemeriksaan} Hasil: ${app.person.hasil_pemeriksaan}`)
        app.spinner.succeed(`sisa data after cleaning ${sisa.length}`)

        if(app.person.isKonfirm){
          app.spinner.succeed(`sisa data positif setelah cleaning ${sisa.filter(nik => app.people[nik].isKonfirm).length}`)
        }
        if(!((app.person.checkNIK && app.person.checkNIK.error) || app.person.checkDuplicate) && app.person.validnik){
          await app.inputCorJat()
          console.log('sudah return')
          await app.upsertPerson({ person: app.person })
        }
        if((app.person.checkNIK && app.person.checkNIK.error) || app.person.checkDuplicate || !app.person.validnik){
          // console.log(app.people[nik])
          // console.log(app.person)
          // console.log(JSON.stringify(app.people[nik]) === JSON.stringify(app.person))
          // console.log(!app.person.validnik, app.person.validnik, app.person.nik);
          (app.person.checkDuplicate || !app.person.validnik ) && await app.handleDuplicate();
          (app.person.checkNIK && app.person.checkNIK.error) && await app.handleNIK();
        } 
    
      }
    }

    await app.close(isPM2)

    console.log(`${app.config.npm_package_name} process done: ${new Date()}`)
  }catch(e){
    console.error(`${app.config.npm_package_name} process error: ${new Date()} ${JSON.stringify(e, Object.getOwnPropertyNames(e))}`)
  }
}