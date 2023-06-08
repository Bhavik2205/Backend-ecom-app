const axios = require('axios');
const jwt = require('jsonwebtoken');
const shiprocketModel = require('../models/shiprocketModel');
const mongoose = require('mongoose');

function generateRandomNumber() {
    let digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    let result = "";
  
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      result += digits[randomIndex];
      digits.splice(randomIndex, 1);
    }
  
    return result;
  }

  const generateAuthToken = async () => {
    const authConfig = {
      email: 'ayushr418@gmail.com',
      password: 'Ayush@123',
    };
    const response = await axios.post(
      'https://apiv2.shiprocket.in/v1/external/auth/login',
      authConfig
    );
    const authToken = response.data.token;
    const authTokenExpiry = new Date(
      Date.now() + response.data.expires_in * 1000
    );
    const ship = await shiprocketModel.findOne({});
    if(ship){
      await userModel.findOneAndUpdate(
        { _id: ship._id },
        req.body
      );
    }
    else{
      await shiprocketModel.create({token: authToken,expireDate:authTokenExpiry})
    }
    return authToken;
  };
  function queryModifier(filter) {
    // console.log("Query Modifier");
    let newFilter = {}, q;
    let fromTo = { "from": "$gte", "to": "$lte" };
    for (var k in filter) {
        switch (typeof filter[k]) {

            case "string":
                if ((k.search('From-') > -1 || k.search('from-') > -1) && filter[k] != ' ') {
                    let f = k.split('-')
                    q = fromTo[f[0]]          //k = field   //q=fromTo["from"]    q=$gt
                    if (newFilter[[f[1]]] == undefined) {
                        newFilter[[f[1]]] = {};
                    }
                    newFilter[[f[1]]][q] = new Date(filter[k]);     //date : {$gt : 12/12/2009}
                }
                else if ((k.search('To-') > -1) || (k.search('to-') > -1) && filter[k] != ' ') {
                    let f = k.split('-')
                    q = fromTo[f[0]]          //k = field   //q=fromTo["to"]    q=$gt
                    if (newFilter[[f[1]]] == undefined) {
                        newFilter[[f[1]]] = {};
                    }
                    newFilter[[f[1]]][q] = new Date(filter[k]);    //date : {$gt : 12/12/2009}
                }
                else if ((k.search('date') > -1 || k.search('Date') > -1) && filter[k] != ' ') {
                    newFilter[[k]] = new Date(filter[k]);
                }
                else if ((k.search('objectid') > -1 || k.search('objectId') > -1) && filter[k] != ' ' && filter[k].length > 0) {
                    let splitter = k.split('-')[0];
                    newFilter[[splitter]] = new mongoose.Types.ObjectId(filter[k]);
                }
                else if ((k.search('-id') > -1 || k.search('-Id') > -1) && filter[k] != ' ') {
                    let splitter = k.split('-')[0];
                    if(filter[k] != '')
                        newFilter[[splitter]] = filter[k];
                }
                else {
                    /* let index = filter[k].search(/[\(\)\-\]\[\|\@\^\&\*\!\`\$\#\.\+\=\_\~\?\/\\]/gi);
                     if (index>=0) {
                         newFilter[[k]] = {
                             '$regex': filter[k].split(filter[k].charAt(index))[0],
                             '$options': "ims"
                         }
                     }
                     else {
                     */
                    if(filter[k] != '')
                        newFilter[[k]] = {
                            '$regex': filter[k],
                            '$options': "ims"
                        }
                    //}

                }
                break;

            
            // case "object":
            //     newFilter[[k]] = new Date(filter[k]);
            //     break;

            case "number":
                if (k.search('-') > -1) {
                    let f = k.split('-')
                    q = fromTo[f[0]]          //k = field   //q=fromTo["from"]    q=$gt
                    if (newFilter[[f[1]]] == undefined) {
                        newFilter[[f[1]]] = {};
                    }
                    newFilter[[f[1]]][q] = filter[k];    //price : {$gt : 1000}
                } else {
                    newFilter[[k]] = filter[k]
                }


                // if(q){

                // }
                // else{
                //     newFilter[[k]] = {
                //         '$regex': filter[k],
                //         '$options': "ims"
                //     }
                // }

                // newFilter[[k]] = filter[k]
                break;

            case "object":
                if (filter[k] && filter[k]['$in'] && !filter[k]['$in'].length) {
                }
                else if (filter[k] && filter[k]['$nin'] && !filter[k]['$nin'].length) {
                    
                } else {
                    newFilter[[k]] = filter[k]
                }
                break;
            case "boolean":
            case "array":
            default:
                newFilter[[k]] = filter[k]
        }
    }
    return newFilter;
}
function areObjectsEqual(obj1, obj2) {
    // Check if the objects have the same number of properties
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }
  
    // Compare the key-value pairs of the objects
    for (let key in obj1) {
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
  
    return true;
  }

  function isObjectInArray(array1, array2) {
    // Iterate over the elements of array1
    for (let obj1 of array1) {
      // Check if obj1 exists in array2
      let found = false;
      for (let obj2 of array2) {
        if (areObjectsEqual(obj1, obj2)) {
          found = true;
          break;
        }
      }
  
      if (!found) {
        return false;
      }
    }
  
    return true;
  }
  
  module.exports = { generateRandomNumber,generateAuthToken,queryModifier,isObjectInArray}