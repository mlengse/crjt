exports._handleNIK = async ({ that }) => {
  if(!(that.person.checkNIK.message.toLowerCase().includes('terkonfirmasi') && that.person.checkNIK.message.toLowerCase().includes('sembuh') && that.person.checkNIK.message.toLowerCase().includes(that.config.CORJAT_USER))){
    that.spinner.succeed(`need TL ${that.person.checkNIK.error} ${that.person.checkNIK.message}`)
  } else {
    // that.spinner.succeed(`nik sudah ada ${that.person.checkNIK.error} ${that.person.checkNIK.message}`)
  }
}