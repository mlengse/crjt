exports._handleDuplicate = async ({ that }) => {
  // console.log(!that.person.validnik, that.person.validnik, that.person.nik)

  that.person.checkDuplicate && that.spinner.succeed(`duplikasi ${that.person.checkDuplicate.error} ${that.person.checkDuplicate.message}`);
  
  !that.person.validnik && that.spinner.succeed(`tak ada NIK ${that.person.nik} ${that.person.nama}`)
}