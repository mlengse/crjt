const FileSync = require('lowdb/adapters/FileSync')
const people = require('lowdb')(new FileSync('./db/people.json'))
people.defaults({ people: [] }).write()   

exports.getPersonJSON = nik => (people.get('people').filter({ nik }).value())[0]
exports.upsertPersonJSON = data => {
  let collection = people.get('people')
  let index = collection.findIndex((d) => d.nik === data.nik).value();
  let oldata = (collection.filter({ nik: data.nik }).value())[0]
  // console.log(data)
  // console.log(oldata)
  let newdata = Object.assign({}, oldata, data)
  // console.log(newdata)

  if (index < 0) {
    collection.push(data);
  } else {
    // console.log(JSON.stringify(newdata) === JSON.stringify(oldata))
    if(JSON.stringify(newdata) === JSON.stringify(oldata)){
      return data
    }
    collection.find({ nik: data.nik }).assign(newdata).value()
    // collection.write()
  }
  // console.log(collection.filter({ nik: data.nik }).value())
  collection.write()
  return this.getPersonJSON(data.nik)
}
