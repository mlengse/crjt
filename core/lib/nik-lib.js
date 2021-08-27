exports._handleNIK = async ({ that }) => {
  if(!(that.person.checkNIK.message.toLowerCase().includes('terkonfirmasi') && that.person.checkNIK.message.toLowerCase().includes('sembuh') && that.person.checkNIK.message.toLowerCase().includes(that.config.CORJAT_USER))){
    that.spinner.succeed(`need TL ${that.person.checkNIK.error} ${that.person.checkNIK.message}`)
  } else {
    // that.spinner.succeed(`nik sudah ada ${that.person.checkNIK.error} ${that.person.checkNIK.message}`)
  }
}

exports._checkNIK = async ({ that }) => {
  let lastDig = that.person.nik.substring(15)
  // console.log(lastDig, that.person.nik)

  while( Number(lastDig) < 9 && (!that.person.checkNIK || (Array.isArray(that.person.checkNIK) && !that.person.checkNIK.error))){
    lastDig = Number(lastDig)+1
    that.person.nik = `${that.person.nik.substring(0,15)}${lastDig}`
    that.spinner.start(`start check NIK ${that.person.nama} ${that.person.nik}`)
    let notifWall
    await that.loginCorJat()
    let inputNIK = await that.page.$('input#nik')
    if(!inputNIK){
      notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
      if(notifWall){
        await that.clickBtn({
          text: 'OK'
        })
      }
      await that.clickBtn({ text: 'Tambah Kasus'})
      await that.findXPathAndClick({ xpath: '//a[contains(., "WNI")]'})
      await that.waitFor({ selector: 'input#nik'})
    }
    await that.page.evaluate( nik => document.getElementById("nik").value = nik, that.person.nik)
    await Promise.all([
      that.page.waitForResponse(async response => {
        if(response.url().includes(`check-nik`) && response.request().postData().includes(that.person.nik)){
          that.person.checkNIK = await response.json()
          return true
        }
        return false
      }),
      that.find$AndClick({ $: 'button#cek-nik'}),
    ])
  
    await that.closeWarning()
  
    that.spinner.succeed(`${Number(lastDig) < 9 && (!that.person.checkNIK || (Array.isArray(that.person.checkNIK) && !that.person.checkNIK.error))} ${lastDig}, ${that.person.nik}, ${JSON.stringify(that.person.checkNIK)}`)
  }

  if(that.person.checkNIK && !Array.isArray(that.person.checkNIK) && !that.person.checkNIK.error){
    // that.spinner.start('reinput')
    that.person.validnik = that.person.nik
    that.person.checkDuplicate = false
    // await that.inputCorJat()
  }


}