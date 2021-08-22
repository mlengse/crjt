const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const TOKEN_PATH = 'token.json';

const loadCreds = async () => {
  return new Promise((resolve, reject) => {
    fs.readFile('credentials.json', (err, content) => {
      if (err) reject('Error loading client secret file:', err);
      resolve(JSON.parse(content))
    });
  })
}

const authorize = async () => {
  const { 
    installed: {
      client_secret,
      client_id,
      redirect_uris
    } 
  } = await loadCreds()
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  return await new Promise( resolve => {
    fs.readFile(TOKEN_PATH, async (err, token) => {
      if (err) {
        resolve( await getNewToken(oAuth2Client))
      };
      oAuth2Client.setCredentials(JSON.parse(token));
      resolve(oAuth2Client);
    });
  })
}

const getNewToken = async oAuth2Client => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return await new Promise ((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) reject('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) reject(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        resolve(oAuth2Client);
      });
    });
  
  })
}

exports._fetchSheet = async ( {that, sheetName, file}) => {
  return await new Promise ( (resolve, reject) => that.sheets.spreadsheets.values.get({
    spreadsheetId: file,
    range: sheetName,
  }, (err, res) => {
    that.spinner.start(`file ${file} sheet ${sheetName}`)
    if (err) reject('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      // Print columns A and E, which correspond to indices 0 and 4.
      let headers, headersID
      rows.map((row, id) => {
        for(let col of row){
          if(col && col.toLowerCase()
          .split('(').join(' ')
          .split(')').join(' ')
          .split('.').join(' ')
          .split('/').join(' ')
          .split('-').join(' ')
          .split('*').join(' ')
          .trim()
          .split('  ').join(' ')
          .split(' ').join('_') === 'nama') {
            headers = row
            headersID = id
            break
          }
        }

        let objRow = {}

        if(id && headers && headersID !== id){
          // console.log(row[id][0])
          // if(row[id][0])
          row.map((col, id) => {
            if(col){
              col = col.trim()
            }
            if(col && col.length && headers[id]){
              let headersName = headers[id].toLowerCase()
              .split('(').join(' ')
              .split(')').join(' ')
              .split('.').join(' ')
              .split('/').join(' ')
              .split('-').join(' ')
              .split('*').join(' ')
              .trim()
              .split('  ').join(' ')
              .split(' ').join('_')

              objRow[headersName] = col
            }
          })
          Object.keys(objRow).length > 6 ? rows[id] = objRow : null
        }

      })
      
      let filteredRows = rows.map( row => {
        if(row.nik){
          row.nik = row.nik.split('O').join('0')
          row.nik = row.nik.replace(/[^0-9\.]+/g, '')
        } else if(row.nama){
          console.log(row)
        }
        return row
      }).filter(row => !Array.isArray(row) && row.nik && row.nik.length === 16);

      filteredRows.length && that.spinner.succeed(`data found file ${file} sheet ${sheetName}: ${filteredRows.length}`) 
      resolve(filteredRows)

    } else {
      that.spinner.succeed('no data found')
      resolve([]);
    }
  }))
}

exports._fetchKasus =  async ({ that }) => {

  const auth = await authorize()

  that.sheets = google.sheets({version: 'v4', auth});

  that.people = {}

  let files = []

  that.config.AAR_SHEET_ID && files.push(that.config.AAR_SHEET_ID)
  that.config.A_SHEET_ID && files.push(that.config.A_SHEET_ID)

  for(let file of files) {
    that.spinner.start(`process file id ${file}`)
    let sheetsList = (await that.sheets.spreadsheets.get({ 
      spreadsheetId: file
    })).data.sheets.map((sheet) => {
      return sheet.properties.title
    })
  
    if(sheetsList.length) for(sheetName of sheetsList) if(!sheetName.toLowerCase().includes('rekap')){
      for ( let fetch of await that.fetchSheet({sheetName, file})) {
        that.people[fetch.nik] = Object.assign({}, that.people[fetch.nik], fetch)
      }
    }
  
  }

  await that.cleanData()

}
