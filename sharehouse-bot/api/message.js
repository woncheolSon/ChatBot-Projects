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
  
  var sql = "select 1";
  Roommate_DB.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Shareroom database successfully connected!");
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
 
    case "owner_answer_1":
      return owner_answer_1(data, action);
      break;
    case "owner_answer_2":
      return owner_answer_2(data, action);
      break;
    case "owner_answer_3":
      return owner_answer_3(data, action);
      break;
    case "tenant_answer_1":
      return tenant_answer_1(data, action);
      break;
    case "tenant_answer_2":
      return tenant_answer_2(data, action);
      break;
    case "tenant_answer_3":
      return tenant_answer_3(data, action);
      break;
    case "tenant_show_true_result":
      return tenant_show_true_result(data, action);
      break;
    case "tenant_show_false_result":
      return tenant_show_false_result(data, action);
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



 


// Owner_answer 시에 Owner 첫번째 구글폼 넘겨주기
let owner_answer_1 = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    Roommate_DB.query('SELECT 1', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);

        data.output.text = "네, Owner 이시군요! 반갑습니다^^"
                          +"\n그렇다면 이제 총 3번의 설문에 대해 답변을 해주셔야 합니다."
                          +"\n먼저 Owner님의 기본정보에 대해 알려주세요! "
                          +"\n\nhttps://docs.google.com/forms/d/1pka3nuFofFamnQzoCCL2t4TOmWyrOpQrhxDBZSUyTHg/edit?usp=drive_web"
                          +"\n\n첫번째 설문 작성을 마치셨다면, \n*반드시* 'owner 1 완료' 와 같이 알려주세요~~";
                          
        resolved(data);
    }
      // connected!
    });
  });
}



// Owner_answer 시에 Owner 두번째 구글폼 넘겨주기
let owner_answer_2 = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    Roommate_DB.query('SELECT 1', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);

        data.output.text = "이제 두번째로, 내놓으실 집의 기본정보에 대해 알려주세요! "
                          +"\n\nhttps://docs.google.com/forms/d/1Z60Ehn8s3aPoUcbnUi8oQFfJgeRLzoRcrXyBhctXoMM/edit?usp=drive_web"
                          +"\n\n두번째 설문 작성을 마치셨다면, \n*반드시* 'owner 2 완료' 와 같이 알려주세요~~";
                          
        resolved(data);
    }
      // connected!
    });
  });
}



// Owner_answer 시에 Owner 세번째 구글폼 넘겨주기
let owner_answer_3 = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    Roommate_DB.query('SELECT 1', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);

        data.output.text = "그럼 마지막으로, 집의 분위기나 룸메이트 정보에 대해 알려주세요! "
                          +"\n\nhttps://docs.google.com/forms/d/1myTSwldWq1GaKAUYBF-jq9VKuEM8ceyBokMQNF_7sK8/edit"
                          +"\n\n세번째 설문까지 작성을 마치셨다면, \n*반드시* 'owner 3 완료' 와 같이 알려주세요~~";
                        
        resolved(data);
    }
      // connected!
    });
  });
}



// tenant_answer 시에 Owner 첫번째 구글폼 넘겨주기
let tenant_answer_1 = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    Roommate_DB.query('SELECT 1', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);

        data.output.text = "네, Tenant 이시군요! 반갑습니다^^"
                          +"\n그렇다면 이제 총 3번의 설문에 대해 답변을 해주셔야 합니다."
                          +"\n먼저 Tenant님의 기본정보에 대해 알려주세요! "
                          +"\n\nhttps://docs.google.com/forms/d/1oQbbEleqIwn7o0lDEtIojHTawnDIQUezOc4_wqMQ4cI/edit?usp=drive_web"
                          +"\n\n첫번째 설문 작성을 마치셨다면, \n*반드시* 'tenant 1 완료' 와 같이 알려주세요~~";
                          
        resolved(data);
    }
      // connected!
    });
  });
}



// tenant_answer 시에 Owner 두번째 구글폼 넘겨주기
let tenant_answer_2 = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    Roommate_DB.query('SELECT 1', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);

        data.output.text = "이제 두번째로, 원하시는 집에 대한 기본정보를 알려주세요! "
                          +"\n\nhttps://docs.google.com/forms/d/1Dkhiatd-5ibOOk4gBWVuQsHTLcZIfcxP4OkLT0nrkjs/edit"
                          +"\n\n두번째 설문 작성을 마치셨다면, \n*반드시* 'tenant 2 완료' 와 같이 알려주세요~~";
                          
        resolved(data);
    }
      // connected!
    });
  });
}



// tenant_answer 시에 Owner 세번째 구글폼 넘겨주기
let tenant_answer_3 = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;
    
    Roommate_DB.query('SELECT 1', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);

        data.output.text = "그럼 마지막으로, 원하시는 집의 분위기나 룸메이트 정보에 대해 알려주세요! "
                          +"\n\nhttps://docs.google.com/forms/d/1uH68ObwPTs2xR-njP61_3ESZQTE9lSyrjgmJoGQu3VQ/edit"
                          +"\n\n세번째 설문까지 작성을 마치셨다면, \n*반드시* 'tenant 3 완료' 와 같이 알려주세요~~";
                          
        resolved(data);
    }
      // connected!
    });
  });
}




// tenant 매칭 결과 조회
let tenant_show_true_result = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;

    Roommate_DB.query('select sex, age, job, phone, kakao from owner_user_info where id=56', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);
          var sex = [];
          var age = [];
          var job = [];
          var phone = [];
          var kakao = [];

        results.forEach(function(item){
          sex.push(item.sex)
          age.push(item.age)
          job.push(item.job)
          phone.push(item.phone)
          kakao.push(item.kakao)
        });
        data.output.text = "세입자께서 질문지에 응답하신 답변에 최적화된 결과를 보여드릴게요!\n"
                          +"---------- 사용자 정보 ----------\n"
                          +"성별:"+sex+"\n"
                          +"나이:"+age+"\n"
                          +"직업:"+job+"\n"
                          +"연락처:"+phone+"\n"
                          +"카카오톡ID:"+kakao+"\n"
                          +"------------------------------"+"\n"
                          +"대화를 마치시려면 작별인사를 해주세요.";
        resolved(data);
      }
      // connected!
    });
  });
}





let tenant_show_false_result = (data, action) => {
 return new Promise((resolved, rejected) => {
    data.context.action = null;

    Roommate_DB.query('select sex, age, job, phone, kakao from owner_user_info where id between 45 and 48', function (error, results) {
      if (error) {
         console.error('error connecting: ' + error.stack);
         resolved(data);
      }
      else{
        console.log('success: ', results);
          var sex = [];
          var age = [];
          var job = [];
          var phone = [];
          var kakao = [];

        results.forEach(function(item){
          sex.push(item.sex)
          age.push(item.age)
          job.push(item.job)
          phone.push(item.phone)
          kakao.push(item.kakao)
        });
        data.output.text = "아쉽지만 유저님이 원하시는 조건에 꼭 맞는 매칭결과가 나타나지 않습니다.\n"
                          +"그 대신 유저님과 비슷한 성향의 유저를 추천해드릴게요!\n"
                          +"---------- 사용자 정보 ----------\n"
                          +"성별:"+sex[0]+"\n"
                          +"나이:"+age[0]+"\n"
                          +"직업:"+job[0]+"\n"
                          +"연락처:"+phone[0]+"\n"
                          +"카카오톡ID:"+kakao[0]+"\n"
                          +"--------------------------------"+"\n"
                          +"성별:"+sex[1]+"\n"
                          +"나이:"+age[1]+"\n"
                          +"직업:"+job[1]+"\n"
                          +"연락처:"+phone[1]+"\n"
                          +"카카오톡ID:"+kakao[1]+"\n"
                          +"--------------------------------"+"\n"
                          +"성별:"+sex[2]+"\n"
                          +"나이:"+age[2]+"\n"
                          +"직업:"+job[2]+"\n"
                          +"연락처:"+phone[2]+"\n"
                          +"카카오톡ID:"+kakao[2]+"\n"
                          +"--------------------------------"+"\n"
                          +"성별:"+sex[3]+"\n"
                          +"나이:"+age[3]+"\n"
                          +"직업:"+job[3]+"\n"
                          +"연락처:"+phone[3]+"\n"
                          +"카카오톡ID:"+kakao[3]+"\n"
                          +"--------------------------------"+"\n"
                          +"대화를 마치시려면 작별인사를 해주세요.";
        resolved(data);
      }
      // connected!
    });
  });
}













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




