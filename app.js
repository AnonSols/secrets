require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
const mongoose = require('mongoose');
const app = express();
const encrypt = require('mongoose-encryption');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine','ejs')
mongoose.connect('mongodb://localhost:27017/userDB');

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:(1,'Please input your email')
    },
    password:{
        type:String,
        required:(1,'Please input your password'),min:5,
        max:20,
    }
})

const secret = process.env.SECRET;
userSchema.plugin(encrypt, {secret:secret, encryptedFields: ["password"]})

const User = new mongoose.model('user',userSchema);

app.get('/',(req,res)=>{
    res.render('home')
});

app.route('/register')

.get((req,res)=>{
res.render('register')
})

.post((req,res)=>{

const email = req.body.username;
const password = req.body.password;

const newUser = new User({
    email:email,
    password:password,
    
})
newUser.save(err=>{
  return new Promise((resolve,reject)=>{
    if(!err){
        res.render('secrets');
        resolve('It has been added to the database successfully')
    }else{
        reject(err)
    }
   }).then(value => console.log(value)).catch(err => console.log(err));
});

console.log(`Your email is : ${email}
Your password is : ${password}`)

});

app.route("/login") 

.get((req,res)=>{
res.render('login')
})

.post((req,res)=>{
    const email = req.body.username;
    const password = req.body.password;
 User.findOne({email:email},(err,foundUser)=>{
    if(!err){
     new Promise((resolve,reject)=>{
        if(foundUser){
            if(foundUser.password === password){
              resolve(res.render('secrets'))
            }else{
               console.log('Unrecognized credentials!')
               reject(res.redirect('/login'))
            }
           }else{
               console.log('This email is not found in the database!')
               res.redirect('/login')
           }
     }).then(value => {
        return value;
     }).catch(err => {
        return err;
     })
       
    }else{
        console.log(err);
    }
 })

})

app.listen(process.env.PORT || 3000, ()=>{
    console.log('Port is listening on 3000')
})

// const LoginEmail = User.findOne({email:email},(err,value)=>{
//     new Promise((resolve,reject)=>{
//         if(!err){
//             resolve(res.render('/secrets'))
//         }else{
//             reject(err);
//         }
//     }).then(value=>{
//         return(value);
//     }).catch(err=>{
//         console.log(err)
//         res.render('home');
//     })
//  })
