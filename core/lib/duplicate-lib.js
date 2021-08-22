exports._handleDuplicate = async ({ that }) => {
  that.spinner.succeed(`duplikasi ${that.person.checkDuplicate.error} ${that.person.checkDuplicate.message}`)
}