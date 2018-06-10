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

const Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
const credentials = require('../util/service_credentials');
const request = require('request');
const moment = require('moment-timezone');
const actionHandler = require('./actions/main')

const cloudant = require('../util/db');
const db = cloudant.db['conversation'];
const Roommate_DB = cloudant.db['miniProj'];




Roommate_DB.connect(function(err) { 
  
  // drop table
  var sql = "DROP TABLE IF EXISTS user_info";
  Roommate_DB.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table stu_info dropped!");
  });

  var sql = "DROP TABLE IF EXISTS room_info";
  Roommate_DB.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table room_info dropped!");
  });

  var sql = "DROP TABLE IF EXISTS feature_info";
  Roommate_DB.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table feature_info dropped!");
  });



  // create table
  if (err) throw err;
  console.log("MySQL 연결 성공!");

  var sql = "CREATE TABLE user_info (sex boolean NOT NULL, age INT NOT NULL, job varchar(3) NOT NULL, phone_num varchar(12) NOT NULL, kakao_id varchar(30) primary key NOT NULL) CHARACTER SET utf8";
  Roommate_DB.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table user_info created!");
  });

  var sql = "CREATE TABLE room_info (room_type varchar(6) NOT NULL, room_location varchar(10) NOT NULL, room_price varchar(4) NOT NULL, utility boolean NOT NULL, roommate_number INT NOT NULL, wash_set varchar(12) NOT NULL) CHARACTER SET utf8";
  Roommate_DB.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table room_info created!");
  });

  var sql = "CREATE TABLE feature_info (quiet_time INT NOT NULL, avoid_guest boolean NOT NULL, atmosphere varchar(20) NOT NULL, living_share boolean NOT NULL, mixed_place boolean NOT NULL, cleaning varchar(2) NOT NULL, no_party boolean NOT NULL, no_smoking boolean NOT NULL, no_pet boolean NOT NULL) CHARACTER SET utf8";
  Roommate_DB.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table feature_info created!");
  });



  // table data
var user_info_data = [
     [0, 23, '직장인', '604-442-2313', 'future_love'],
     [0, 24, '워홀러', '604-223-5283', 'Suckise'],
     [0, 32, '학생', '000-000-0000', 'downtownroom'],
     [1, 35, '직장인', '000-000-0000', 'vancouverite10'],
     [1, 28, '직장인', '000-000-0000', 'Qnddl'],
     [0, 29, '학생', '604-442-8827', 'Rami'],    
     [1, 33, '직장인', '604-789-7249', 'pertersoo'],
     [0, 30, '직장인', '000-000-0000', ' smcha90' ],
     [1, 28, '학생', '778-885-0130', '----'],
     [0, 25, '학생', '000-000-0000', 'so93606'],
     [0, 28, '학생', '778-891-5360', '----'],
     [0, 34, '워홀러', '604-329-5376', '----'],
     [0, 38, '직장인', '604-345-4772', 'jshinca'],
     [0, 35, '직장인', '778-883-4896', 'po91po'],
     [0, 28, '학생', '778-636-4414', 'haejin5325'], 
     [0, 29, '워홀러', '604-729-5940', '----'],
     [0, 32, '학생', '000-000-0000', 'auschwitz'],
     [0, 28, '직장인', '604-363-1615', 'mingky1111'],
     [0, 24, '학생', '604-358-8768', 'pluralist'],
     [0, 23, '학생', '000-000-0000', '----'],
     [1, 35, '직장인', '778-988-7705', 'Alexoh77'],
     [1, 28, '직장인', '604-783-0319', '----'],
     [0, 29, '워홀러', '604-617-7900', '----'],
     [0, 35, '직장인', '778-955-5912', '----'],
     [1, 36, '직장인', '778-686-5760', '----'],
     [1, 33, '학생', '778-308-9018', '----'],
     [1, 30, '직장인', '778-866-9724', '----'],
     [1, 29, '워홀러', '604-725-0317', '----'],
     [0, 29, '직장인', '778-862-9154', 'case1245'],
     [0, 28, '학생', '604-771-3489', '----'],
     [0, 31, '직장인', '778-862-9154', '----'],
     [1, 28, '학생', '778-899-0601', '----'],
     [1, 30, '직장인', '604-358-8656', '----'],
     [0, 24, '학생', '604-679-4874', '----'],
     [1, 31, '학생', '778-847-8914', '----'],
     [1, 29, '워홀러', '000-000-0000', 'jongil'],
     [0, 32, '학생', '778-929-4581', '----'],
     [0, 30, '학생', '778-707-2586', '----'],
     [0, 31, '워홀러', '604-786-1057', 'jane198501'],
     [1, 30, '워홀러', '778-955-5912', '----'],
     [0, 27, '학생', '778-995-3349', '----'],
     [1, 28, '학생', '604-710-2805', 'pkys96'],
     [0, 30, '직장인', '778-862-9154', 'case1245'],
     [1, 26, '학생', '604-318-5175', 'jaylikes'],
     [0, 36, '직장인', '604-240-9803', '----'],
     [0, 28, '워홀러', '604-722-5994', '----'],
     [1, 27, '학생', '604-223-4381', '----'],
     [1, 26, '워홀러', '604-767-5341', '----'],
     [1, 29, '학생', '000-000-0000', 'case1245'],
     [1, 32, '직장인', '778-870-2765', '----'],
     [0, 28, '워홀러', '778-229-9957', '----'],
     [1, 28, '학생', '778-320-3593', '----'],
     [1, 25, '학생', '000-000-0000', 'reilrla'],
     [0, 28, '학생', '000-000-0000', 'jjl0402'],
     [0, 26, '학생', '604-725-9317', 'mindguy'],
     [0, 24, '워홀러', '778-807-9019', '----'],
     [1, 27, '학생', '778-835-6153', 'chsw91'],
     [0, 24, '워홀러', '000-000-0000', 'dygenius12'],
     [1, 29, '학생', '778-875-9626', 'kong010'],
     [0, 29, '직장인', '778-680-3467', '----'],
     [0, 25, '학생', '604-767-9133', 'Bubbletalk9'],
     [1, 28, '학생', '604-230-7574', 'bjo5514'],
     [0, 25, '워홀러', '778-929-7754', 'romanticeye'],
     [1, 32, '직장인', '778-968-7089', '----'],
     [0, 28, '직장인', '778-798-3664', '----'],
     [0, 26, '학생', '778-955-5912', '----'],
     [0, 30, '직장인', '604-779-1600', '----'],
     [0, 28, '직장인', '778-772-3853', '----'],
     [0, 26, '학생', '778-682-9087', 'jaar'],
     [1, 28, '학생', '604-363-3965', 'qownghk159'],
     [0, 27, '직장인', '000-000-0000', 'sweetmartini4'],
     [0, 36, '직장인', '778-882-9279', 'so93606']
     [1, 30, '직장인', '778-870-14459', '----']
];

var room_info_data = [
     ['마스터룸', '스타디움역', '1360', 1, 3, '세탁기&건조기 세트'],
     ['세컨드룸', '스타디움역', '1290', 1, 3, '세탁기&건조기 세트'],
     ['솔라리움', '스타디움역', '730', 1, 3, '세탁기&건조기 세트'],
     ['덴', '예일타운', '600', 1, 1, '코인세탁기'],
     ['덴', '차이나타운', '600', 1, 4, '세탁기&건조기 세트' ],
     ['거실쉐어', '차이나타운', '500', 1, 4, '세탁기&건조기 세트'],
     ['솔라리움', '차이나타운', '700', 1, 4, '세탁기&건조기 세트'],
     ['거실쉐어', '뉴웨스트미니스턴', '450', 1, 3, '세탁기보유'],
     ['솔라리움', '스팩트럼', '650', 0, 4, '세탁기&건조기 세트'],
     ['덴', '차이나타운', '550', 1, 2, '세탁기&건조기 세트'],
     ['세컨드룸', '조이스역', '550', 1, 3, '세탁기&건조기 세트'],
     ['세컨드룸', '웨스트엔드', '700', 0, 2, '코인세탁기'],
     ['덴', '티비타워', '520', 0, 3, '코인세탁기'],
     ['마스터룸', '써리', '620', 1, 2, '세탁기'],
     ['세컨드룸', '카데로', '700', 1, 3, '코인세탁기'],
     ['마스터룸', '다운타운', '1250', 1, 3, '세탁기&건조기 세트'],
     ['거실쉐어', '다운타운', '530', 0, 2, '세탁기&건조기 세트'],
     ['거실쉐어', '다운타운', '500', 0, 4, '코인세탁기'],
     ['덴', '예일타운', '600', 1, 3, '세탁기&건조기 세트'],
     ['덴', '차이나타운', '600', 0, 2, '코인세탁기'],
     ['거실쉐어', '다운타운', '450', 1, 4, '코인세탁기'],
     ['세컨드룸', '랑가라', '800', 0, 4, '코인세탁기'],
     ['세컨드룸', '조이스역', '700', 1, 4, '코인세탁기'],
     ['거실쉐어', '다운타운', '550', 1, 1, '코인세탁기'],
     ['세컨드룸', '다운타운', '740', 0, 1, '세탁기&건조기 세트' ],
     ['마스터룸', '버나비', '750', 1, 2, '세탁기'],
     ['세컨드룸', '로이드', '700', 1, 1, '코인세탁기' ],
     ['거실쉐어', '버라드', '500', 1, 3, '세탁기&건조기 세트'],
     ['마스터룸', '다운타운', '700', 1, 3, '세탁기&건조기 세트'], 
     ['거실쉐어', '다운타운', '700', 1, 3, '세탁기&건조기 세트'], 
     ['세컨드룸', '다운타운', '900', 1, 3, '세탁기&건조기 세트'],
     ['마스터룸', '다운타운', '980', 1, 3, '코인세탁기'],
     ['거실쉐어', '다운타운', '510', 1, 2, '코인세탁기'],
     ['세컨드룸', '나나이모', '520', 1, 1, '세탁기&건조기 세트'],
     ['솔라리움', '차이나타운', '650', 1, 3, '세탁기&건조기 세트'],
     ['세컨드룸', '다운타운', '980', 1, 3, '세탁기&건조기 세트'],
     ['마스터룸', '웨스트엔드', '795', 1, 2, '세탁기&건조기 세트'],
     ['덴', '다운다운', '560', 1, 5, '세탁기&건조기 세트'], 
     ['마스터룸', '차이나타운', '1200', 1, 2, '세탁기&건조기 세트' ],
     ['마스터룸', '예일타운', '1000', 1, 3, '코인세탁기' ],
     ['세컨드룸', '다운타운', '650', 1, 3, '세탁기&건조기 세트' ],
     ['마스터룸', '리치몬드', '850', 0, 3, '세탁기&건조기 세트' ],
     ['거실쉐어', '다운타운', '470', 0, 3, '세탁기&건조기 세트' ],
     ['세컨드룸', '로이드', '700', 1, 1, '코인세탁기' ],
     ['덴', '로이드', '500', 1, 1, '코인세탁기' ],
     ['세컨드룸', '로이드', '500', 1, 2, '코인세탁기' ],
     ['세컨드룸', '코퀴틀람', '600', 1, 4, '세탁기&건조기 세트'],
     ['거실쉐어', '다운타운', '510', 1, 1, '코인세탁기'],
     ['거실쉐어', '카데로', '500', 1, 3, '코인세탁기'],
     ['세컨드룸', '킹에드워드', '850', 1, 3, '세탁기&건조기 세트'],
     ['거실쉐어', '다운타운', '550', 1, 5, '세탁기&건조기 세트'],
     ['덴', 'UBC', '500', 1, 6, '세탁기&건조기 세트'],
     ['거실쉐어', '다운타운', '400', 1, 2, '세탁기&건조기 세트'],
     ['덴', '다운타운', '630', 1, 3, '세탁기&건조기 세트'],
     ['세컨드룸', '다운타운', '1000', 0, 3, '세탁기&건조기 세트'],
     ['솔라리움', '다운타운', '600', 1, 3, '세탁기&건조기 세트'],
     ['세컨드룸', '다운타운', '600', 1, 0, '세탁기&건조기 세트'],
     ['세컨드룸', '다운타운', '850', 1, 0, '코인세탁기'],
     ['솔라리움', '조이스역', '800', 1, 0, '세탁기&건조기 세트'],
     ['거실쉐어', '다운타운', '520', 1, 3, '코인세탁기'],
     ['거실쉐어', '다운타운', '680', 1, 3, '코인세탁기'],
     ['마스터룸', '차이나타운', '1200', 1, 0, '세탁기&건조기 세트'],
     ['세컨드룸', '다운타운', '980', 1, 3, '세탁기&건조기 세트'],
     ['마스터룸', '다운타운', '1400', 0, 2, '코인세탁기'],
     ['세컨드룸', '다운타운', '480', 1, 5, '코인세탁기'],
     ['거실쉐어', '다운타운', '540', 1, 4, '세탁기&건조기 세트'],
     ['마스터룸', '다운타운', '680', 1, 4, '세탁기&건조기 세트'],
     ['세컨드룸', '다운타운', '900', 1, 2, '세탁기&건조기 세트'],
     ['거실쉐어', '조이스역', '580', 0, 3, '코인세탁기'],
     ['세컨드룸', '다운타운', '800', 0, 2, '코인세탁기'],
     ['덴', '다운타운', '500', 1, 0, '코인세탁기'],
     ['세컨드룸', '나나이모', '500', 1, 1, '코인세탁기'],
     ['마스터룸', '로얄오크', '950', 1, 2, '세탁기&건조기 세트'],
     ['거실쉐어', '다운타운', '550', 1, 4, '세탁기&건조기 세트'],
     ['솔라리움', '다운타운', '550', 0, 5, '세탁기&건조기 세트'],
     ['세컨드룸', '게스타운', '500', 1, 5, '세탁기&건조기 세트'],
     ['덴', '다운타운', '500', 0, 3, '세탁기&건조기 세트'],
     ['덴', '다운타운', '600', 1, 3, '세탁기&건조기 세트'],
];

var feature_info_data = [
     [0, 0, '활동적', 0, 0, '5점', 0, 0, 0],
     [0, 0, '활동적', 0, 0, '5점', 0, 0, 0],
     [0, 1, '기본적인 예절만 지켜주세요', 0, 0, '3점',0, 0, 0],
     [0, 1, '기본적인 예절만 지켜주세요', 0, 0, '3점',0, 0, 0],
     [0, 0, '활동적', 0, 0, '3점', 1, 1, 0],
     [0, 1, '조용함', 0, 0, '3점', 0, 0, 0],
     [0, 1, '조용함',1, 0, '4점', 0, 0, 0],
     [0, 1, '활동적', 1, 0, '4점', 1, 0, 0],
     [0, 1, '조용함', 1, 0, '4점', 0, 0, 0],
     [0, 1, '조용함', 1, 0, '4점', 1, 0, 0],
     [0, 1, '조용함', 1, 0, '5점', 0, 0, 0],
     [0, 1, '조용함', 1, 0, '4점', 0, 0, 0],
     [0, 1, '활동적', 1, 1, '5점', 1, 0, 0],
     [0, 1, '조용함', 0, 0, '4점', 0, 0, 0],
     [0, 0, '조용함', 1, 0, '4점', 0, 0, 0],
     [0, 1, '활동적', 1, 0, '4점', 0, 1, 0],
     [0, 0, '활동적', 0, 0, '5점', 0, 0, 0],
     [0, 1, '조용함', 1, 0, '5점', 0, 0, 0],
     [22, 1, '활동적', 0, 0, '5점', 0, 0, 0],
     [0, 1, '조용함', 0, 0, '5점', 0, 0, 0],
     [0, 1, '조용함', 0, 0, '4점', 0, 0, 0 ],
     [23, 1, '조용함', 1, 1, '4점', 0, 0, 0],
     [23, 1, '활동적', 1, 1, '4점', 0, 1, 0],
     [23, 1, '조용함', 1, 0, '4점', 0, 0, 0],
     [0, 1, '조용함', 1, 1, '4점', 0, 0, 0],
     [23, 1, '조용함', 1, 0, '5점', 0, 0, 0],
     [22, 1, '조용함', 1, 0, '5점', 0, 0, 0],
     [0, 1, '활동적', 1, 0, '4점', 0, 0, 0],
     [0, 1, '활동적', 0, 0, '4점', 0, 0, 0],
     [0, 0, '활동적', 0, 0, '4점', 1, 1, 0,],
     [0, 0, '조용함', 1, 0, '4점', 0, 0, 0],
     [0, 0, '조용함', 0, 0, '4점', 0, 0, 0],
     [23, 0, '조용함', 0, 0, '4점', 0, 0, 0],
     [0, 0, '조용함', 0, 0, '5점', 0, 0, 0],
     [0, 0, '조용함', 0, 1, '5점', 0, 0, 0],
     [0, 0, '활발함', 0, 0, '5점', 0, 0, 0],
     [23, 0, '조용함', 0, 0, '4점', 0, 1, 0],
     [0, 1, '조용함', 0, 1, '4점', 0, 0, 0],
     [23, 1, '조용함', 1, 1, '4점', 0, 0, 0],
     [0, 1, '조용함', 1, 0, '5점', 0, 0, 0],
     [0, 1, '조용함', 1, 1, '5점', 0, 0, 0],
     [23, 0, '조용함', 1, 1, '4점', 0, 0, 0],
     [0, 1, '조용함', 1, 1, '4점', 0, 1, 0],
     [22, 0, '조용함', 1, 1, '5점', 0, 1, 0],
     [22, 0, '조용함', 1, 1, '5점', 0, 1, 0],
     [0, 1, '활발함', 1, 1, '5점', 0, 0, 0],
     [23, 1, '활발함', 0, 1, '4점', 0, 0, 1],
     [0, 1, '활발함', 0, 0, '4점', 1, 0, 0],
     [0, 1, '조용함', 1, 0, '4점', 0, 0, 0],
     [23, 0, '조용함', 1, 0, '4점', 0, 0, 0],
     [0, 0, '활발함', 1, 1, '4점', 1, 1, 0],
     [22, 1, '조용함', 0, 0, '4점', 0, 0, 0],
     [23, 1, '조용함', 1, 0, '4점', 0, 0, 0],
     [0, 0, '활발함', 1, 0, '4점', 1, 0, 0],
     [23, 1, '조용함', 0, 0, '4점', 0, 0, 0],
     [0, 1, '조용함', 1, 0, '5점', 0, 0, 0],
     [23, 1, '조용함', 0, 0, '5점', 0, 0, 0],
     [22, 1, '조용함', 1, 0, '5점', 0, 0, 0],
     [23, 1, '조용함', 1, 1, '5점', 0, 0, 0],
     [23, 1, '조용함', 1, 1, '5점', 0, 0, 0],
     [0, 1, '조용함', 1, 0, '5점', 0, 0, 0],
     [0, 1, '조용함', 1, 0, '5점', 0, 0, 0],
     [0, 1, '조용함', 0, 0, '4점', 0, 0, 0],
     [23, 1, '조용함', 0, 0, '4점', 0, 0, 0],
     [23, 1, '조용함', 0, 0, '5점', 0, 0, 0],
     [0, 1, '조용함', 1, 0, '4점', 0, 0, 0],
     [0, 1, '활발함', 1, 0, '4점', 0, 0, 0],
     [23, 1, '조용함', 0, 0, '5점', 0, 0, 0],
     [23, 1, '조용함', 0, 0, '5점', 0, 0, 1],
     [0, 1, '조용함', 0, 0, '4점', 0, 0, 0],
];




var multiple_insert = 'INSERT INTO user_info(sex, age, job , phone_num, kakao_id) VALUES ?;';
  Roommate_DB.query(multiple_insert, [user_info_data], function (err, result) {
    if (err) throw err;
    console.log("user_info data inserted!");
});

var multiple_insert = 'INSERT INTO room_info(room_type, room_location, room_price, utility, roommate_number , wash_set) VALUES ?;';
  Roommate_DB.query(multiple_insert, [room_info_data], function (err, result) {
    if (err) throw err;
    console.log("room_info data inserted!");
});

var multiple_insert = 'INSERT INTO feature_info(quiet_time, avoid_guest, atmosphere , living_share , mixed_place, cleaning, no_party, no_smoking, no_pet) VALUES ?;';
  Roommate_DB.query(multiple_insert, [feature_info_data], function (err, result) {
    if (err) throw err;
    console.log("feature_info data inserted!");
});

});






// Create a Service Wrapper
let conversation = new Conversation(credentials.conversation);

let getConversationResponse = (message, context) => {
  let payload = {
    workspace_id: credentials.conversation.workspace_id,
    context: Object.assign({
      'timezone' : "Asia/Seoul"
    }, context),
    input: message || {}
  };

  if(!payload.context.data){
    payload.context.data = {};
  }

  payload = preProcess(payload);

  return new Promise((resolved, rejected) => {
    // Send the input to the conversation service
    conversation.message(payload, function(err, data) {
      if (err) {
        rejected(err);
      }
      else{
        let processed = postProcess(data);
        if(payload.input.text){
          saveConversation(payload, data);
        }
        
        if(processed){
          // return 값이 Promise 일 경우
          if(typeof processed.then === 'function'){
            processed.then(data => {
              if(data.need_conversation){
                data.need_conversation = false;
                getConversationResponse("", data).then(newData => {
                  resolved(newData)
                });
              }
              else{
                resolved(data); 
              }
            }).catch(err => {
              rejected(err);
            })
          }
          // return 값이 변경된 data일 경우
          else{
            if(!processed.context){
              data.context = processed;
            }
            else{
              data = processed;
            }
            resolved(data);
          }
        }
        else{
          // return 값이 없을 경우
          resolved(data);
        }
      }
    });
  })
}

let postMessage = (req, res) => {
  let message = req.body.input || {};
  let context = req.body.context || {};
  getConversationResponse(message, context).then(data => {
    return res.json(data);
  }).catch(err => {
    return res.status(err.code || 500).json(err);
  });
}

/** 
* 사용자의 메세지를 Watson Conversation 서비스에 전달하기 전에 처리할 코드
* @param  {Object} user input
*/ 
let preProcess = payload => {
  var inputText = payload.input.text; 
  console.log("User Input : " + inputText);
  console.log("Processed Input : " + inputText); 
  console.log("--------------------------------------------------");

  return payload;
}

/** 
 * Watson Conversation 서비스의 응답을 사용자에게 전달하기 전에 처리할 코드 
 * @param  {Object} watson response 
 */ 

let postProcess = response => { 
  console.log("Conversation Output : " + response.output.text);
  console.log("--------------------------------------------------");
  // do something here
  if(response.context.command){
    console.log(response.context.command, response.context.user_key);
    //temp
    if(!response.context.user_key){
      response.context.user_key = 'web'
    }

    return actionHandler.doAction(response.context);
  }
}


/** 
 * 대화 도중 Action을 수행할 필요가 있을 때 처리되는 함수
 * @param  {Object} data : response object
 * @param  {Object} action 
 */ 


let doAction = (data, action) => {

  console.log("Action : " + action.command);
  switch(action.command){

    // 예약요청에 대한 반응
    case "goodbye":
      return goodbye(data, action);
      break;
    case "check":
      return check(data, action);
      break;
    
    default: console.log("Command not supported.")
  }
}



let goodbye = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    Roommate_DB.query('SELECT 1', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);
        
        //   var booker_name = [];
        // results.forEach(function(item){
        //   booker_name.push(item.booker_name)
        // });
        
        data.output.text = "[예약]\n오늘부터 최대 3일 후까지 가능합니다.\n이용하려는 날짜를 알려주세요.\n(예: 0825, 오늘, 다음주 수요일 )";
        resolved(data);
    }
      // connected!
    });
  });
}



// 조회
// let check = (data, action) => {
//  return new Promise((resolved, rejected) => {
//     data.context.action = null;
    
//     Roommate_DB.query('SELECT stu_num, stu_name, phone_num FROM stu_info WHERE major="간호학과"', function (error, results) {
//       if (error) {
//          console.error('error connecting: ' + error.stack);
//          resolved(data);
//       }
//       else{
//         console.log('success: ', results);
//           var stu_num = [];
//           var stu_name = [];
//           var phone_num = [];
//         results.forEach(function(item){
//           stu_num.push(item.stu_num)
//           stu_name.push(item.stu_name)
//           phone_num.push(item.phone_num)
//         });
//         data.output.text = "---------- 학생정보 ----------\n"
//                           +"학번:"+stu_num+"\n"
//                           +"이름:"+stu_name+"\n"
//                           +"연락처:"+phone_num+"\n"
//                           +"------------------------------";
//         resolved(data);
//       }
//       // connected!
//     });

//   };
// }















/**
* Save conversation in cloudant
*/
let saveConversation = (input, output) => {
  db.insert({
    'request' : input,
    'response': output,
    'time' : new Date()
  });
};

module.exports = {
    'initialize': (app, options) => {
        app.post('/api/message', postMessage);
    },
    'getConversationResponse' : getConversationResponse
};

