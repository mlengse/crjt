exports._itterator = async ({ that }) => {
  let sisa = Object.keys(that.people)
  let pos = sisa.filter(e => that.people[e].isKonfirm)
    .sort((b,a) => that.unixSrt(that.people[a].tanggal_pemeriksaan) - that.unixSrt(that.people[b].tanggal_pemeriksaan));
  let neg = sisa.filter(e => !that.people[e].isKonfirm)
    .sort((b,a) => that.unixSrt(that.people[a].tanggal_pemeriksaan) - that.unixSrt(that.people[b].tanggal_pemeriksaan));
  sisa = [...pos, ...neg]
  let sl = sisa.length
  let nik
  let id
  // console.log(JSON.stringify(pos.map( e => that.people[e].hasil_pemeriksaan)))
  
  while(sl !== sl - sisa.length){
    id = sl - sisa.length
    nik = sisa.shift()
    // if( id === 10  /* && exclude.indexOf(id) === -1*/)
    {
      // console.log(that.people[nik])
      that.person = await that.upsertPerson({ person: that.people[nik] })

      // if(!that.person.nama){
      //   console.log(that.person)
      // }
      // that.person = that.people[nik]
      that.spinner.succeed(`-----------------------------------`)
      that.spinner.succeed(`processing ${id}, ${nik} ${that.person.nama}${that.person.isKonfirm ? ' terkonfirmasi.' : '.'} tgl ag ${that.person.tanggal_pemeriksaan} Hasil: ${that.person.hasil_pemeriksaan}`)
      that.spinner.succeed(`sisa data after cleaning ${sisa.length}`)

      if(that.person.isKonfirm){
        that.spinner.succeed(`sisa data positif setelah cleaning ${sisa.filter(nik => that.people[nik].isKonfirm).length}`)
      }
      if(!((that.person.checkNIK && that.person.checkNIK.error) || that.person.checkDuplicate) && that.person.validnik){
        await that.inputCorJat()
        // console.log('sudah return')
        await that.upsertPerson({ person: that.person })
      }
      if((that.person.checkNIK && that.person.checkNIK.error) || that.person.checkDuplicate || !that.person.validnik){
        // console.log(that.people[nik])
        // console.log(that.person)
        // console.log(JSON.stringify(that.people[nik]) === JSON.stringify(that.person))
        // console.log(!that.person.validnik, that.person.validnik, that.person.nik);
        (that.person.checkDuplicate || !that.person.validnik ) && await that.handleDuplicate();
        (that.person.checkNIK && that.person.checkNIK.error) && await that.handleNIK();
      } 
  
    }
  }

}