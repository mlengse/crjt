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
      that.spinner.succeed(`${JSON.stringify(person)}`)

      await that.page.waitForTimeout(500)

      await that.inputIfNoVal({ 
        selector: '#name',
        val: person.nama
      })

      await that.inputIfNoVal({ 
        selector: '#birth_date',
        val: that.convertFromAAR2CJ(person.tanggal_lahir)
      })

      person.no_telp_handphone && await that.inputIfNoVal({
        selector: '#phone_number',
        val: person.no_telp_handphone
      })

      await that.selectChoice({
        val: person.jenis_kelamin,
        choice: {
          L: "#sexL",
          P: "#sexP"
        }
      })

      person.checkNIK && person.checkNIK.capil_job && await that.typeAndSelect({
        selector: '#select2-job-container',
        val: person.checkNIK.capil_job
      })

    }
  
    let notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
    if(notifWall){
      await that.clickBtn({
        text: 'OK'
      })
    }

  }


}