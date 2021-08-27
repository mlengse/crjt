exports._inputCorJat = async ({ that }) => {
  try{
    that.response = false
    that.spinner.start(`input corjat ${that.person.nik} ${that.person.nama}`)
    let notifWall
    await that.loginCorJat()

    // if((!that.person.checkNIK || (that.person.checkNIK && !that.person.checkNIK.error)) && !that.person.checkDuplicate){
      await that.checkNIK()
    // }

    if((that.person.checkNIK && that.person.checkNIK.error) || (that.person.checkDuplicate)){
      that.spinner.succeed('skip input process')
      // await that.upsertPerson({ person })
      // that.person.checkDuplicate && that.spinner.fail(`duplikasi ${that.person.checkDuplicate.error} ${that.person.checkDuplicate.message}`)
      // that.person.checkNIK.error && that.spinner.fail(`nik sudah ada ${that.person.checkNIK.error} ${that.person.checkNIK.message}`)
      return
    } 

    if(!that.person.checkNIK || (that.person.checkNIK && !that.person.checkNIK.error)) {
      that.spinner.succeed(`input lanjut ${that.person.nama}`)
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
  
      !that.person.checkNIK.capil_tgl_lahir && that.person.tanggal_lahir && await that.page.evaluate( tgl => {
        $("#birth_date").val(tgl)
        let regexCalendar = "^(?:(?:31(-)(?:0?[13578]|1[02]))\\1|(?:(?:29|30)(-)(?:0?[1,3-9]|1[0-2])\\2))(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$|^(?:29(-)(?:0?2)\\3(?:(?:(?:1[6-9]|[2-9]\\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\\d|2[0-8])(-)(?:(?:0?[1-9])|(?:1[0-2]))\\4(?:(?:1[6-9]|[2-9]\\d)?\\d{2})$"
        const getAge = date => {
          if (date.match(regexCalendar)) {
            let dateString  = date.match("^(\\d{2})-(\\d{2})-(\\d{4})$")
            let birthday = new Date( dateString[3], dateString[2]-1, dateString[1] );
            let dobMonth= birthday.getMonth()+1;
            let dobDay= birthday.getDate();
            let dobYear= birthday.getFullYear();
    
            let now = new Date
            let nowDay= now.getDate();
            let nowMonth = now.getMonth() + 1;  //jan = 0 so month + 1
            let nowYear= now.getFullYear();
    
            let ageYear = nowYear - dobYear;
            let ageMonth = nowMonth - dobMonth;
            let ageDay = nowDay- dobDay;
            if (ageMonth < 0) {
                ageYear--;
                ageMonth = (12 + ageMonth);
            }
            if (nowDay < dobDay) {
                ageMonth--;
                ageDay = 30 + ageDay;
                if(ageMonth<0){
                    ageYear--;
                    ageMonth+=12;
                }
            }
            ageYear = (ageYear>0)?ageYear:0;
            $('#age_year').val(ageYear)
            $('#age_month').val(ageMonth)
    
          }
  
        }
        getAge(tgl)
      }, that.person.tanggal_lahir)
  
      await that.page.evaluate( tlp => document.getElementById("phone_number").value = tlp, that.person.no_telp_handphone)
  
      !that.person.checkNIK.capil_sex && await that.selectChoice({
        val: that.person.jenis_kelamin ? that.person.jenis_kelamin : 'L',
        choice: {
          L: "#sexL",
          P: "#sexP"
        }
      })
  
      await that.jqSelect({
        sel: '#job',
        val: that.person.checkNIK && that.person.checkNIK['capil_job '] ? that.person.checkNIK['capil_job '] : that.person.pekerjaan ? that.person.pekerjaan : 'tidak tahu'
      })

      if(that.person.provinsi_domisili !== 'JAWA TENGAH'){
        that.spinnner.start('bukan domisili jateng')
        await Promise.all([
          that.jqSelect({
            sel: '#province_id',
            val: that.person.provinsi_domisili
          }),
          that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=kab&id='))
        ])
      }
  
      await Promise.all([
        that.jqSelect({
          sel: '#district_id',
          val: that.person.kabupaten_domisili || that.config.KOTA || that.person.kabupaten_asal_faskes 
        }),
        that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=kec&id='))
      ])

      await Promise.all([
        that.jqSelect({
          sel: '#sub_district_id',
          val: that.person.kecamatan_domisili || that.config.KEC
        }),
        that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=desa&id='))
      ])

      await that.jqSelect({
        sel: '#village_id',
        val: that.person.desa_kelurahan_domisili || that.config.KEL
      })

      if(!that.person.alamat_domisili){
        that.person.alamat_domisili = `alamat ${that.person.desa_kelurahan_domisili} ${that.person.rt}/${that.person.rw}`
      }
      if(!that.person.alamat_ktp ){
        that.person.alamat_ktp = that.person.alamat_domisili
      }

      if(!that.person.checkNIK.capil_kec_id || !that.person.checkNIK.capil_prov_id || !that.person.checkNIK.capil_kel_id || !that.person.checkNIK.capil_kab_id){
        that.spinner.start(`ktp gak lengkap, isi ${that.person.provinsi_domisili}`)
        await Promise.all([
          that.jqSelect({
            sel: '#ktp_province_id',
            val: that.person.provinsi_domisili || 'JAWA TENGAH'
          }),
          that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=kab&id='))
        ])
        that.spinner.start('ktp prop done')
        await Promise.all([
          that.jqSelect({
            sel: '#ktp_district_id',
            val: that.person.kabupaten_domisili || that.config.KOTA || that.person.kabupaten_asal_faskes 
          }),
          that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=kec&id='))
        ])
        that.spinner.start('ktp kab done')
        await Promise.all([
          that.jqSelect({
            sel: '#ktp_sub_district_id',
            val: that.person.kecamatan_domisili || that.config.KEC
          }),
          that.page.waitForResponse(response => response.url().toLowerCase().includes('area?type=desa&id='))
        ])
        that.spinner.start('ktp kec done')
        that.jqSelect({
          sel: '#ktp_village_id',
          val: that.person.desa_kelurahan_domisili || that.config.KEL
        }),
        that.spinner.start('ktp des done')
      }
      if(!that.person.checkNIK.capil_rt){
        await that.page.evaluate( () => document.getElementById("ktp_rt").value = '1')
      }
      if(!that.person.checkNIK.capil_rw){
        await that.page.evaluate( () => document.getElementById("ktp_rw").value = "1")
      }
      if(!that.person.checkDuplicate){
        that.spinner.start('no duplicate, lanjut input')
        if(!that.person.rt || that.person.rt === '0'){
          that.person.rt = '1'
        }
        if(!that.person.rw || that.person.rw === '0'){
          that.person.rw = '1'
        }
        await that.page.evaluate( rt => document.getElementById("rt").value = rt, that.person.rt)
        await that.page.evaluate( rw => document.getElementById("rw").value = rw, that.person.rw)
        await that.page.evaluate( alamat => document.getElementById("address").value = alamat, that.person.alamat_domisili)
        await that.page.evaluate( alamat => document.getElementById("ktp_address").value = alamat, that.person.alamat_ktp)
        await that.page.evaluate( () => document.getElementById("common_condition").value = 'baik')
        await that.page.evaluate( () => document.getElementById("treatment").value = 'isolasi')
        await that.page.$eval('#tgl_lapor', (e, tgl ) => $(e).val(tgl),  that.person.tanggal_pemeriksaan)
        if(that.person.checkDuplicate){
          that.spinner.start('duplikasi, skip input')
          return
        }

        await Promise.all([
          that.jqSelect({
            sel: '#status_id',
            val: that.person.hasil_pemeriksaan === 'POSITIF' ? 'terkonfirmasi' : that.person.tujuan_pemeriksaan && that.person.tujuan_pemeriksaan.toLowerCase().includes('ning') ? 'screening' : that.person.tujuan_pemeriksaan && that.person.tujuan_pemeriksaan.toLowerCase().includes('spe') ? 'Suspe' : 'kontak'
          }),
          that.page.waitForResponse( response => response.ok() && response.url().includes('test-type') )
        ])
        await that.page.waitForTimeout(100)
        await that.jqSelect({
          sel: '#swab_type',
          id: '2'
        })
        if(that.person.checkDuplicate){
          that.spinner.start('duplikasi, skip input')
          return
        }

        if(that.person.hasil_pemeriksaan === 'POSITIF') {
          await that.find$AndClick({ $: '#resultPositif'})
        } else {
          await that.find$AndClick({ $: '#resultNegatif'})
        }
        await that.clickBtn({ text: 'Pilih'})
        await that.clickBtn({ text: 'PILIH B'})
        // await that.find$AndClick({ $: 'button.btn.btn-select-saverity-level[data-value="B"]'})
        await that.page.waitForTimeout(100)
        if(!that.person.checkDuplicate){
          notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
          if(notifWall ){
            that.spinner.start('di sinikah muncul wall cek duplikasi?')
            await that.clickBtn({
              text: 'OK'
            })
          }
          await that.page.evaluate( tgl  => $('#test_date_rdt').val(tgl),  that.person.tanggal_pemeriksaan)
          await that.find$AndClick({ $: '#paymentTidakBerbayar'})
          if(!that.person.nomor_spesimen) {
            that.spinner.start('tidak ada no spesimen')
            that.person.nomor_spesimen = that.unixTime()
          }
          await that.page.evaluate( spec => document.getElementById("speciment_code_rdt").value = spec, that.person.nomor_spesimen)
          await that.jqSelect({
            sel: '#purpose-rdt',
            val: that.person.tujuan_pemeriksaan && that.person.tujuan_pemeriksaan.toLowerCase().includes('ning') ? 'Alasan lain' : that.person.tujuan_pemeriksaan && that.person.tujuan_pemeriksaan.toLowerCase().includes('spe') ? 'Suspe' : 'kontak'
          })
          await that.page.evaluate( () => document.getElementById("swab_period_rdt").value = "")
          await that.page.type('#swab_period_rdt', '1')
          await that.page.waitForTimeout(500)
          if(that.response !== 'duplikasi' || !that.person.checkDuplicate) {
            that.spinner.start('tidak ada duplikasi, lanjut simpan')
            !that.response && await Promise.all([
              that.clickBtn({ text: 'Simpan'}),
              that.mengcovid(),
              that.page.waitForResponse(response => response.url().toLowerCase().includes('odp'), {
                timeout:10000
              })
            ])
            that.person.inputCorjat = true
          } else {
            that.spinner.start('skip input process')
            return
          }
        } else {
          that.spinner.start('duplikasi, skip input')
          return
        }
      }
    }
    await that.closeWarning()
  }catch(e){
    console.error(that.person)
    that.spinner.fail(`${new Date()} ${e}`)
    that.spinner.fail(`${new Date()} ${JSON.stringify(e)}`)
    if(
      `${e}`.includes('TypeError')
    ){
      console.error(e)
      return
    }
    if(
      `${e}`.includes('reload') 
      || `${e}`.includes('failed to find element')
      || `${e}`.includes('ERR_')
      ||JSON.stringify(e).includes('TIMED') 
      || JSON.stringify(e).includes('Timeout') 
      || JSON.stringify(e).includes('reload')
    ){
      console.error(e)
      // await that.page.waitForNavigation(that.waitOpt)
      await that.page.reload()
      return await that.inputCorJat()
    }
  }
 
}

exports._mengcovid = async ({ that }) => {
  that.spinner.start('mengcovidkan')
  await that.page.waitForTimeout(1000)
  let visible = false
  for(let el of await that.page.$x(`//button[contains(., "Ya")]`)){
    await that.page.evaluate(e => {
      e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    }, el);
    visible = await that.isVisible({ el })
    if(visible){
      await el.evaluate( el => el.click())
      that.spinner.succeed(`${that.person.nama} ODP ${that.person.hasil_pemeriksaan} ${that.person.tanggal_pemeriksaan}`)
      break
    }
  }
  for(let el of await that.page.$x(`//button[contains(., "Iya")]`)){
    await that.page.evaluate(e => {
      e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    }, el);
    visible = await that.isVisible({ el })
    if(visible){
      await el.evaluate( el => el.click())
      that.spinner.succeed(`${that.person.nama} POSITIF ${that.person.tanggal_pemeriksaan}`)
      break
    }
  }

  await that.page.waitForTimeout(100)
}
