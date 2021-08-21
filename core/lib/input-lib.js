// const EventEmitter = require('events');
// class MyEmitter extends EventEmitter {}

// exports.myEmitter = new MyEmitter();

exports._inputCorJat = async ({ that }) => {
  
  // that.myEmitter.on('reload', () => {
  //   that.myEmitter.removeListener('reload', () => {})
  //   throw new Error('need reload')
  // })

  try{
    that.response = false
    // that.spinner.start(`input corjat ${person.nama}`)
    // person = await that.upsertPerson({ person })
  
    that.spinner.start(`input corjat ${that.person.nik} ${that.person.nama}`)
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

    // let formTambah = await that.page.$('form#tambah')
  
    // if(!formTambah){
    
    // }
  
    if(!that.person.checkNIK || (that.person.checkNIK && !that.person.checkNIK.error) || !that.person.checkDuplicate){
    
      await that.page.evaluate( nik => document.getElementById("nik").value = nik, that.person.nik)
    
      // await that.page.type('input#nik', person.nik)
    
      await Promise.all([
        that.page.waitForResponse(async response => {
          if(response.url().includes(`check-nik?nik=${that.person.nik}`)){
            that.person.checkNIK = await response.json()
            return true
          }
          return false
        }),
        that.find$AndClick({ $: 'button#cek-nik'}),

      ])
  
    }
    
    if((that.person.checkNIK && that.person.checkNIK.error) || (that.person.checkDuplicate)){
      // await that.upsertPerson({ person })
      that.person.checkDuplicate && that.spinner.fail(`${that.person.checkDuplicate.error} ${that.person.checkDuplicate.message}`)
      that.person.checkNIK.error && that.spinner.fail(`${that.person.checkNIK.error} ${that.person.checkNIK.message}`)
    } 
    if(!that.person.checkNIK || (that.person.checkNIK && !that.person.checkNIK.error && !Array.isArray(that.person.checkNIK))) {
      that.spinner.succeed(`input ${that.person.nama}`)
  
  
      notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
      if(notifWall){
        that.spinner.succeed('aku opo kae')
        await Promise.all([
          that.clickBtn({
            text: 'OK'
          }),
        ])
      }
    

      // await that.page.waitForTimeout(100)
  
      await that.inputIfNoVal({ 
        selector: '#name',
        val: that.person.nama
      })
  
      await that.inputIfNoVal({ 
        selector: '#birth_date',
        val: that.convertFromAAR2CJ(that.person.tanggal_lahir)
      })
  
      if(!that.person.no_telp_handphone || that.person.no_telp_handphone.split('').filter(e=>e !== '0').length < 5 ){
        that.person.no_telp_handphone = that.config.PHONE
      }
  
      await that.inputIfNoVal({
        selector: '#phone_number',
        val: that.person.no_telp_handphone
      })
  
      await that.selectChoice({
        val: that.person.jenis_kelamin || that.person.capil_sex || 'L',
        choice: {
          L: "#sexL",
          P: "#sexP"
        }
      })
  
      // await that.typeAndSelect({
      //   selector: 'span.select2-container[data-select2-id="2239"]',
      //   val: that.person.checkNIK && that.person.checkNIK['capil_job '] ? that.person.checkNIK['capil_job '] : 'tidak tahu'
      // })
      await that.jqSelect({
        sel: '#job',
        val: that.person.checkNIK && that.person.checkNIK['capil_job '] ? that.person.checkNIK['capil_job '] : 'tidak tahu'
      })

      if(that.person.provinsi_domisili !== 'JAWA TENGAH'){
        await Promise.all([
          that.jqSelect({
            sel: '#province_id',
            val: that.person.provinsi_domisili
          }),
          // await that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=kab&id='))
          that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=kab&id='))
    
        ])
  
      }
  
  
      // await that.jqSelect({
      //   sel: '#province_id',
      //   val: that.person.provinsi_domisili
      // })
      await Promise.all([
        that.jqSelect({
          sel: '#district_id',
          val: that.person.kabupaten_domisili
        }),
        // await that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=kab&id='))
        that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=kec&id='))
  
      ])

      await Promise.all([
        that.jqSelect({
          sel: '#sub_district_id',
          val: that.person.kecamatan_domisili
        }),

        that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=desa&id='))
  
      ])

      await that.jqSelect({
        sel: '#village_id',
        val: that.person.desa_kelurahan_domisili
      })
  
      if(!that.person.checkNIK.capil_prov_id){
        await Promise.all([
          that.page.evaluate( prov => document.getElementById("ktp_province_id").value = prov, that.person.provinsi_domisili),
          // await that.page.type('#ktp_province_id', that.person.provinsi_domisili)
          that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=kab&id='))
  
        ])
      }
  
      if(!that.person.checkNIK.capil_kab_id){
        await Promise.all([
          that.page.evaluate( kab => document.getElementById("ktp_district_id").value = kab, kabupaten_domisili),
          // await that.page.type('#ktp_district_id', kabupaten_domisili)
          that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=kec&id='))
  
        ])
      }
  
      if(!that.person.checkNIK.capil_kec_id){
        await Promise.all([
          that.page.evaluate( kec => document.getElementById("ktp_sub_district_id").value = kec, that.person.kecamatan_domisili),
          // await that.page.type('#ktp_sub_district_id', that.person.kecamatan_domisili)
          that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=desa&id='))
  
        ])
      }
  
      if(!that.person.checkNIK.capil_kel){
        await that.page.evaluate( des => document.getElementById("ktp_village_id").value = des, that.person.desa_kelurahan_domisili)
        // await that.page.type('#ktp_village_id', that.person.desa_kelurahan_domisili)
      }

      if(!that.person.checkNIK.capil_rt){
        await that.page.evaluate( () => document.getElementById("ktp_rt").value = '1')
      }
      if(!that.person.checkNIK.capil_rw){
        await that.page.evaluate( () => document.getElementById("ktp_rw").value = "1")
      }
  
  
      if(!that.person.checkDuplicate){
        if(that.person.rt === '0'){
          that.person.rt = '1'
        }
  
        if(that.person.rw === '0'){
          that.person.rw = '1'
        }
    
        await that.page.evaluate( () => document.getElementById("rt").value = "")
        await that.page.type('#rt', that.person.rt)
        await that.page.evaluate( () => document.getElementById("rw").value = "")
        await that.page.type('#rw', that.person.rw)
        await that.page.evaluate( () => document.getElementById("address").value = "")
        await that.page.type('#address', that.person.alamat_domisili)
    
        await that.page.evaluate( () => document.getElementById("common_condition").value = "")
        await that.page.type('#common_condition', 'baik')
        await that.page.evaluate( () => document.getElementById("treatment").value = "")
        await that.page.type('#treatment', 'isolasi')
        await that.page.$eval('#tgl_lapor', (e, tgl ) => $(e).val(tgl),  that.convertFromAAR2CJ(that.person.tanggal_pemeriksaan))
    
        // await that.find$AndClick({ $: })
    
        await that.jqSelect({
          sel: '#status_id',
          val: that.person.hasil_pemeriksaan === 'POSITIF' ? 'terkonfirmasi' : that.person.tujuan_pemeriksaan === 'SKRINING' ? 'screening' : that.person.tujuan_pemeriksaan
        })
    
        // await that.typeAndSelect({
        //   selector: 'span.select2-container[data-select2-id="2255"]',
        //   val: person.tujuan_pemeriksaan === 'SKRINING' ? 'screening' : person.tujuan_pemeriksaan
        // })
  
        await that.waitFor({ selector: 'select#swab_type'})
    
        await that.page.select('select#swab_type', '2')
        // await that.page.waitForTimeout(100)
    
        if(that.person.hasil_pemeriksaan === 'POSITIF') {
          await that.find$AndClick({ $: '#resultPositif'})
    
        } else {
          await that.find$AndClick({ $: '#resultNegatif'})
        }
    
        await that.clickBtn({ text: 'Pilih'})
    
        await that.find$AndClick({ $: 'button[data-value="B"]'})
    
        await that.page.waitForTimeout(100)
        notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
        if(notifWall){
          that.spinner.succeed('di sinikah?')
          // console.log('ada')
          await that.clickBtn({
            text: 'OK'
          })
        }
    
        // await that.page.waitForTimeout(100)
    
        // notifWall = false
        // while(!notifWall){
        //   await that.page.waitForTimeout(100)
        //   notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
        //   if(notifWall){
        //     console.log('ada')
        //     await that.clickBtn({
        //       text: 'OK'
        //     })
        //   }
    
        // }
    
        await that.page.$eval('#test_date_rdt', (e, tgl ) => $(e).val(tgl),  that.convertFromAAR2CJ(that.person.tanggal_pemeriksaan))
        if(that.person.status_pembiayaan.toLowerCase().includes('tidak')) {
          await that.find$AndClick({ $: '#paymentTidakBerbayar'})
        } else {
          await that.find$AndClick({ $: '#paymentBerbayar'})
        }
    
        await that.page.evaluate( () => document.getElementById("speciment_code_rdt").value = "")
        if(!that.person.nomor_spesimen) {
          that.person.nomor_spesimen = that.unixTime()
        }
    
        await that.page.type('#speciment_code_rdt', that.person.nomor_spesimen)
    
        await that.jqSelect({
          sel: '#purpose-rdt',
          val: that.person.tujuan_pemeriksaan  === 'SKRINING' ? 'Alasan lain' : that.person.tujuan_pemeriksaan
        })
    
        await that.page.evaluate( () => document.getElementById("swab_period_rdt").value = "")
        await that.page.type('#swab_period_rdt', '1')
  
        if(that.response !== 'duplikasi') {
          !that.response && await Promise.all([
            that.clickBtn({ text: 'Simpan'}),
            that.mengcovid(),
            that.page.waitForResponse(response => response.url().toLowerCase().includes('odp'), {
              timeout:10000
            })
          ])

          await that.page.waitForTimeout(1000)
      
          notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
          if(notifWall){
            await that.clickBtn({
              text: 'OK'
            })
          }
      
  
        }
  
  
      }
  
  
  
    }
    // that.person = await that.upsertPerson({ person })
  
  }catch(e){
    that.spinner.fail(`${new Date()} ${JSON.stringify(that.person)}`)
    that.spinner.fail(`${new Date()} ${JSON.stringify(e)}`)
    if(JSON.stringify(e).includes('TIMED') || JSON.stringify(e).includes('Timeout') || JSON.stringify(e).includes('reload')){
      // await that.page.reload()
      return await that.inputCorJat()
    }
  }
 
}

exports._closeWarning = async ({ that, response }) => {
  response.error && that.spinner.fail(`${response.error} ${response.message}`)

  await that.page.waitForTimeout(500)

  let notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
  if(notifWall){
    await that.clickBtn({
      text: 'OK'
    })
  }

}

exports._mengcovid = async ({ that }) => {
  await that.page.waitForTimeout(100)
  let visible = false
  for(let el of await that.page.$x(`//button[contains(., "Iya")]`)){
    await that.page.evaluate(e => {
      e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    }, el);
    visible = await that.isVisible({ el })
    if(visible){
      // await el.focus()
      await el.evaluate( el => el.click())
      break
    }
  }

  await that.page.waitForTimeout(100)
  
}
