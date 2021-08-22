const FileSync = require('lowdb/adapters/FileSync')
const people = require('lowdb')(new FileSync('./db/people.json'))
people.defaults({ people: [] }).write()   
people._.mixin({
  upsert: (collection, data) => {
    // console.log(data.nik)
    let index = collection.findIndex((d) => d.nik === data.nik);
    // console.log(collection.length, data.nik, index)

    if (index < 0) {
      collection.push(data);
    } else {
      Object.assign(collection[index], data);
    }

    return collection;
  }
}); 

exports.getPersonJSON = nik => (people.get('people').filter({ nik }).value())[0]
exports.upsertPersonJSON = person => {
  people.get('people').upsert( person ).write();
  // person = Object.assign({}, this.getPersonJSON(person.nik), person)
  // !!people.get('people').filter({ nik: person.nik }).value().length ? people.get('people').filter({ nik: person.nik }).assign(person).write() : people.get('people').push(person).write()
  // if(person.checkNIK || person.checkDuplicate){
  //   console.log(person)
  //   console.log(people.get('people').filter({ nik: person.nik }).value())
  // }
  // console.log(this.getPersonJSON(person.nik))
  return this.getPersonJSON(person.nik)
}
