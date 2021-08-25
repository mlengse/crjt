const { Database } = require('ark.db');
// const db = new Database('../../db/test');
const peopledb = new Database('../../db/people');
// If you want you specify the file to save the data like; new Database("myDatas");

exports._arkImporter = async ({ that }) => {
  let sisa = Object.keys(that.people)
  let pos = sisa.filter(e => that.people[e].isKonfirm)
    .sort((b,a) => that.unixSrt(that.people[a].tanggal_pemeriksaan) - that.unixSrt(that.people[b].tanggal_pemeriksaan));
  let neg = sisa.filter(e => !that.people[e].isKonfirm)
    .sort((b,a) => that.unixSrt(that.people[a].tanggal_pemeriksaan) - that.unixSrt(that.people[b].tanggal_pemeriksaan));
  sisa = [...pos, ...neg]
  let sl = sisa.length
  let nik
  let id
  
  while(sl !== sl - sisa.length){
    id = sl - sisa.length
    nik = sisa.shift()
    // if( id === 1  /* && exclude.indexOf(id) === -1*/)
    {
      // console.log(that.people[nik])
      that.person = await that.upsertPerson({ person: that.people[nik] })

      that.spinner.succeed(`-----------------------------------`)
      that.spinner.succeed(`processing ${id}, ${nik} ${that.person.nama}${that.person.isKonfirm ? ' terkonfirmasi.' : '.'} tgl ag ${that.person.tanggal_pemeriksaan} Hasil: ${that.person.hasil_pemeriksaan}`)
      that.spinner.succeed(`sisa data after cleaning ${sisa.length}`)

      if(that.person.isKonfirm){
        that.spinner.succeed(`sisa data positif setelah cleaning ${sisa.filter(nik => that.people[nik].isKonfirm).length}`)
      }

      that.arkUpsert(that.person)

    }
  }  
}

exports.arkHas = nik => peopledb.has(nik)
exports.arkGet =  nik => peopledb.get(nik)
exports.arkUpsert = person => {
  if(peopledb.has(person.nik)){
    person = Object.assign({}, peopledb.get(person.nik), person)
  } 
  return peopledb.set(person.nik, person) 
}

// // To update or set your data;
// let a = db.set("example", "test"); // -> test
// console.log('a', a)
// // To get your data;
// let b = db.get("example"); // -> test
// console.log('b', b)
// // To delete your data;
// let c = db.delete("example"); // -> true
// console.log('c', c)
// // To increase your data;
// // let d = db.add("example", 2); // -> 2
// // console.log('d', d)
// // // To decrase your data;
// // let e = db.subtract("example", 1); // -> 1
// // console.log('e', e)
// // To learn database has the data;
// let f = db.has("example"); // -> true
// console.log('f', f)
// // To push the data;
// // db.set('test', [])
// // let g = db.push("test", "test"); // -> "test"
// // console.log('g', g)
// // // To pull the data;
// // let h = db.pull("test", "test"); // -> []
// // console.log('h', h)
// // // To get all data;
// let i = db.all();
// console.log('i', i)
// // To delete all data;
// // db.clear();

// // To get database's ping;
// let j = db.ping();
// console.log('j', j)
