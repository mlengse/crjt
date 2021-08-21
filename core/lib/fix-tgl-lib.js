exports._fixTglLahir = async ({that, person}) => {
  if(!person.tanggal_lahir){
    if(person.tanggal_lahir_dd_mm_yyyy){
      person.tanggal_lahir = person.tanggal_lahir_dd_mm_yyyy
      delete person.tanggal_lahir_dd_mm_yyyy
    }
  }
  if(person.tanggal_lahir && (person.tanggal_lahir.toLowerCase().includes('p') || person.tanggal_lahir.toLowerCase().includes('l'))) {
    if(!person.jenis_kelamin){
      person.jenis_kelamin = person.tanggal_lahir.toUpperCase()
    }
    delete person.tanggal_lahir
  }
  if(!person.tanggal_lahir && person.umur_th && (person.umur_th.trim()).length > 0 ){
    person.tanggal_lahir = that.fixTgl(person.umur_th)
  }
  if(!person.tanggal_lahir){
    let thisYear = new Date().getFullYear().toString().substr(-2);
    let hari = Number(person.nik.substr(6, 2)) > 40 ? Number(person.nik.substr(6, 2)) - 40 : person.nik.substr(6, 2)
    let bulan = person.nik.substr(8, 2)
    let tahun = Number(person.nik.substr(10, 2)) < Number(thisYear) ? "20" + person.nik.substr(10, 2) : "19" + person.nik.substr(10, 2)
    let tglLahir = `${hari}-${bulan}-${tahun}`
    person.tanggal_lahir = that.fixTgl(tglLahir)
  }
  let tgl = that.fixTgl(person.tanggal_lahir)
  if(tgl.includes('date')){
    console.log(person.tanggal_lahir.length, person.tanggal_lahir)
    console.log(person)
  }
  return person

}