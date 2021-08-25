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
    await that.page.evaluate( (e, val) => {
      $(e).val(val)
    }, selector, val)
  }
}

exports._selectChoice =  async ({ that, val, choice }) => {
  that.spinner.start(`selectChoice ${val}`)
  await that.waitFor({ selector: choice[val.toUpperCase()]})
  await that.page.$eval( choice[val.toUpperCase()], e => $(e).prop('checked', true))
}

exports._jqSelect = async ({ that, sel, val, id }) => {
  that.spinner.start(`jqSelect ${sel} ${val ? `val ${val}` : id ? `id ${id}` : 'null'}`)
  if(id){
    await that.page.evaluate(( sel, id ) => $(sel).val(id).change(), sel, id)
    await that.page.select(`select${sel}`, id)
    that.spinner.succeed(`selector ${sel} val ${id}`)
  } else {
    let options
    await that.page.evaluate(e => {
      document.querySelector(e).scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
    }, sel);

    while(!options || options.length < 3){
      // let options = await that.page.evaluate( sel => {
      options = await that.page.evaluate( sel => {
          return $(sel).find('option').get().map( e => ({
            val: e.getAttribute('value'),
            text: e.innerText
          }))
          // $(sel).val($(sel).find("option:contains('"+val+"')").val()).trigger('change')
        }, sel)
        await that.page.waitForTimeout(100)
    }
    
    if(val){
      that.spinner.succeed(`val ${val} options: ${options.length /**map(e => e.text) */}`)
      option = options.filter( e => e 
        && e.text 
        && e.text.toLowerCase().split(' ').join('')
        .split('(').join('')
        .split(')').join('')
        .split('/').join('')
        .includes(
          val.toLowerCase()
          .split(' ').join('')
          .split('(').join('')
          .split(')').join('')
          .split('/').join('')
            ) 
          && !e.text.toLowerCase().includes('dirawat'))
      if(option.length){
        await that.page.evaluate( (sel, val) => $(sel).val(val).trigger('change'), sel, option[0].val)
      } else {
        await that.page.evaluate( (sel, val) => $(sel).val(val).trigger('change'), sel, options[0].val)
      }
    } else {
      that.spinner.succeed(`${JSON.stringify(options[1])}`)
      await that.page.evaluate( (sel, val) => $(sel).val(val).trigger('change'), sel, options[1].val)
    }
    
  
  }

  await that.page.waitForTimeout(100)

}

exports._typeAndSelect = async ({ that, selector, val }) => {

  that.spinner.start(`type and select ${selector} ${val}`)
  await that.waitFor({ selector })
  await that.page.focus(selector)
  await that.page.click(selector)
  await that.page.waitForTimeout(100)

  let ada
  let hrfs = val.split('')
  while(hrfs.length){
    hrf = hrfs.shift()
    await that.page.type('input.select2-search__field', hrf, { delay: 100})
    let els = await that.page.$$('span.select2-results > ul > li')
    if(els.length) for(let el of els){
      ada = await that.page.evaluate( el => el.innerText, el)
      if(ada.toLowerCase().includes(val.toLowerCase()) && !ada.toLowerCase().includes('dirawat') ){
        hrfs = []
        await el.focus()
        await el.click()
      }
    }
  }
  // that.spinner.succeed(`type and select ${selector} ${val}`)
}

exports._find$AndClick = async ({ that, $ }) => {
  that.spinner.start(`find $ and click ${$}`)
  let visible = false
  while(!visible){
    for(let el of await that.page.$$($)){
      await that.page.evaluate(e => {
        e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
      }, el);
      visible = await that.isVisible({ el })
      if(visible){
        await el.evaluate( el => el.click())
        break
      }
    }

    await that.page.waitForTimeout(100)
  
  }
  await that.page.waitForTimeout(100)

}

exports._waitFor = async({ that, selector}) => {
  let el = await that.page.$(selector)
  while(!el){
    await that.page.waitForTimeout(100)
    el = await that.page.$(selector)
  }
  await that.page.waitForTimeout(100)

  that.spinner.succeed(`${selector} found`)

}


exports._findXPathAndClick = async ({ that, xpath }) => {
  that.spinner.start(`findXPathAndClick ${xpath}`)
  let visible = false
  while(!visible){
    await that.page.waitForTimeout(100)
    for(let el of await that.page.$x(xpath)){
      await that.page.evaluate(e => {
        e.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
      }, el);
      visible = await that.isVisible({ el })
      if(visible){
        await el.evaluate( el => el.click())
        break
      }
    }
  }
  await that.page.waitForTimeout(100)
}

exports._closeWarning = async ({ that, response }) => {
  that.spinner.start('closeWarning')
  response && response.error && that.spinner.fail(`${response.error} ${response.message}`)
  await that.page.waitForTimeout(500)

  let notifWall = await that.page.$('div.swal2-container.swal2-center.swal2-shown')
  if(notifWall){
    let [btn] = await that.page.$x('//button[contains(.,"OK")]')
    if(btn){
      await btn.click()
    }
  }

  if(response && response.error === 'Duplicate') {
    that.person.checkDuplicate = response
  }

}