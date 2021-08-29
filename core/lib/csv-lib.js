const { Database } = require('ark.db');
const arrayToCsv = require('arrays-to-csv');

const csvHeaders = [
  'id',
  'nama',	
  'jeniskelamin',	
  'usia',	
  'alamat',	
  'desa',	
  'nohp',	
  'flagkronis',
  'pcare_nokartu',
  'pcare_nama',
  'pcare_sex',
  'pcare_tgllahir',
  'pcare_nohp',
  'pcare_similarity',
  'pcare_umur',
  'simpus_norm',
  'simpus_nama',
  'simpus_alamat',
  'simpus_tgllahir',
  'simpus_nojkn',
  'simpus_nohp',
  'simpus_similarity',
  'simpus_umur'
]

exports.sasaran = csvHeaders.reduce((acc, n) => {
  acc[n] = ''
  return acc
}, {})

const sasarandb = new Database('../../db/sasaran');

exports.sasaranHas = id => sasarandb.has(id)
exports.sasaranGet =  id => sasarandb.get(id)
exports.sasaranAll =  () => sasarandb.all()
exports.sasaranUpsert = person => {
  if(sasarandb.has(person.id)){
    person = Object.assign({}, sasarandb.get(person.id), person)
  } 
  return sasarandb.set(person.id, person) 
}

exports._importCSV = async ({ that }) => {
  let dataJSON = that.sasaranAll()
  let data = Object.keys(dataJSON).map( e => Object.assign({}, dataJSON[e]))
  // console.log(data)
  let csvGenerator = new arrayToCsv(data, { 
    delimiter: ';',
    quote: "'" 
  });
  csvGenerator.saveFile('./db/data.csv');
}