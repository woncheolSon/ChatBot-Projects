/**
 * Copyright 2017 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';


var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'sl-us-south-1-portal.14.dblayer.com',
  user     : 'admin',
  port     : 29364,
  password : 'VXMVIYJZTNQSIBMJ',
  database : 'compose'
});




/*
 * Cloudant DB Module
 */
const config = require('./config')

let cloudant = require('cloudant')({
    'url': process.env.CLOUDANT_URL,
    'plugin': 'promises'
});

cloudant.db.create(process.env.CLOUDANT_CONTEXT_DB, (err, res) => {
    if (err) { 
        if (err.error == 'file_exists') {
            console.log('cloudant db already exists');
        } else {
            console.log('could not create db ', err);    
        }
    }
    else {
        var design = [{
            "_id": "_design/context",
            "views": {
                "telegram": {
                    "map": "function (doc) {\n  if (doc.type == 'telegram' && !doc.informed)  {\n    emit(doc.context.user.id, {\n      '_id': doc._id,\n      'user_key': doc.user_key\n    });\n  }\n}"
                }
            },
            "language": "javascript"
        }];

        var db = cloudant.db.use(process.env.CLOUDANT_CONTEXT_DB);

        design.forEach((view) => {
            db.insert(view).then((newdoc) => {
                console.log('view created: '+view);
            }).catch(function(err) {
                console.log('failed to create view: ');
            });
        });
    }
});

cloudant.db.create(process.env.CLOUDANT_CONVERSATION_DB, (err, res) => {
    if (err) { 
        if (err.error == 'file_exists') {
            console.log('cloudant db already exists');
        } else {
            console.log('could not create db ', err);    
        }
    }
    else {
        // var design = [{
        //     "_id": "_design/context",
        //     "views": {
        //         "telegram": {
        //             "map": "function (doc) {\n  if (doc.type == 'telegram' && !doc.informed)  {\n    emit(doc.context.user.id, {\n      '_id': doc._id,\n      'user_key': doc.user_key\n    });\n  }\n}"
        //         }
        //     },
        //     "language": "javascript"
        // }];

        // var db = cloudant.db.use(process.env.CLOUDANT_CONTEXT_DB);

        // design.forEach((view) => {
        //     db.insert(view).then((newdoc) => {
        //         console.log('view created: '+view);
        //     }).catch(function(err) {
        //         console.log('failed to create view: ');
        //     });
        // });
    }
});



// stu_info 테이블생성 
// let crt_tlb_stu_info = (data, action) => {
//  return new Promise((resolved, rejected) => {
//     data.context.action = null;

//     ajou_db.query('CREATE TABLE stu_info (stu_num char(9) primary key NOT NULL, name varchar(15) NOT NULL, major varchar(15) NOT NULL, phone_num char(13) NOT NULL) CHARACTER SET utf8', function (error, results) {
//       if (error) {
//          console.error('error connecting: ' + error.stack);
//          resolved(data);
//       }
//       else{
//         console.log('success: ', results);
//         resolved(data);
//       }
//       // connected!
//     });

//   });
// }


// connection.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
//   var sql = "CREATE TABLE stu_info (stu_num char(9) primary key NOT NULL, name varchar(15) NOT NULL, major varchar(15) NOT NULL, phone_num char(13) NOT NULL) CHARACTER SET utf8";
//   connection.query(sql, function (err, result) {
//     if (err) throw err;
//     console.log("Table created");
//     resolved(data);
//   });
// });





module.exports = {
    'db': {
        'context' : cloudant.db.use(process.env.CLOUDANT_CONTEXT_DB),
        'conversation' : cloudant.db.use(process.env.CLOUDANT_CONVERSATION_DB),
        'ajou' : connection
    }
};