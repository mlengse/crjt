const { Database, aql } = require('arangojs')
const tcpPortUsed = require('tcp-port-used')
const { 
  ARANGODB_HOST, 
  ARANGODB_PORT, 
  ARANGODB_DB, 
  ARANGODB_USERNAME, 
  ARANGODB_PASSWORD
} = process.env

const arango = new Database({
  url: `http://${ARANGODB_USERNAME}:${ARANGODB_PASSWORD}@${ARANGODB_HOST}:${ARANGODB_PORT}`
});
let dbExist

exports._testDb = async ({that, db}) => {
	try{
    if(!db){
      db = ARANGODB_DB
    }
    if(!that.dbReady){
      that.dbReady = arango.database(db);
    }
    return that.dbReady;
	} catch (err) {throw err}
}

exports._testCol = async ({that, coll})=>{
	try{
    let collnames = await that.dbReady.collections(true);
    let names = collnames.map(collname=>{
      let name = collname.name;
      return name;
    });
		that.collready = that.dbReady.collection(coll);
    if (names.indexOf(coll) == -1){
      await that.collready.create();
    }
		return that.collready;
	} catch(err) {throw err}
}

exports._testArangodbAndCol = async ({ that, db, coll}) => {
	try{
		await that.testDb({db});
		coll && await that.testCol({coll});
		return that.dbReady
	}catch(err){throw err}
}

exports._dbquery = async ({ that, coll, query }) => {
	let result
	try{
		await that.testArangodbAndCol({ coll })
		let cursor = await that.dbReady.query(query);
		result = await cursor.all();
	}catch(err) {
		result = false
	}
	return result
}

exports._dbcheck = async ({ that, coll, doc }) => {
	let result
	try{
		await that.testArangodbAndCol({ coll })
		let cursor = await that.dbReady.query({
			query: 'FOR p IN @@collname FILTER CONTAINS(p._key, @_key) RETURN p',
			bindVars: {
				"@collname": coll,
				_key: doc._key
			}
		});
		let res = await cursor.all();
		result = res[0]
	}catch(err) {
		result = false
	}
	return result
}

exports._arangoUpsert = async ({that, coll, doc})=>{
  if(!doc._key){
    doc._key = that.unixTime()
  }
	try{
		await that.testArangodbAndCol({ coll })
		let cursor = await that.dbReady.query({
			query: 'UPSERT { _key : @_key } INSERT @doc UPDATE @doc IN @@collname RETURN { OLD, NEW }',
			bindVars: {
				"@collname": coll,
				_key: doc._key,
				doc: doc
			}
		});
		let result = await cursor.all();
		return result[0];
	}catch(err) {throw err}
}

exports._arangoReplace = async ({that, coll, doc})=>{
	try{
		await that.testArangodbAndCol({ coll })
		let cursor = await that.dbReady.query({
			query: 'REPLACE @doc IN @@collname RETURN { OLD, NEW }',
			bindVars: {
				"@collname": coll,
				doc: doc
			}
		});
		let result = await cursor.all();
		return result[0];
	}catch(err) {throw err}
}

exports._arangoLength = async ({ that, coll }) => {
	try{
		await that.testArangodbAndCol({ coll })
		let cursor = await that.dbReady.query(`RETURN LENGTH(${coll})`)
		let result = await cursor.all()
		return result
	}catch(err) {throw err}
}

exports._arangoQuery = async ({ that, aq}) => {
	try{
		await that.testArangodbAndCol();
		let cursor = await that.dbReady.query(aq);
		let res = await cursor.all();
		return res;
	}catch(err) {throw err}
}

exports._upsertPerson = async({ that, person}) => {
	if(!dbExist){
		try{
			dbExist = await tcpPortUsed.check(Number(that.config.ARANGODB_PORT), that.config.ARANGODB_HOST)
			that.spinner.succeed(`${new Date()} ${dbExist}`)
		}catch(e){
			dbExist = `${new Date()} ${`${e}` ? `${e}` : `${JSON.stringify(e, Object.getOwnPropertyNames(e))}`}`
			that.spinner.fail(dbExist)
		}
	}
	if(dbExist || (dbExist && typeof dbExist !== "String" )) {
		let jsonExist
		if(that.arkHas(person.nik)){
			jsonExist = that.arkGet(person.nik)
		}
		// let jsonExist = that.getPersonJSON(person.nik)
		
		// console.log(!!jsonExist)

		// if(!!jsonExist) {
			// person = Object.assign({}, jsonExist, person)
		// }
		
		let upsertData = await that.arangoUpsert({
			coll: 'people',
			doc: Object.assign({}, person, {
				_key: `${person.nik}`
			})
		})

		// console.log(upsertData.NEW)

		if(!!jsonExist){
			person = Object.assign({}, jsonExist, upsertData.NEW)
			delete person._key
			delete person._id
			delete person._rev

			// console.log((JSON.stringify(jsonExist) !== JSON.stringify(person)))

			if(JSON.stringify(jsonExist) !== JSON.stringify(that.person)){
				return that.arkUpsert(person)
				// return that.upsertPersonJSON(person)
			} else {
				return person
			}
		} else {
			return upsertData.NEW
		}
		// console.log(upsertData.NEW)
	} else if(!dbExist || (dbExist && typeof dbExist === "String" && !dbExist.includes('Error'))) {
		that.spinner.succeed(`${new Date()} ${dbExist}`)

		// if(that.arkHas()){
			return that.arkUpsert(person)
		// }
		// return that.upsertPersonJSON(person)
	}
	// return person


}
