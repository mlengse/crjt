const FileSync = require('lowdb/adapters/FileSync')
const people = require('lowdb')(new FileSync('./db/old-db-people.json'))
people.defaults({ people: [] }).write()   

exports.getPersonJSON = nik => (people.get('people').filter({ nik }).value())[0]
exports.upsertPersonJSON = data => {
  let collection = people.get('people')
  let index = collection.findIndex((d) => d.nik === data.nik).value();
  let oldata = (collection.filter({ nik: data.nik }).value())[0]
  let newdata = Object.assign({}, oldata, data)

  if (index < 0) {
    collection.push(data).write();
  } else {
    if(JSON.stringify(newdata) === JSON.stringify(oldata)){
      return data
    }
    collection.find({ nik: data.nik }).assign(Object.assign({}, newdata, {
      _key: undefined,
			_id: undefined,
			_rev: undefined
    })).value()
  }
  return this.getPersonJSON(data.nik)
}
