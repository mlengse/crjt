const { cloudresourcemanager } = require("googleapis/build/src/apis/cloudresourcemanager")

exports._handleDuplicate = async ({ that }) => {

  if(that.person.checkDuplicate){
    await that.cekAllData()
  } 

  
  !that.person.validnik && that.spinner.succeed(`tak ada NIK ${that.person.nik} ${that.person.nama}`)

  await that.upsertPerson({person: that.person})
}

exports._cekAllData = async ({ that }) => {

  if(!that.person.checkDuplicate.recordsFiltered && !that.person.checkNIK.nama){
    await that.loginCorJat()

    let filterInput = await that.page.$('#filterByNameAllCase')
  
    while(!filterInput){
      that.spinner.start(`get filter input`)
      let close = await that.page.$('button[title="Close"]')
      if(close){
        await that.page.evaluate(() => document.querySelector('button[title="Close"]').click())
      }
  
      await that.page.click(`a#all-case-tab`)
      await that.page.waitForTimeout(100)
      filterInput = await that.page.$('#filterByNameAllCase')
      await that.closeWarning()
    }
  
    that.spinner.start(`check data duplikasi ${that.person.nama}`)
    await that.page.evaluate( () => document.getElementById('filterByNameAllCase').value = '')
    await that.page.type( `input#filterByNameAllCase`,that.person.nama)
  
    await Promise.all([
      that.page.waitForResponse(async response =>{
        if(response.url().includes(`datatable?`) && response.url().includes(that.fixedEncodeURIComponent(that.person.nama))){
          let jsonR = await response.json();
          if(jsonR && jsonR.data && jsonR.data.length){
            jsonR.data = jsonR.data.map( e => Object.assign({}, e, {
              action: undefined
            }))
          }
          that.person.checkDuplicate = Object.assign({}, that.person.checkDuplicate, jsonR);
          return true
        }
        return false
      }, that.waitOpt),
      that.page.type('input#filterByNameAllCase', String.fromCharCode(13))
    ])
  
  }


  if(that.person.checkDuplicate.recordsFiltered !== 1) {
    // console.log(that.person.checkDuplicate.data)
    that.spinner.succeed(`Need TL ${that.person.nik} ${that.person.nama} ${that.person.checkDuplicate.error} ${that.person.checkDuplicate.message} ditemukan: ${that.person.checkDuplicate.recordsFiltered}`)

    // let lastDig = that.person.nik.substring(15)
    // // console.log(lastDig, that.person.nik)

    // while( Number(lastDig) < 9 && (!that.person.checkNIK || Array.isArray(that.person.checkNIK))){
    //   lastDig = Number(lastDig)+1
    //   that.person.nik = `${that.person.nik.substring(0,15)}${lastDig}`
    //   await that.checkNIK()
    //   that.spinner.succeed(`${lastDig}, ${that.person.nik}, ${JSON.stringify(that.person.checkNIK)}`)
    // }

    // if(that.person.checkNIK && !Array.isArray(that.person.checkNIK) && !that.person.checkNIK.error){
    //   that.spinner.start('reinput')
    //   that.person.validnik = that.person.nik
    //   that.person.checkDuplicate = false
    //   await that.inputCorJat()
    // }

    // await that.wait({ time: 10000 })
  }

}