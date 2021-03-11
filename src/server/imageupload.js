const FormData = require('form-data');
const fs = require('fs');
const getUri = require('get-uri');
const uuidv4 = require('uuid').v4;
const mysql = require('./mysql.js');

const directory = 'tmp/';

function save(uri) {
  // return promise so we can see the results later
  return new Promise(function(res){
    // set filename
    const fileName = uuidv4() + ".png";
    const path = directory + fileName;
    // create directory where images will be written
    if (!fs.existsSync(directory)){
      fs.mkdirSync(directory);
    }

    // convert image uri to image file
    getUri(uri, function (err, rs) {
      if (err) {
        res({...err, error: true});
      }
      const imageFile = fs.createWriteStream(path);
      const stream = rs.pipe(imageFile);
      // attempt upload when writing is finished
      stream.on('close', function() {
        // if express cannot upload to datapath, the client does not need to know
        // so promise will resolve true since image is saved _somewhere_
        upload(fileName, res);
      });
      stream.on('error', function (err) {
        res({...err, error: true});
      });
    });
  });
}

function upload (file, callback) {
  // Insert into Database to reserve ID
  let wb_formimage_values = {};
  let imageId;
  wb_formimage_values['created'] = 'now()';
  mysql.insertWithData('wb_formimage', wb_formimage_values).then(value => {
    imageId = value.results.insertId;

    // create a form and upload the file
    const path = directory + file;
    let formData = new FormData();
    formData.append("files[]", fs.createReadStream(path));
    formData.submit({
      host: '10.1.3.250',
      path: '/ltowb/scripts/index.php?record_id=' + imageId,
      port: '3202',
      protocol: 'http:'
    }, function (err, res) {
      if (err) {
        console.log('Unable to upload file: ' + err);
        callback({error: true, type: 'image upload', msg: 'Unable to upload file: ', obj: err});
        return;
      }
      // need to collect the response in chunks
      let body = '';
      res.on('data', function(chunk) {
        body += chunk;
      });
      // once the response body has been parsed, we can check to see if the server actually got it
      res.on('end', function() {
        let parsedBody = undefined;
        try {
          parsedBody = JSON.parse(body.match(/{.[files].+}/)[0]);
        } catch (e) {
          console.log('invalid response from server: ', body);
          callback({error: true, type: 'image upload', msg: 'invalid response from server: ', obj: body});
          return;
        }
        //console.log('Successfully uploaded: ' + file + ' as ' + JSON.parse(body).files.map(f => f.url));
        if (parsedBody.files.length > 0) {
          // if it received the files, we can safely delete the express copy
          fs.unlink(path, (err) => {
            if (err) {
              console.log('Unable to delete temporary file: ', err);
              callback({error: true, type: 'image upload', msg: 'Unable to delete temporary file: ', obj: err});
              return;
            }
            //console.log('Successfully deleted temporary file: ' + file);
          });
          // we can also put the file name into the database
          let wb_formimage_values = {};
          wb_formimage_values['form_image'] = mysql.addQuotes(parsedBody.files[0].name);
          wb_formimage_values['formimage_id'] = mysql.addQuotes(imageId);
          mysql.updateWithData('wb_formimage', wb_formimage_values, 'formimage_id');
          // return the recordId of this image
          callback({imageId: imageId});
          return;
        } else {
          // if datapath did not receive it, we can keep the files and try uploading at another time.
          console.log('invalid response from server: ', body);
          callback({error: true, type: 'image upload', msg: 'invalid response from server: ', obj: body});
          return;
        }
      });
    });
  }).catch(err => {
    console.log('Unable to upload file: ',err);
    callback({error: true, type: 'image upload', msg: 'Unable to upload file: ', obj: err});
    return;
  });
}

// if any stragglers are remaining, try to upload them with this
function uploadAll() {
  fs.readdir(directory, function (err, files) {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }
    files.forEach(function (file) {
      upload(file);
    });
  });
}

module.exports = { save };
