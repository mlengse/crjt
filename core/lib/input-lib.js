exports._inputCorJat = async ({ that, person }) => {
  that.spinner.start(`input corjat ${person.nama}`)
  person = await that.upsertPerson({ person })

  await that.loginCorJat()

  let formTambah = await that.page.$('form#tambah')

  if(!formTambah){
    let notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
    if(notifWall){
      await that.clickBtn({
        text: 'OK'
      })
    }
  
    await that.clickBtn({ text: 'Tambah Kasus'})
  
    await that.findXPathAndClick({ xpath: '//a[contains(., "WNI")]'})
  
    await that.waitFor({ selector: 'input#nik'})
  
  }

  if(!person.checkNIK || (person.checkNIK && !person.checkNIK.error)){
  
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

  }
  
  if(person.checkNIK && person.checkNIK.error){
    await that.upsertPerson({ person })
    that.spinner.fail(`${person.checkNIK.error} ${person.checkNIK.message}`)
  } 

  let notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
  if(notifWall){
    await that.clickBtn({
      text: 'OK'
    })
  }


  if(!person.checkNIK || (person.checkNIK && !person.checkNIK.error)) {
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

    if(!person.no_telp_handphone || person.no_telp_handphone.includes('00000000')){
      person.no_telp_handphone = '082226059060'
    }

    await that.inputIfNoVal({
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

    // await that.typeAndSelect({
    //   selector: 'span.select2-container[data-select2-id="2239"]',
    //   val: person.checkNIK && person.checkNIK['capil_job '] ? person.checkNIK['capil_job '] : 'tidak tahu'
    // })
    await that.jqSelect({
      sel: '#job',
      val: person.checkNIK && person.checkNIK['capil_job '] ? person.checkNIK['capil_job '] : 'tidak tahu'
    })

    await that.jqSelect({
      sel: '#province_id',
      val: person.provinsi_domisili
    })
    await that.jqSelect({
      sel: '#district_id',
      val: person.kabupaten_domisili
    })
    await that.jqSelect({
      sel: '#sub_district_id',
      val: person.kecamatan_domisili
    })
    await that.jqSelect({
      sel: '#village_id',
      val: person.desa_kelurahan_domisili
    })


    await that.jqSelect({
      sel: '#ktp_village_id',
      val: person.checkNIK.capil_kel
    })


    await that.page.evaluate( () => document.getElementById("rt").value = "")
    await that.page.type('#rt', person.rt)
    await that.page.evaluate( () => document.getElementById("rw").value = "")
    await that.page.type('#rw', person.rw)
    await that.page.evaluate( () => document.getElementById("address").value = "")
    await that.page.type('#address', person.alamat_domisili)

    if(person.checkNIK === []){

    }

    await that.page.evaluate( () => document.getElementById("common_condition").value = "")
    await that.page.type('#common_condition', 'baik')
    await that.page.evaluate( () => document.getElementById("treatment").value = "")
    await that.page.type('#treatment', 'isolasi')
    await that.page.$eval('#tgl_lapor', (e, tgl ) => $(e).val(tgl),  that.convertFromAAR2CJ(person.tanggal_pemeriksaan))

    // await that.find$AndClick({ $: })

    await that.jqSelect({
      sel: '#status_id',
      val: person.tujuan_pemeriksaan === 'SKRINING' ? 'screening' : person.tujuan_pemeriksaan
    })

    // await that.typeAndSelect({
    //   selector: 'span.select2-container[data-select2-id="2255"]',
    //   val: person.tujuan_pemeriksaan === 'SKRINING' ? 'screening' : person.tujuan_pemeriksaan
    // })
    
    await that.waitFor({ selector: 'select#swab_type'})

    await that.page.select('select#swab_type', '2')
    await that.page.waitForTimeout(500)


    await that.clickBtn({ text: 'Pilih'})

    await that.find$AndClick({ $: 'button[data-value="B"]'})

    await that.page.$eval('#test_date_rdt', (e, tgl ) => $(e).val(tgl),  that.convertFromAAR2CJ(person.tanggal_pemeriksaan))

    if(person.hasil_pemeriksaan === 'POSITIF') {
      await that.find$AndClick({ $: '#resultPositif'})
    } else {
      await that.find$AndClick({ $: '#resultNegatif'})
    }

    if(person.status_pembiayaan.toLowerCase().includes('tidak')) {
      await that.find$AndClick({ $: '#paymentTidakBerbayar'})
    } else {
      await that.find$AndClick({ $: '#paymentBerbayar'})
    }

    await that.page.evaluate( () => document.getElementById("speciment_code_rdt").value = "")
    if(!person.nomor_spesimen) {
      person.nomor_spesimen = that.unixTime()
    }

    await that.page.type('#speciment_code_rdt', person.nomor_spesimen)

    await that.jqSelect({
      sel: '#purpose-rdt',
      val: person.tujuan_pemeriksaan  === 'SKRINING' ? 'Alasan lain' : person.tujuan_pemeriksaan
    })

    await that.page.evaluate( () => document.getElementById("swab_period_rdt").value = "")
    await that.page.type('#swab_period_rdt', '1')

    await Promise.all([
      that.clickBtn({ text: 'Simpan'}),
      that.page.waitForResponse(response => response.url().toLowerCase().includes('odp'))
    ])

    // await that.page.waitForTimeout(5000)

    let notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
    if(notifWall){
      await that.clickBtn({
        text: 'OK'
      })
    }
  }
  
}