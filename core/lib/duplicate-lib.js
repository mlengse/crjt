exports._handleDuplicate = async ({ that }) => {
  // console.log(!that.person.validnik, that.person.validnik, that.person.nik)

  if(that.person.checkDuplicate){
    await that.cekAllData()
  } 

  
  !that.person.validnik && that.spinner.succeed(`tak ada NIK ${that.person.nik} ${that.person.nama}`)

  await that.upsertPerson({person: that.person})
}

exports._cekAllData = async ({ that }) => {
  that.spinner.succeed(`duplikasi ${that.person.checkDuplicate.error} ${that.person.checkDuplicate.message}`);

  await that.loginCorJat()

  let filterInput = await that.page.$('#filterByNameAllCase')

  if(!filterInput){
    await Promise.all([
      that.page.click(`a#all-case-tab`),
      that.waitFor({ selector: '#filterByNameAllCase'})
    ])
  }

  await that.closeWarning()

  await that.page.evaluate( () => document.getElementById('filterByNameAllCase').value = '')
  await that.page.type( `input#filterByNameAllCase`,that.person.nama, { delay: 200})

  await Promise.all([
    that.page.waitForResponse(async response =>{
      if(response.url().includes(`datatable?`) && response.url().includes(that.person.nama.split(' ').join('%20'))){
        let jsonR = await response.json();
        that.person.checkDuplicate = Object.assign({}, that.person.checkDuplicate, jsonR);
        return true
      }
      return false
    }, that.waitOpt),
    that.page.type('input#filterByNameAllCase', String.fromCharCode(13))
  ])

  console.log(that.person.checkDuplicate)

  // await that.page.waitForTimeout(100000)
}