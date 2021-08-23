const FileSync = require('lowdb/adapters/FileSync')
const people = require('lowdb')(new FileSync('./db/people.json'))
people.defaults({ people: [] }).write()   

exports.getPersonJSON = nik => (people.get('people').filter({ nik }).value())[0]
exports.upsertPersonJSON = data => {
  let collection = people.get('people')
  let index = collection.findIndex((d) => d.nik === data.nik).value();
  let oldata = (collection.filter({ nik: data.nik }).value())[0]
  // console.log('data', data)
  // console.log('oldata', oldata)
  let newdata = Object.assign({}, oldata, data)
  // console.log('newdata', newdata)

  if (index < 0) {
    collection.push(data).write();
  } else {
    // console.log(JSON.stringify(newdata) === JSON.stringify(oldata))
    if(JSON.stringify(newdata) === JSON.stringify(oldata)){
      return data
    }
    collection.find({ nik: data.nik }).assign(Object.assign({}, newdata, {
      _key: undefined,
			_id: undefined,
			_rev: undefined
    })).value()
    // collection.write()
  }
  // collection.write()
  // console.log(collection.filter({ nik: data.nik }).value())
  return this.getPersonJSON(data.nik)
}
