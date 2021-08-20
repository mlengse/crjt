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

exports._fetchSheet = async ( {that, sheetName}) => {
  return await new Promise ( (resolve, reject) => that.sheets.spreadsheets.values.get({
    spreadsheetId: that.config.AAR_SHEET_ID,
    range: sheetName,
  }, (err, res) => {
    that.spinner.start('start listing')
    if (err) reject('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      // Print columns A and E, which correspond to indices 0 and 4.
      let headers, headersID
      rows.map((row, id) => {
        if(row[0] && row[0].toLowerCase() === 'nama') {
          headers = row
          headersID = id
        }

        let objRow = {}

        if(id && headers && headersID !== id){
          // console.log(row[id][0])
          // if(row[id][0])
          row.map((col, id) => {
            if(col && col.length && headers[id]){
              let headersName = headers[id].toLowerCase()
              .split('(').join(' ')
              .split(')').join(' ')
              .split('.').join(' ')
              .split('/').join(' ')
              .split('-').join(' ')
              .trim()
              .split('  ').join(' ')
              .split(' ').join('_')

              objRow[headersName] = col
            }
          })
          Object.keys(objRow).length > 2 ? rows[id] = objRow : null
        }

      })
      
      let filteredRows = rows.filter(row => !Array.isArray(row) && row.nik && row.nik.length === 17).map( row => Object.assign({}, row, {
        nik: row.nik.split("'").join('')
      }));

      that.spinner.succeed(`data found ${sheetName}: ${filteredRows.length}`)
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

  const sheetsList = (await that.sheets.spreadsheets.get({ 
    spreadsheetId: that.config.AAR_SHEET_ID
  })).data.sheets.map((sheet) => {
    return sheet.properties.title
  })

  that.people = {}

  if(sheetsList.length) for(sheetName of sheetsList) if(!sheetName.toLowerCase().includes('rekap')){
    for ( let fetch of await that.fetchSheet({sheetName})) {
      that.people[fetch.nik] = Object.assign({}, that.people[fetch.nik], fetch)
    }
  }
}
