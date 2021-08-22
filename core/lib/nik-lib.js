exports._handleNIK = async ({ that }) => {
  that.spinner.fail(`nik sudah ada ${that.person.checkNIK.error} ${that.person.checkNIK.message}`)
}