const moment = require('moment')
moment.locale('id')

let baseDate = moment().format('DD-MM-YYYY')
if(process.env.BASE_DATE){
  baseDate = process.env.BASE_DATE
}

// moment.now = () => +new Date('2021', '2', '28');
exports.unixTime = () => moment().format('x')
exports.xTimestamp = () => moment.utc().format('X')