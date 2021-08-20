const pptr = require('puppeteer-core')
exports.waitOpt = {
  waitUntil: 'networkidle0',
  timeout: 0
}

exports._clickBtn = async({ that, text}) => await that.findXPathAndClick({xpath: `//button[contains(., '${text}')]`});
exports._isVisible = async ({ that, el }) => {
  return await that.page.evaluate( elem => {
    if (!(elem instanceof Element)) return false;
    // if (!(elem instanceof Element)) throw Error('DomUtil: elem is not an element.');
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

exports._inputIfNoVal = async ({ that, selector, val }) => {
  await that.waitFor({ selector })

  let existVal = await that.page.$eval( selector, e => $(e).val())
  if(!existVal){
    await that.page.$eval( selector, (e, val) => $(e).val(val), val)
  }
  // console.log(existVal)
}

exports._selectChoice =  async ({ that, val, choice }) => {

  for(let c of Object.keys(choice)){
    await that.waitFor({
      selector: choice[c]
    })

  }

  await that.page.$eval( choice[val], e => $(e).prop('checked', true))
}

exports._jqSelect = async ({ that, sel, val, id }) => {
  if(id){
    await that.page.evaluate(( sel, id ) => $(sel).val(id).change(), sel, id)
    that.spinner.succeed('iki swab ag')
  } else {
    let options

    while(!options || options.length < 2){
      await that.page.waitForTimeout(100)
      options = await that.page.evaluate( (sel, val) => {
        return $(sel).find('option').get().map( e => ({
          val: e.getAttribute('value'),
          text: e.innerText
        }))
        // $(sel).val($(sel).find("option:contains('"+val+"')").val()).trigger('change')
      }, sel, val)
    }
    
    option = options.filter( e => e.text.toLowerCase().includes(val.toLowerCase()) && !e.text.toLowerCase().includes('dirawat'))
  
    // that.spinner.succeed(`val ${val} options: ${options.map(e => e.text)}`)
  
    if(option.length){
      await that.page.evaluate( (sel, val) => $(sel).val(val).trigger('change'), sel, option[0].val)
    } else {
      await that.page.evaluate( (sel, val) => $(sel).val(val).trigger('change'), sel, options[0].val)
    }
    
  
  }

  await that.page.waitForTimeout(500)

}

exports._typeAndSelect = async ({ that, selector, val }) => {

  // that.spinner.succeed(`type and select ${selector} ${val}`)

  await that.waitFor({ selector })

  // that.spinner.succeed(`waitFor ${selector}`)

  // await that.find$AndClick({ $: selector })

  // that.spinner.succeed(`find$AndClick ${selector}`)

  await that.page.focus(selector)
  await that.page.click(selector)
  await that.page.waitForTimeout(500)

  // await that.page.focus('input.select2-search__field')
  // await that.page.click('input.select2-search__field')

  // await that.find$AndClick({ $: 'input.select2-search__field'})

  // await that.page.waitForTimeout(500)

  let ada

  let hrfs = val.split('')

  while(hrfs.length){
    hrf = hrfs.shift()
    await that.page.type('input.select2-search__field', hrf, { delay: 100})
    let els = await that.page.$$('span.select2-results > ul > li')
    if(els.length) for(let el of els){
      ada = await that.page.evaluate( el => el.innerText, el)
      if(ada.toLowerCase().includes(val.toLowerCase()) && !ada.toLowerCase().includes('dirawat') ){
        console.log(ada)
        hrfs = []
        await el.focus()
        await el.click()
      }
    }
  }

  that.spinner.succeed(`type and select ${selector} ${val}`)

}

exports._find$AndClick = async ({ that, $ }) => {
  // that.spinner.start(`findXPathAndClick ${xpath}`)
  let visible = false
  while(!visible){
    for(let el of await that.page.$$($)){
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

exports._waitFor = async({ that, selector}) => {
  let el = await that.page.$(selector)
  while(!el){
    await that.page.waitForTimeout(100)
    el = await that.page.$(selector)
  }
  await that.page.waitForTimeout(500)

  // that.spinner.succeed(`${selector} found`)

  // return el

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

    // that.page.on('response', async response => {
    //   if(response.request().resourceType() === 'xhr'){
    //     if(response.headers()['content-type'].includes('json')) {
    //       that.response = await response.json()
    //     } else if(response.headers()['content-type'].includes('html')) {
    //       that.response = await response.text()
    //     }
    //   }
    // })
    
    await that.page.goto(`${that.config.CORJAT_URL}`, that.waitOpt)
    
  }




}