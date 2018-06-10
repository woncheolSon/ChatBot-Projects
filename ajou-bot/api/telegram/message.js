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

const conversation = require('../message');
const config = require('../../util/config');
const cloudant = require('../../util/db');
const TelegramBot = require('node-telegram-bot');

const db = cloudant.db['context'];
const token = process.env.TELEGRAM_TOKEN;


let bot = new TelegramBot({  
  'token' : token
});

bot.on('message', msg => { 
  let user_key = msg.chat.id;
  let content = {
          text : msg.text
  };
  db.get(user_key).then(doc =>{
          conversation.getConversationResponse(content, doc.context).then(data => { 
    db.insert(Object.assign(doc, {
            'context': Object.assign(data.context, {
      'timezone' : "Asia/Seoul"
            }),
    })); 
    bot.sendMessage({
            'chat_id': user_key,
             'text': getOutputText(data)
    });
        }).catch(err => {
    bot.sendMessage({
            'chat_id': user_key,
             'text': JSON.stringify(err.message)
    });
          });
       }).catch(err => {    // first communication
          conversation.getConversationResponse(content, {}).then(data => { 
    db.insert({
            '_id' : user_key+"", // cloudant의 doc id는 반드시 string 타입이어야 합니다.        
            'user_key' : user_key+"",
            'context': data.context,
            'type' : 'telegram'
    });
    bot.sendMessage({
            'chat_id': user_key,
             'text': getOutputText(data)
    });
          }).catch(err => {
    bot.sendMessage({
            'chat_id': user_key,
             'text': JSON.stringify(err.message)
    });
          });
        });
});

bot.start()

function getOutputText(data){
  var output = data.output;
  if(output.text && Array.isArray(output.text)){
          return output.text.join('\\n');
  }else if(output.text){ 
    return output.text;
  }  else return "";
}