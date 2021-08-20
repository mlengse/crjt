exports._inputCorJat = async ({ that, person }) => {
  that.spinner.start(`input corjat ${person.nama}`)
  person = await that.upsertPerson({ person })

  if(person.checkNIK && person.checkNIK.error){
    that.spinner.fail(`${person.checkNIK.error} ${person.checkNIK.message}`)
  } else {
    await that.loginCorJat()

    await that.waitFor({ selector: 'input#nik'})
  
    await that.page.evaluate( () => document.getElementById("nik").value = "")
  
    await that.page.type('input#nik', person.nik)
  
    await Promise.all([
      that.page.waitForResponse(async response => {
        if(response.url().includes(`check-nik?nik=${person.nik}`)){
          person.checkNIK = await response.json()
          return true
        }
        return false
      }),
      that.find$AndClick({ $: 'button#cek-nik'})
    ])
  
    if(person.checkNIK && person.checkNIK.error){
      await that.upsertPerson({ person })
      that.spinner.fail(`${person.checkNIK.error} ${person.checkNIK.message}`)
    } else {
      that.spinner.succeed(`${JSON.stringify(person.checkNIK)}`)
    }
  
    let notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
    if(notifWall){
      await that.clickBtn({
        text: 'OK'
      })
    }

  }


}