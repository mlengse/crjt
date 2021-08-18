const pptr = require('puppeteer-core')
const waitOpt = {
  waitUntil: 'networkidle0',
  timeout: 0
}

exports._clickBtn = async({ that, text}) => await that.findXPathAndClick({xpath: `//button[contains(., '${text}')]`});
exports._isVisible = async ({ that, el }) => {
  return await that.page.evaluate( elem => {
    if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
    const style = getComputedStyle(elem);
    if (style.display === 'none') return false;
    if (style.visibility !== 'visible') return false;
    if (style.opacity < 0.1) return false;
    if (elem.offsetWidth + elem.offsetHeight + elem.getBoundingClientRect().height +
        elem.getBoundingClientRect().width === 0) {
        return false;
    }
    const elemCenter   = {
        x: elem.getBoundingClientRect().left + elem.offsetWidth / 2,
        y: elem.getBoundingClientRect().top + elem.offsetHeight / 2
    };
    if (elemCenter.x < 0) return false;
    if (elemCenter.x > (document.documentElement.clientWidth || window.innerWidth)) return false;
    if (elemCenter.y < 0) return false;
    if (elemCenter.y > (document.documentElement.clientHeight || window.innerHeight)) return false;
    let pointContainer = document.elementFromPoint(elemCenter.x, elemCenter.y);
    do {
        if (pointContainer === elem) return true;
    } while (pointContainer = pointContainer.parentNode);
    return false;
  }, el)
}


exports._findXPathAndClick = async ({ that, xpath }) => {
  // that.spinner.start(`findXPathAndClick ${xpath}`)
  let visible = false
  while(!visible){
    for(let el of await that.page.$x(xpath)){
      await that.page.evaluate(e => {
        e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
      }, el);
      visible = await that.isVisible({ el })
      if(visible){
        // await el.focus()
        await el.evaluate( el => el.click())
        break
      }
    }

    await that.page.waitForTimeout(100)
  
  }
  await that.page.waitForTimeout(500)

}

exports._initBrowser = async ({ that }) => {
  if(!that.Browser) {
    that.Browser = await pptr.launch(that.config.pptrOpt)
    that.pages = await that.Browser.pages()
    that.page = that.pages[0]

    that.page.on('response', async response => {
      if(response.request().resourceType() === 'xhr' && response.ok()){
        if(response.request().headers().accept.includes('json')) {
          that.response = await response.json()
        } else if(response.request().headers().accept.includes('html')) {
          that.response = await response.text()
        }
      }
    })
    
    await that.page.goto(`${that.config.CORJAT_URL}`, waitOpt)
    
  }




}