const FileSync = require('lowdb/adapters/FileSync')
const people = require('lowdb')(new FileSync('./db/people.json'))
people.defaults({ people: [] }).write()   

exports.getPersonJSON = nik => (people.get('people').filter({ nik }).value())[0]
exports.upsertPersonJSON = data => {
  let collection = people.get('people')
  let index = collection.findIndex((d) => d.nik === data.nik);
  // console.log(collection.length, data.nik, index)

  if (index < 0) {
    collection.push(data).write();
  } else {
    if(JSON.stringify(collection[index]) === JSON.stringify(data)){
      return data
    }
    collection[index] = Object.assign({}, collection[index], data);
    collection.write()
  }
  return this.getPersonJSON(data.nik)
}
