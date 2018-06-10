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
const config = require('../util/config');
const request = require('request');
const moment = require('moment');

const cloudant = require('../util/db');
const db = cloudant.db['conversation'];
const ajou_db = cloudant.db['ajou'];


ajou_db.connect(function(err) {

  // drop table
  var sql = "DROP TABLE IF EXISTS stu_info";
  ajou_db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table stu_info dropped!");
  });

  var sql = "DROP TABLE IF EXISTS bld_info";
  ajou_db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table bld_info dropped!");
  });

  var sql = "DROP TABLE IF EXISTS book_info";
  ajou_db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table bld_info dropped!");
  });

  // create stu_info table
  if (err) throw err;
  console.log("Connected!");
  var sql = "CREATE TABLE stu_info (stu_num char(9) primary key NOT NULL, stu_name varchar(15) NOT NULL, major varchar(15) NOT NULL, phone_num char(13) NOT NULL) CHARACTER SET utf8";
  ajou_db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table stu_info created!");
  });


  // insert stu_info data
  var data_stu_info = [
       ["201421278","김민정",'생명과학과','010-1234-5678'],
       ['201259024','손송이','건축학과','010-5263-7845'],
       ['201321871','김태영','소프트웨어학과','010-7536-9878'],
       ['201752584','이은영','기계공학과','010-9856-2541'],
       ['201632145','길하은','응용화학생명공학과','010-5562-8952'],
       ['201496327','천상엽','전자공학과','010-3214-7546'],
       ['201485865','이예찬','물리학과', '010-8765-1475'],
       ['201279462','황철민','컴퓨터공학과','010-7963-5551'],
       ['201366475','백건민','산업공학과','010-4412-6538'],
       ['201711243','김지영','경영학과','010-7798-2564'],
       ['201321417','고도연','영어영문학과','010-1448-9857'],
       ['201611122','신강현','사학과','010-7533-2246'],
       ['201521147','최진태','화학과','010-1132-8854'],
       ['201240122','정정화','심리학과','010-5522-6455'],
       ['201330012','이천의','법학과','010-1995-7878'],
       ['201451023','도설규','의학과','010-3338-9977'],
       ['201463211','이세잎','간호학과','010-4487-5331'],
       ['201322631','김현정','행정학과','010-2288-7544'],
       ['201733221','김수진','금융공학과','010-6699-9856'],
       ['201713143','이영희','약학과','010-3556-6622']
    ];
    
  var multiple_insert = 'INSERT INTO stu_info(stu_num, stu_name, major, phone_num) VALUES ?;';
  ajou_db.query(multiple_insert, [data_stu_info], function (err, result) {
    if (err) throw err;
    console.log("stu_info data inserted!");
  });


  // creaete bld_info table
  var sql = "CREATE TABLE bld_info (bld_name varchar(15) NOT NULL, room_num varchar(5) primary key NOT NULL, capacity int NOT NULL, nine boolean NOT NULL, ten boolean NOT NULL, eleven boolean NOT NULL, twelve boolean NOT NULL, thirteen boolean NOT NULL, fourteen boolean NOT NULL, fifteen boolean NOT NULL, sixteen boolean NOT NULL, seventeen boolean NOT NULL, eighteen boolean NOT NULL, nineteen boolean NOT NULL, twenty boolean NOT NULL) CHARACTER SET utf8";
  ajou_db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table bld_info created!");
  });


  // insert bld_info data
  var data_bld_info = [
   ['팔달관', '팔107', 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['팔달관', '팔108', 38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['팔달관', '팔110', 42, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['팔달관', '팔205', 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['팔달관', '팔206', 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['팔달관', '팔310', 46, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['팔달관', '팔311', 34, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['팔달관', '팔505', 36, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['팔달관', '팔506', 34, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['원천정보관', '원정301', 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['원천정보관', '원정302', 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['원천정보관', '원정303', 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['원천정보관', '원정304', 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['원천정보관', '원정305', 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['원천정보관', '원정306', 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['원천정보관', '원정307', 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['원천정보관', '원정308', 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['율곡관', '율B101', 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['율곡관', '율111', 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['율곡관', '율112', 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['율곡관', '율220', 38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['율곡관', '율233', 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['율곡관', '율245', 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['성호관', '성110', 150, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['성호관', '성132', 80, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['성호관', '성202', 38, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['성호관', '성205', 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['성호관', '성210', 45, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['성호관', '성211', 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['다산관', '다B101', 200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['다산관', '다107', 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['다산관', '다108', 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['다산관', '다110', 40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['다산관', '다201', 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['다산관', '다202', 60, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
   ['다산관', '다203', 58, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];

  var multiple_insert = 'INSERT INTO bld_info(bld_name, room_num, capacity, nine, ten, eleven, twelve, thirteen, fourteen, fifteen, sixteen, seventeen, eighteen, nineteen, twenty) VALUES ?;';
  ajou_db.query(multiple_insert, [data_bld_info], function (err, result) {
    if (err) throw err;
    console.log("bld_info data inserted!");
  });



  // creaete book_info table
  var sql = "CREATE TABLE book_info (book_num int auto_increment primary key NOT NULL, booker_num char(9) NOT NULL, booker_name varchar(15) NOT NULL, book_date date NOT NULL, book_bld_name VARCHAR(15) NOT NULL, book_room_num VARCHAR(5) NOT NULL, use_pnum INT NOT NULL, use_stime INT NOT NULL, use_etime INT NOT NULL) CHARACTER SET utf8";
  ajou_db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Table book_info created!");
  });


// insert book_info data
  var data_book_info = [
     ['201463211', '이세잎', '2017-12-08', '성호관', '성110', 5, 11, 13],
     ['201421278', '김민정', '2017-12-11', '원천정보관', '원정304', 3, 18, 20],
     ['201259024', '손송이', '2017-12-08', '팔달관', '팔310', 6, 14, 17],
     ['201240122', '정정화', '2017-12-10', '다산관', '다203', 30, 17, 19],
     ['201485865', '이예찬', '2017-12-07', '성호관', '성211', 20, 10, 11],
     ['201713143', '이영희', '2017-12-09', '원천정보관', '원정303',16, 15, 16],
     ['201733221', '김수진', '2017-12-08', '원천정보관', '원정301', 12, 18, 20],
     ['201366475', '백건민', '2017-12-07', '팔달관', '팔110', 18, 11, 13],
     ['201240122', '정정화', '2017-12-09', '율곡관', '율112', 28, 14, 15],
     ['201711243', '김지영', '2017-12-07', '다산관', '다110', 34, 18, 19],
  ];

  var multiple_insert = 'INSERT INTO book_info(booker_num, booker_name, book_date, book_bld_name, book_room_num, use_pnum, use_stime, use_etime) VALUES ?;';
  ajou_db.query(multiple_insert, [data_book_info], function (err, result) {
    if (err) throw err;
    console.log("book_info data inserted!");
  });

});



// Create a Service Wrapper
let conversation = new Conversation({
  url: 'https://gateway.watsonplatform.net/conversation/api',
  version_date: Conversation.VERSION_DATE_2017_04_21
});

let getConversationResponse = (message, context) => {
  let payload = {
    workspace_id: process.env.WORKSPACE_ID,
    context: context || {},
    input: message || {}
  };

  payload = preProcess(payload);

  return new Promise((resolved, rejected) => {
    // Send the input to the conversation service
    conversation.message(payload, function(err, data) {
      if (err) {
        rejected(err);
        console.log(err)
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
              resolved(data);
            }).catch(err => {
              rejected(err);
            })
          }
          // return 값이 변경된 data일 경우
          else{
            resolved(processed);
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
  if(response.context && response.context.action){
    return doAction(response, response.context.action);
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
    case "answer_rsv_request":
      return answer_rsv_request(data, action);
      break;
    //예약할 날짜 묻기
    case "ask_rsv_date":
      return ask_rsv_date(data, action);
      break;
    // 예약 인원수 묻기
    case "people_num":
      return people_num(data, action);
      break;
    //예약가능한 리스트 보여주기
    case "bookable_list":
      return bookable_list(data, action);
      break;
    // 예약할 강의실 선택
    case "choose_room":
      return choose_room(data, action);
      break;  
    // 학번 묻기    
    case "book_finish":
      return book_finish(data, action);
      break; 
    //조회
    case "reservation_check":
      return reservation_check(data, action);
      break;
    // 취소
    case "reservation_cancel":
      return reservation_cancel(data, action);
      break; 



    case "check-availability":
      return checkAvailability(data, action);
      break;
    case "confirm-reservation":
      return confirmReservation(data, action);
      break;
    // 사용자의 예약 리스트를 가져옵니다.
    case "check-reservation":
      return checkReservation(data, action);
      break;
    // 사용자의 예약 리스트 중 가장 빠른 시간의 예약만 가져옵니다. 
    case "check-next-reservation":
      return checkNextReservation(data, action);
      break;
    // 예약 취소의 목적으로 예약 리스트를 가져옵니다.
    case "check-reservation-for-cancellation":
      return checkReservation(data, action).then(data => {
        if(Array.isArray(data.output.text)){
          data.output.text.unshift("Please tell me the number of the reservation you want to cancel.");
        }
        return data;
      });
      break;
    // 예약을 취소합니다.
    case "confirm-cancellation":
      return confirmCancellation(data, action);
      break;
    default: console.log("Command not supported.")
  }
}



let answer_rsv_request = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    ajou_db.query('SELECT 1', function (error, results) {
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

let ask_rsv_date = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    ajou_db.query('SELECT 1', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);
          var booker_name = [];
        results.forEach(function(item){
          booker_name.push(item.booker_name)
        });
        data.output.text = "[예약]\n네 그럼 12월 11일 월요일로 예약 도와드리겠습니다.\n어떤 건물로 예약하시겠어요?\n(팔달관, 원천정보관, 율곡관, 성호관, 다산관)";
        resolved(data);
    }
      // connected!
    });
  });
}


let people_num = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    ajou_db.query('SELECT 1', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);
          var booker_name = [];
        results.forEach(function(item){
          booker_name.push(item.booker_name)
        });
        data.output.text = "[예약]\n총 몇 명이서 이용 하실 건가요?";
        resolved(data);
    }
      // connected!
    });
  });
}

let bookable_list = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    ajou_db.query('SELECT 1', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);
          var booker_name = [];
        results.forEach(function(item){
          booker_name.push(item.booker_name)
        });
        data.output.text = "[예약]\n요구하신 조건에 예약 가능한 강의실을 알려드릴게요.\n"+"성132, 성202, 성205, 성210\n"+"어떤 강의실을 이용하시겠어요?";
        resolved(data);
    }
      // connected!
    });
  });
}



let choose_room = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    ajou_db.query('SELECT 1', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);
          var booker_name = [];
        results.forEach(function(item){
          booker_name.push(item.booker_name)
        });
        data.output.text = "[예약]\n이제 마지막 단계입니다:D\n"+"예약하시는 분의 이름과 학번을 알려주세요~\n";
        resolved(data);
    }
      // connected!
    });
  });
}


 
// 예약 완료
let book_finish = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    ajou_db.query('INSERT INTO book_info(booker_num,booker_name,book_date,book_bld_name,book_room_num,use_pnum,use_stime,use_etime)VALUES();', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);

        data.output.text = "[예약]\n예약이 완료되었습니다!\n예약을 확인하고 싶으시다면 '조회'라고 쳐보세요~\n바로 취소하고 싶으시다면 '취소'라고 말씀해주세요.\n나중에 또 만나요^^~";
        resolved(data);
    }
      // connected!
    });
  });
}





// 조회
let reservation_check = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    ajou_db.query('SELECT booker_name, book_bld_name, book_room_num, use_stime, use_etime FROM book_info WHERE booker_name="손원철"', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);
          var booker_name = [];
          var book_bld_name = [];
          var book_room_num = [];
          var use_stime = [];
          var use_etime = [];
        results.forEach(function(item){
          booker_name.push(item.booker_name)
          book_bld_name.push(item.book_bld_name)
          book_room_num.push(item.book_room_num)
          use_stime.push(item.use_stime)
          use_etime.push(item.use_etime)
        });
        data.output.text = "---------- 예약정보 ----------\n"
                          +"예약자:"+booker_name+"\n"
                          +"예약한 건물:"+book_bld_name+"\n"
                          +"예약한 강의실:"+book_room_num+"\n"
                          +"예약 시간:"+use_stime+"시 ~ "+use_etime+"시\n"
                          +"------------------------------"
                          +"\n추가 예약은 '예약', 취소는 '취소'라고 말씀해주세요!"
                          +"나중에 또 봐요^^~";
        resolved(data);
      }
      // connected!
    });

  };
}

// 예약 취소
let reservation_cancel = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;

    ajou_db.query('DELETE FROM book_info WHERE booker_name="'data.inputText.booker_name'"', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);
        data.output.text = "예약 취소 되었습니다.";
        resolved(data);
      }
      // connected!
    });
  });
}







// let check_test = (data, action) => {
//  return new Promise((resolved, rejected) => {
//     data.context.action = null;

//     ajou_db.query('SELECT * FROM stu_info where major="건축학과" ORDER BY major ASC', function (error, results) {
//       if (error) {
//          console.error('error connecting: ' + error.stack);
//          resolved(data);
//       }
//       else{
//         console.log('success: ', results);
//         var list = [];
//         results.forEach(function(item){
//           list.push(item.name)
//         });
//         data.output.text = list.join("\n");
//         resolved(data);
//       }
//       // connected!
//     });
//   });

// }

// let test = (data, action) => {
//  return new Promise((resolved, rejected) => {
//     data.context.action = null;

//     // ajou_db.connect(function(err) {
//     //   if (err) {
//     //     console.error('error connecting: ' + err.stack);
//     //     resolved(data);
//     //   }
//     //   else{
//     //     console.log('connected as id ' + ajou_db.threadId);
//     //     resolved(data);
//     //   }
//     // });
    
//     ajou_db.query('INSERT INTO words(word) VALUES("ajou university")', function (error, results, fields) {
//       if (error) {
//          console.error('error connecting: ' + error.stack);
//          resolved(data);
//       }
//       else{
//         console.log('success: ', results, fields);
//         resolved(data);
//       }
//       // connected!
//     });


//   });
// }





/** 
 * 회의실의 예약 가능 여부를 체크하는 함수
 * @param  {Object} data : response object
 * @param  {Object} action 
 */ 
let checkAvailability = (data, action) => {

  // Context로부터 필요한 값을 추출합니다.
  let date = action.date;
  let startTime = action.start_time;
  let endTime = action.end_time;

  // 날짜 값과 시간 값을 조합하여 시작 시간과 종료 시간을 Timestamp 형태로 변환합니다.
  let startTimestamp = new moment(date+"T"+startTime+"+0900");
  let endTimestamp = new moment(date+"T"+endTime+"+0900");
  
  // roomid는 편의상 하드코딩 합니다.
  let roomid = 'room1/camomile';

  // /freebusy/room은 roomid, start, end 값을 query parameter로 받아 해당 룸의 가용성을 리턴하는 api입니다.
  let reqOption = {
    method : 'GET',
    url : process.env.RBS_URL + '/freebusy/room',
    headers : {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    qs : {
      'roomid' : roomid,
      'start' : startTimestamp.valueOf(),
      'end' : endTimestamp.valueOf()
    }
  };
  
  return new Promise((resolved, rejected) => {
    request(reqOption, (err, res, body) => {
      data.context.action = null;
      if(err){
        rejected(err);
      }
      body = JSON.parse(body);

      console.log(body)

      // body.freebusy 의 length가 0보다 크면 기존에 예약정보가 있다는 의미로 해당 시간에 룸이 이미 예약되어 있음을 의미합니다. 그게 아니라면 해당 룸은 사용 가능한 상태입니다.
      if(body.freebusy && body.freebusy.length > 0){
        data.context.availability = null;

        getConversationResponse("", data.context).then(data => {
          resolved(data);
        });
      }
      else{
        data.context.availability = "available";
        
        getConversationResponse("", data.context).then(data => {
          resolved(data);
        });
      }
    })
  });
}



/**
 * Make reservation
 * @param  {Object} data : response object
 * @param  {Object} action
 */

let confirmReservation = (data, action) =>{

  // context에서 필요한 값을 추출합니다.
  let date = action.date;
  let startTime = action.start_time;
  let endTime = action.end_time;

  console.log(action)

  // user
  let user = data.context.user_key;

  let startTimestamp = new moment(date+"T"+startTime+"+0900");
  let endTimestamp = new moment(date+"T"+endTime+"+0900");

  // 편의를 위해 site, room, purpose 및 attendees 정보는 하드코딩되어있습니다.
  let reqOption = {
    method : 'POST',
    url : process.env.RBS_URL + '/book',
    headers : {
      'Accept': 'application/json',
      'Content-Type': 'application/json' //'application/x-www-form-urlencoded'
    },
    json : {
      "roomid": 'room1/camomile',
      "start" : startTimestamp.valueOf(),
      "end" : endTimestamp.valueOf(),
      "purpose": "quick review",
      "attendees": 5,
      "user" : {
        "userid": user
      }
    }
  };

  return new Promise((resolved, rejected) => {
    request(reqOption, (err, res, body) => {
      data.context.action = null;
      console.log(reqOption, body);
      if(err || res.statusCode > 300){
        data.context.result = null;

        getConversationResponse("", data.context).then(data => {
          resolved(data);
        });
      }
      else{
        data.context.result = "success";

        getConversationResponse("", data.context).then(data => {
          resolved(data);
        });
      }
      
    })
  });
}

/** 
 * 사용자의 회의실 예약 리스트를 가져오는 함수
 * @param  {Object} data : response object
 * @param  {Object} action 
 */ 
let checkReservation = (data, action) => {
  // context에서 필요한 값을 추출합니다.
  let date = action.date;
  let startTime = action.start_time;
  let endTime = action.end_time;

  // 날짜 값과 시간 값을 조합하여 시작 시간과 종료 시간을 Timestamp 형태로 변환합니다. 편의를 위해 종료 시간이 따로 명시되지 않는 경우 시작 시간에서 1개월 후로 설정하도록 합니다.
  let startTimestamp = new moment();
  if(startTime){
    startTimestamp = new moment(date+"T"+startTime+"+0900");
  }
  let endTimestamp = new moment(startTimestamp).month(startTimestamp.month() + 1);
  if(endTime){
    endTimestamp = new moment(date+"T"+endTime+"+0900");
  }

  // /book/search/byuser API는 site id, user id, start time, end time을 Query parameter로 받아 해당 시간에 사용자의 예약 리스트를 return해주는 api입니다.
  let reqOption = {
    method : 'GET',
    url : process.env.RBS_URL + '/book/search/byuser',
    headers : {
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    qs : {
    "siteid" : "camomile",
    "userid" : data.context.user_key,
    "start" : startTimestamp.valueOf(),
    "end" : endTimestamp.valueOf()
    }
  };
  
  return new Promise((resolved, rejected) => {
    request(reqOption, (err, res, body) => {
      data.context.action = null;
      if(err){
        rejected(err);
      }
      body = JSON.parse(body);
      // body 의 length가 0보다 크면 기존에 예약정보가 있다는 의미입니다.
      if(body && body.length > 0){
        let resvs = [];
        let index = 0;
        for(let resv of body){
          //예약 목록을 사용자가 볼 수 있는 형태로 변환하여 resvs 변수에 저장합니다.
          resvs.push((++index) + ": " + moment(resv.start).utcOffset('+0900').format(config.dateTimeFormat) + " ~ " + moment(resv.end).utcOffset('+0900').format(config.dateTimeFormat) + ", " + resv.roomid + ", " + resv.purpose);
        }
        //예약 목록을 Context에 저장합니다.
        data.context.reservations = body;
        //사용자에게 보여줄 예약 목록은 Output에 저장합니다.
        data.output.text = resvs;
      }
      else{
        data.output.text = ["Your reservation is not found."];
      }
      resolved(data);
    })
  });
}

let checkNextReservation = (data, action) => {
  return checkReservation(data, action).then(data => {
    if(data.output.text && Array.isArray(data.output.text)) data.output.text = data.output.text[0];
    return data
  });
}

/** 
 * 회의실 취소
 * @param  {Object} data : response object
 * @param  {Object} action 
 */ 
let confirmCancellation = (data, action) => {
  // user 정보는 action 정보에 담겨있지 않으므로 data에서 추출합니다.
  let user = data.context.user_key;
  let eventId = data.context.eventid;
  let reservations = data.context.reservations;
  let index = data.context.removeIndex;

  let reqOption = {
    method : 'DELETE',
    url : process.env.RBS_URL + '/book',
    headers : {
      'Accept': 'text/plain',//'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    qs : {
      "eventid" : reservations[index].id,
      "userid" : user,
      "roomid" : reservations[index].roomid
    }
  };

  return new Promise((resolved, rejected) => {
    request(reqOption, (err, res, body) => {
      data.context.action = null;
      if (res.statusCode >= 300) {
        data.output.text = "Your request is not successful. Please try again."
      }
      resolved(data);
    })
  });
}

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




