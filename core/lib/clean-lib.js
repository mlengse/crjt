exports._cleanData = async ({ that }) => {
  that.spinner.succeed(`total data ${Object.keys(that.people).length}`)

  for(let [id, nik] of Object.entries(Object.keys(that.people))){
    let person = that.people[nik]

    person = await that.fixTglLahir({person})

    if(!person.no_telp_handphone || person.no_telp_handphone.split('').filter(e=>e !== '0').length < 5 ){
      person.no_telp_handphone = that.config.PHONE
    }
    person.no_telp_handphone = person.no_telp_handphone.split('O').join('0').replace(/[^0-9\.]+/g, '');
    // person.no_telp_handphone !== that.config.PHONE && console.log(person.no_telp_handphone)

    if(!person.jenis_kelamin && person.jenis_kelamin__l_p){
      person.jenis_kelamin = person.jenis_kelamin__l_p
      delete person.jenis_kelamin__l_p
    }
    if(!person.jenis_kelamin){
      person.jenis_kelamin = Number(person.nik[6]) > 3 ? 'P' : 'L'    
      // console.log(person)
    }

    if(!person.provinsi_domisili){
      person.provinsi_domisili = 'JAWA TENGAH'
    }

    if(!person.kabupaten_domisili){
      person.kabupaten_domisili = that.config.KOTA
    }

    if(!person.kecamatan_domisili){
      person.kecamatan_domisili = that.config.KEC
    }

    if(!person.desa_kelurahan_domisili){
      person.desa_kelurahan_domisili = that.config.KEL
    }

    if(!person.alamat_domisili){
      if(person.alamat_tinggal_domisili){
        person.alamat_domisili = person.alamat_tinggal_domisili
        delete person.alamat_tinggal_domisili
      } else if(person.alamat_tinggal_domisii){
        person.alamat_domisili = person.alamat_tinggal_domisii
        delete person.alamat_tinggal_domisii
      } else if(person.alamat_ktp){
        person.alamat_domisili = person.alamat_ktp
      }
      if(!person.alamat_domisili){
        console.log(person)
      }
    }

    if(!person.alamat_ktp){
      if(person.alamat_domisili){
        person.alamat_ktp = person.alamat_domisili
      }
      if(!person.alamat_ktp){
        console.log(person)
      }
    }

    if(!person.tanggal_pemeriksaan){
      if(person.tanggal_hasil_pemeriksaan){
        person.tanggal_pemeriksaan = person.tanggal_hasil_pemeriksaan
        delete person.tanggal_hasil_pemeriksaan
      } else if(person.tgl_hasil_pemeriksaan){
        person.tanggal_pemeriksaan = person.tgl_hasil_pemeriksaan
        delete person.tgl_hasil_pemeriksaan
      }

      if(!person.tanggal_pemeriksaan && person.tanggal){
        person.tanggal_pemeriksaan = person.tanggal
        // console.log(person)
        if(!person.tanggal_pemeriksaan){
          console.log(person)
        }
  
      }
    }

    if(person.tanggal_pemeriksaan.toLowerCase().includes('negatif')){
      if(!person.hasil_pemeriksaan){
        person.hasil_pemeriksaan = person.tanggal_pemeriksaan
      }
      delete person.tanggal_pemeriksaan
      console.log(person)
    }

    let tgl = that.fixTgl(person.tanggal_pemeriksaan)
    if(tgl.includes('date')){
      console.log('tgl periksa', person.tanggal_pemeriksaan.length, person.tanggal_pemeriksaan)
      console.log(person)
    }

    person.tanggal_pemeriksaan = tgl

    if(!person.hasil_pemeriksaan || (person.hasil_pemeriksaan && person.hasil_pemeriksaan.toLowerCase() !== 'positif' && person.hasil_pemeriksaan.toLowerCase() !== 'negatif')){
      if(person.hasil_pemeriksaan_spesimen){
        person.hasil_pemeriksaan = person.hasil_pemeriksaan_spesimen.toUpperCase()
        delete person.hasil_pemeriksaan_spesimen
      }

      if(!person.hasil_pemeriksaan || (person.hasil_pemeriksaan && person.hasil_pemeriksaan.toLowerCase() !== 'positif' && person.hasil_pemeriksaan.toLowerCase() !== 'negatif')){
        if(person.hasil_pemeriksaan && (person.hasil_pemeriksaan.includes('MANDIRI') || person.hasil_pemeriksaan.includes('DATANG') || person.hasil_pemeriksaan.includes('DOMISILI'))){
          delete that.people[nik]
        } else if(person.hasil_pemeriksaan && person.hasil_pemeriksaan.toLowerCase().includes('tif')){
          if(person.hasil_pemeriksaan.toLowerCase().includes('p')){
            person.hasil_pemeriksaan = 'POSITIF'
          } else 
          if(person.hasil_pemeriksaan.toLowerCase().includes('n')){
            person.hasil_pemeriksaan = 'NEGATIF'
          } else {
            // console.log(person)
          }
          
        } else if(person.hasil_pemeriksaan && person.hasil_pemeriksaan.length < 3) {
          delete that.people[nik]
        } 
      }
      if(!person.hasil_pemeriksaan){
        delete that.people[nik]
      }

      Object.keys(person).map( prop => {
        if(!person.nomor_spesimen && prop.includes('spes')){
          person.nomor_spesimen = person[prop]
        }
        if(!person.tujuan_pemeriksaan && prop.includes('erat')){
          person.tujuan_pemeriksaan = person[prop]
        }
      })

      if(person.hasil_pemeriksaan 
        && person.hasil_pemeriksaan.toLowerCase().includes('tif') 
        && person.hasil_pemeriksaan.toLowerCase().includes('p'))
        {
          person.isKonfirm = true
        }

      if(that.people[nik]){
        that.people[nik] = person
      }

    }


    
    // that.spinner.succeed(`${Object.keys(person)}`)


  }

}