exports._handleNIK = async ({ that }) => {
  that.spinner.succeed(`nik sudah ada ${that.person.checkNIK.error} ${that.person.checkNIK.message}`)
}