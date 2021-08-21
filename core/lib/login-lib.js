exports._loginCorJat = async ({ that }) => {
  if(!that.page) {
    await that.initBrowser()
  }
  
  let needLogin = await that.page.$('input#username')

  if(needLogin) {
    that.spinner.start('login corona jateng')
    await that.page.type('input#username', that.config.CORJAT_USER)
    await that.page.type('input#password', that.config.CORJAT_PASSWORD, { delay: 100 })
    await that.page.focus('input#captcha-input')
  
    let inpVal = await that.page.evaluate(() => document.getElementById('captcha-input').value)
    while(!inpVal || inpVal.length < 4){
      await that.page.waitForTimeout(100)
      inpVal = await that.page.evaluate(() => document.getElementById('captcha-input').value)
    }
  
    let loginDone = await Promise.all([
      that.page.waitForNavigation(that.waitOpt),
      that.page.type('input#captcha-input', String.fromCharCode(13)),
      that.page.click('button.btn.btn-primary.btn-block.btn-lg.btn-submit[type="submit"]', {delay: 500}),
    ]);

    loginDone && that.spinner.succeed('logged in corona jateng')

    await that.page.goto(`${that.config.CORJAT_URL}`, that.waitOpt)
  }



}

