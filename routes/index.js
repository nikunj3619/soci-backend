var express = require('express');
var router = express.Router();
const path = require('path');
const {v4:uuid} = require("uuid");
const localStrategy = require("passport-local")
const societies = require('./users');
const visitors = require('./visitors')
const passport = require('passport');
const { read } = require('fs');
const qr = require('qrcode');
const { ObjectId } = require('mongodb');

passport.use(new localStrategy(societies.authenticate()));



router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/qrcode',isLoggedIn, async(req, res) => {
  const societyId = await societies.findOne({username : req.session.passport.user});
  const token = societyId._id.toString();
  const websiteUrl = 'http://localhost:3000/signin-qrcode'; 
  const qrCodeUrl = `${websiteUrl}?token=${token}`;
  qr.toDataURL(qrCodeUrl, (err, url) => {
    if (err) {
      res.status(500).send('Error generating QR code');
    } else {
      res.send(`<img src="${url}" alt="QR Code">`);
    }
  });
});

router.get('/signin-qrcode',tokenauth, function(req, res){
  res.redirect("/entry")
});

router.get('/pass', function(req, res, next) {
  res.send('I am Pass');
});

router.get('/entry', isLoggedIn, function(req, res, next) {
  res.render('entry');
  
});

router.get('/profile',isLoggedIn, async function(req, res, next) {
  const soc = await societies.findOne({name: req.session.passport.user}).populate("visitor");
  res.render('profile', {soc});
});

router.get('/signup', function(req, res, next) {
  res.render('signup');
});

router.post("/register", function(req, res){
  var societydata = new societies({
    name: req.body.name,
    username: req.body.username,
    address: req.body.address
  });
  societies.register(societydata, req.body.password).then(function(registeredSociety){
    passport.authenticate('local')(req, res, function(){
      res.redirect('/profile');
    })
  })
});

router.post('/login', passport.authenticate(
  "local", {
    successRedirect: "/profile",
    failureRedirect: "/"
  }
), function(req, res){});

router.get('/logout', function(req, res, next) {
  req.logout(function(err){
    if(err){return next(err);}
    res.redirect("/");
  });
});

// router.post('/entry',isLoggedIn, async function(req, res, next) {
//   console.log(req)
  
//   if (!req.files || Object.keys(req.files).length === 0) {
//       return res.status(400).send('No files were uploaded.');
//   }

//   // The name of the input field (i.e., "photo") is used to retrieve the uploaded file
  
//   let photo = req.files.photo;

//   // Move the uploaded file to a directory on the server
//   const uploadDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
//   const filename = uuid()+".png"
//   const filePath = path.join(uploadDir, filename);
//   photo.mv(filePath, function(err) {
//       if (err) {
//           return res.status(500).send(err);
//       }
//       // File uploaded successfully
//       // res.send('File uploaded!');
//   });

//   const society = await societies.findOne({name : req.session.passport.user})
//   const visitor = await visitors.create({
//     name: req.body.name,
//     membername: req.body.membername,
//     contact: req.body.contact,
//     selfie: filename,
//     sid: society._id
//   });

//   await visitor.save()

//   console.log(visitor)

//   res.redirect("/profile")

// });



router.post('/entry', isLoggedIn, async function(req, res, next) {
  //try {
    
    
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    
    let photo = req.files.photo;

    const uploadDir = path.join(__dirname, '..', 'public', 'images', 'uploads');
    const filename = uuid() + ".png";
    const filePath = path.join(uploadDir, filename);
    await photo.mv(filePath, async function(err) {
        if (err) {
            console.error("Error uploading file:", err);
            return res.status(500).send(err);
        }
        // File uploaded successfully

        const society = await societies.findOne({ name: req.session.passport.user });
        if (!society) {
            console.error("Society not found:", req.session.passport.user);
            return res.status(404).send("Society not found.");
        }

        const visitor = await visitors.create({
            name: req.body.name,
            membername: req.body.membername,
            contact: req.body.contact,
            selfie: filename,
            sid: society._id
        });
        society.visitor.push(visitor._id)

        await society.save();
        res.redirect('/')

        //console.log("Visitor created:", visitor);
        
    })
    
  //} 
  // catch (error) {
  //   console.error("Error in /entry route:", error);
  //   res.status(500).send("Internal Server Error");
  // }

});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/");
}


async function tokenauth(req, res, next){

  
      const token = req.query.token;
      console.log(token);
      const soc = await societies.findOne({_id: token})
      if (soc) {
        // User found, authenticate
        req.login(soc, (err) => {
          if (err) {
            console.error('Error logging in:', err);
            res.status(500).send('Internal Server Error');
          } else {
            // Redirect user after successful authentication
            res.redirect('/entry');
          }
        });
      } else {
        // User not found, redirect to login page
        res.redirect('/');
      }
}



module.exports = router;