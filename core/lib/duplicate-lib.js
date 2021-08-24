exports._handleDuplicate = async ({ that }) => {
  // console.log(!that.person.validnik, that.person.validnik, that.person.nik)

  if(that.person.checkDuplicate){
    await that.cekAllData()
  } 

  
  !that.person.validnik && that.spinner.succeed(`tak ada NIK ${that.person.nik} ${that.person.nama}`)

  await that.upsertPerson({person: that.person})
}

exports._cekAllData = async ({ that }) => {

  if(!that.person.checkDuplicate.recordsFiltered){
    await that.loginCorJat()

    let filterInput = await that.page.$('#filterByNameAllCase')
  
    while(!filterInput){
      await that.page.click(`a#all-case-tab`)
      await that.page.waitForTimeout(100)
      filterInput = await that.page.$('#filterByNameAllCase')
    }
  
    await that.closeWarning()
  
    await that.page.evaluate( () => document.getElementById('filterByNameAllCase').value = '')
    await that.page.type( `input#filterByNameAllCase`,that.person.nama, { delay: 50})
  
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

  that.spinner.succeed(`${that.person.checkDuplicate.error} ${that.person.checkDuplicate.message} ditemukan: ${that.person.checkDuplicate.recordsFiltered}`)

  // await that.page.waitForTimeout(100000)
}