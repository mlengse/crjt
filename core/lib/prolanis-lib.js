exports._prolanis = async ({ that }) => {
  that.spinner.start(`init prolanis on ${that.config.npm_package_name} ${new Date()}`)
  // await that.fetchSasaran()
  // that.spinner.succeed(`init prolanis on ${that.config.npm_package_name} ${new Date()}`)

  // for ( let [idx, sasaran] of Object.entries(that.people.sasaran) )
  // if( !that.sasaranHas(1+Number(idx))  /** idx < 10 */)
  // {
  //   sasaran = Object.assign({}, that.sasaran, sasaran, {
  //     id: 1+Number(idx)
  //   })
  //   that.spinner.succeed(`${1+Number(idx)} ${sasaran.nama}`)
  //   let noKartu = that.people.pcare.map( e => Object.assign({}, e, {
  //     similarity: that.similarityString( sasaran.nama, e.nama ),
  //     umur: that.umur(e.tgllahir)
  //   })).sort((a, b) => b.similarity - a.similarity)
  //   // console.log(that.people.pcare.length, noKartu[0])
  //   if(
  //     noKartu[0].similarity > 0.85 
  //     && noKartu[0].umur - Number(sasaran.usia) < 3
  //     && noKartu[0].umur - Number(sasaran.usia) > -3
  //     && sasaran.jeniskelamin.toLowerCase().includes(noKartu[0].sex.toLowerCase())
  //   )
  //   {
  //     sasaran = Object.assign({}, sasaran, ...Object.keys(noKartu[0]).map(v => {
  //       let obj = {}
  //       obj[`pcare_${v}`] = noKartu[0][v]
  //       return obj
  //     }))
  //     that.people.pcare = that.people.pcare.filter( e => e.nokartu !== sasaran.pcare_nokartu)
  //   }
  //   let simpusData = that.people.simpus.map( e => Object.assign({}, e, {
  //     similarity: that.similarityString( sasaran.nama, e.nama ),
  //     umur: that.umurSimpus(e.tgllahir)
  //   })).sort((a, b) => b.similarity - a.similarity)
  //   let ada = simpusData.filter( p => p.nojkn && sasaran.nokartu && p.nokartu.includes(p.nojkn) )
  //   if(ada.length){
  //     sasaran = Object.assign({}, sasaran, ...Object.keys(ada[0]).map(v => {
  //       let obj = {}
  //       obj[`simpus_${v}`] = ada[0][v]
  //       return obj
  //     }))
  //     that.people.simpus = that.people.simpus.filter( e => !e.nojkn || !sasaran.nokartu.includes(e.nojkn))
  //   } else 
  //   if(
  //     simpusData[0].similarity > 0.85 
  //     && simpusData[0].umur - Number(sasaran.usia) < 3
  //     && simpusData[0].umur - Number(sasaran.usia) > -3
  //   )
  //   {
  //     sasaran = Object.assign({}, sasaran, ...Object.keys(simpusData[0]).map(v => {
  //       let obj = {}
  //       obj[`simpus_${v}`] = simpusData[0][v]
  //       return obj
  //     }))
  //     that.people.simpus = that.people.simpus.filter( e => e.norm !== sasaran.simpus_norm)
  //   }

  //   that.sasaranUpsert(sasaran)

  //   console.log(sasaran)
  // }

  await that.importCSV()

}