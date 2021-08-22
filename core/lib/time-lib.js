const moment = require('moment')
moment.locale('id')

let baseDate = moment().format('DD-MM-YYYY')
if(process.env.BASE_DATE){
  baseDate = process.env.BASE_DATE
}

// moment.now = () => +new Date('2021', '2', '28');
exports.unixSrt = tgl => moment(tgl, 'DD-MM-YYYY').format('x')
exports.unixTime = () => moment().format('x')
exports.xTimestamp = () => moment.utc().format('X')
exports.convertFromAAR2CJ = (tgl) => moment(tgl, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY')
exports.fixTgl = tgl => {
  if(tgl.includes('00:00')){
    tgl = moment(tgl, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY')
  }
  if(tgl.includes('.')){
    tgl = tgl.split('.').join('/')
  }
  if(!(tgl.includes('-') && tgl.length === 10)){
    if(tgl.includes('-')){
      if(tgl.split('-')[tgl.split('-').length-2].length === 3){
        tgl = moment(tgl, 'D-MMM-YYYY').format('DD-MM-YYYY')
      } else if(tgl.split('-')[tgl.split('-').length-1].length === 4){
        tgl = moment(tgl, 'D-M-YYYY', true).isValid() ? moment(tgl, 'D-M-YYYY').format('DD-MM-YYYY') : moment(tgl, 'M-D-YYYY').format('DD-MM-YYYY')
      } else {
        console.log(`belum a ${tgl}`)
      }
    } else if(tgl.includes('/')){
      if(tgl.split('/')[tgl.split('/').length-1].length === 4){
        tgl = moment(tgl, 'D/M/YYYY', true).isValid() ? moment(tgl, 'D/M/YYYY').format('DD-MM-YYYY') : moment(tgl, 'M/D/YYYY').format('DD-MM-YYYY') 
      } else if(tgl.split('/')[tgl.split('/').length-1].length === 2){
        tgl = moment(tgl, 'D/M/YY', true).isValid() ? moment(tgl, 'D/M/YY').format('DD-MM-YYYY') : moment(tgl, 'M/D/YY').format('DD-MM-YYYY')
      } else {
        console.log(`belum b ${tgl}`)
      }
    } else if (tgl.includes(' ')){
      tgl = moment(tgl, 'D MMMM YYYY').format('DD-MM-YYYY')
    } else {
      tgl = 'Invalid date'
      console.log(`belum c ${tgl}`)
    }
  }
  return tgl
}