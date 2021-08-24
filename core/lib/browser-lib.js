const pptr = require('puppeteer-core')
exports._initBrowser = async ({ that }) => {

  try{
    if(!that.page){
      if(!that.Browser) {
        that.Browser = await pptr.launch(that.config.pptrOpt)
      }
      that.pages = await that.Browser.pages()
      that.page = that.pages[0]
    }
    if(that.page){
      that.page.on('requestfailed', async request => {
        if(request.failure() 
        && (
          !JSON.stringify(request.failure()).includes('ABORT')
          || !JSON.stringify(request.failure()).includes('ERR_EMPTY')
          
        )) {
          that.spinner.fail(`${request.url()} ${JSON.stringify(request.failure())}`)
          // throw new Error('reload')
        }
      })
      that.page.on('response', async response => {
        that.response = ''
        if(!response.ok()) {
          that.response = `${response.url()} ${response.status()} ${response.statusText()}`
          that.spinner.fail(that.response)
          await that.closeWarning({response: that.response})
          // console.log('dari response not ok')
          if(typeof that.response === 'String' && that.response.includes('500 Internal')){
            throw new Error('reload')
          }
          if(typeof that.response === 'String' && that.response.includes('Unprocessable')){
            throw new Error('reload')
          }
        }
        if(response.request().resourceType() === 'xhr' ){
          if(response.headers()['content-type'].includes('json')) {
            let resp = await response.json()
            if(resp.error &&  response.url().includes('dupl')){
              that.response = resp
              await that.closeWarning({response: that.response})
              // console.log('dari resp dupl')
            }
          } else if(response.headers()['content-type'].includes('html')) {
            that.response = await response.text()
          }
        }
        return
      })
      
      await that.page.goto(`${that.config.CORJAT_URL}`, that.waitOpt)
    }
  }catch(e){
    throw new Error('reload')

  }
}