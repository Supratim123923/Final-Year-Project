const express = require("express");
const spawner = require('child_process').spawn;
const path = require("path");
const app = express();
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
const crypto = require("crypto");
var Session = require("express-session");
const db = require("./DbConnect");
const jwt = require("jsonwebtoken");
var multer  =   require('multer');  
const secretkey = "scretkey";
var Token = null;
const port = 5000;
//Session Srttings
// creating 24 hours from milliseconds
const oneMin = 5000 * 60;
var chktoken;
//2023-05-21T06:42:32.708Z
//session middleware
app.use(
  Session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneMin },
    resave: false,
  })
);

// Static Files
app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
//for cookieparser
//console.log(__dirname);
// Email Format Checking
function Checkemail(email) {
  var validRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

  if (email.match(validRegex)) {
    //document.form1.text1.focus();

    return true;
  } else {
    console.warn("Invalid email address!");

    //document.form1.text1.focus();

    return false;
  }
}
const viewPath = path.join(__dirname, "/static/views");
//console.log(viewPath);
// Specific folder example
//app.use("/css", express.static(__dirname + "static/css"));
//app.use("/html", express.static(__dirname + "static/html"));
//app.use("/public", express.static(__dirname + "static/public"));

// Set View's
app.set("views", viewPath);
app.set("view engine", "hbs");

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/Register", (req, res) => {
  res.render("Register");

  //
  //res.render("Register");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/Error", (req, res) => {
  res.render("Error");
});
app.get("/pricing", (req, res) => {
  res.render("pricing");
});
app.get("/PrivacyPolicy", (req, res) => {
  res.render("PrivacyPolicy");
});
app.get("/contact", (req, res) => {
  res.render("contact");
});
app.get("/RememberPassword", (req, res) => {
  res.render("RememberPassword");
});
app.get("/AboutUs", (req, res) => {
  res.render("AboutUs.hbs");
});
app.post("/register", (req, res) => {
  var email = req.body.email;
  if (Checkemail(email)) {
    var password = req.body.password;
    console.log(email);
    console.log(password);
    var sql = `INSERT INTO Users ( Email, Password) VALUES ("${email}", "${password}")`;
    db.query(sql, function (err, result) {
      if (err) throw err;
      console.log("Row has been updated");
    });
    res.render("login");
  }
});

app.post("/login", (req, res) => {
  if (Checkemail(req.body.email)) {
    let existingUser;

    var sql = `SELECT * from Users where Email = "${req.body.email}"`;
    existingUser = sql;
    //session = req.session;
    db.query(sql, function (err, result) {
      if (err) throw err;
      if (result[0].Password == req.body.password) {
        // var eml = req.body.email;
        //  Token = jwt.sign({ eml }, "mynameissupratimsinhaofbtech", {
        //   expiresIn: "180 seconds",
        let token;
        try {
          //Creating jwt token
          token = jwt.sign(
            { userId: result[0].id, email: result[0].Email },
            "secretkeyappearshere",
            { expiresIn: "1h" }
          );
          chktoken = token;
          console.log(chktoken);
        } catch (err) {
          console.log(err);
          const error = new Error("Error! Something went wrong.");
          return next(error);
        }
        res.render("DashboardDesktopTablet")
        // res.status(200).json({
        //   success: true,
        //   data: {
        //     userId: result[0].id,
        //     email: result[0].Email,
        //     token: token,
        //   },
        // });
      } else console.warn("Wrong cred");
    });
  }
});

console.log(chktoken);
// app.post("/login", async (req, res, next) => {
//   let { email, password } = req.body;

//   let existingUser;
//   try {
//     existingUser = await User.findOne({ email: email });
//   } catch {
//     const error = new Error("Error! Something went wrong.");
//     return next(error);
//   }
//   if (!existingUser || existingUser.password != password) {
//     const error = Error("Wrong details please check at once");
//     return next(error);
//   }
//   let token;
//   try {
//     //Creating jwt token
//     token = jwt.sign(
//       { userId: existingUser.id, email: existingUser.email },
//       "secretkeyappearshere",
//       { expiresIn: "1h" }
//     );
//   } catch (err) {
//     console.log(err);
//     const error = new Error("Error! Something went wrong.");
//     return next(error);
//   }

//   res
//     .status(200)
//     .json({
//       success: true,
//       data: {
//         userId: existingUser.id,
//         email: existingUser.email,
//         token: token,
//       },
//     });
// });

// const authenticateToken = (req, res, next) => {
//   const tok = req.-
//   const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
//   if (!token) {
//     return res.sendStatus(401); // Unauthorized
//   }

//   jwt.verify(token, 'mynameissupratimsinhaofbtech', (err, user) => {
//     if (err) {
//       return res.sendStatus(403); // Forbidden
//     }

//     req.user = user;
//     next();
//   });
// };

app.get("/abc", (req, res) => {
  //  Session = req.session;
  // if (Session.userId) {
  //   console.log()
  console.log(chktoken);
  //Authorization: 'Bearer TOKEN'
  if (!chktoken) {
    res
      .status(200)
      .json({ success: false, message: "Error! Token was not provided" });
  }
  //Decoding the token
  const decodedToken = jwt.verify(chktoken, "secretkeyappearshere");
  console.log(decodedToken);
  if (decodedToken) res.render("abc");
  else res.render("login");
});

// app.post("/abc", verifyToken, (req, res) => {
//   if (err) {
//     res.render("login");
//     console.log("Invaild User");
//   } else {
//     res.render("abc");
//   }
// });

// contact details saving
app.post("/contact", (req, res) => {
  var email = req.body.email;
  var phone = req.body.pno;
  var messg = req.body.textbox;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var sql = `INSERT INTO Usersdetails ( FirstName, LastName,Email,PhoneNo,Message) VALUES ("${firstname}", "${lastname}","${email}","${phone}","${messg}")`;
  db.query(sql, function (err, result) {
    if (err) throw err;
    console.log("Contact Details saved");
  });
  res.render("index");
});

// function verifyToken(req, res, next) {
//   const userver = jwt.verify(
//     req.Token,
//     "mynameissupratimsinhaofbtech",
//     (err, rsp) => {
//       if (typeof bearerheader != undefined) {
//         const bearer = bearerheader;
//         const token = bearer;
//         console.log(bearer);
//         req.token = token;
//         next();
//       } else {
//         res.render("login");
//       }
//     }
//   );
// }


var storage =   multer.diskStorage({  
  destination: function (req, file, callback) {  
    callback(null, './uploads');  
  },  
  filename: function (req, file, callback) {  
    callback(null, "test.txt");  
  }  
});  
var upload = multer({ storage : storage}).single('myfile');  
  
app.get('/upload',function(req,res){  
      res.render("upload");  
});  
  
app.post('/upload',function(req,res){  
    upload(req,res,function(err) {  
        if(err) {  
            return res.end("Error uploading file.");  
        }  
        res.end("File is uploaded successfully!");  
    });  
});  

app.get("/dashboard",(req,res)=>{
  // var delsql = `delete from modelreviews`;
  // db.query(delsql,function(err,result){
  //   if(err) throw err;
  //   else{
  //     console.log("cleared");
  //   }
  // })
  if (!chktoken) {
    res
      .status(200)
      .json({ success: false, message: "Error! Token was not provided" });
  }
  //Decoding the token
  const decodedToken = jwt.verify(chktoken, "secretkeyappearshere");
  if (decodedToken)
  {
    var sql = `SELECT count(PositiveReview),count(NegativeReview),count(NeutralReview) from modelreviews`;
  db.query(sql, function (err, result) {
    if (err) 
    throw err;
    else{
      console.log(result)
      var PositiveValue = result[0]['count(PositiveReview)']
      var NegativeValue = result[0]['count(NegativeReview)']
      var NeutralValue  = result[0]['count(NeutralReview)']
        res.render('DashboardDesktopTablet',{Posval : PositiveValue,Negval:NegativeValue,Neuval:NeutralValue})
    }
  });
  }
  else res.render("login");



})

app.get("/dashboardinner",(req,res)=>{
  if (!chktoken) {
    res
      .status(200)
      .json({ success: false, message: "Error! Token was not provided" });
  }

  const decodedToken = jwt.verify(chktoken, "secretkeyappearshere");
  if (decodedToken)
  {
    res.render("DashboardInnerPageDesktopTablet");
  }
  else res.render("login");


})



app.get("/dashboardposinner",(req,res)=>{

  if (!chktoken) {
    res
      .status(200)
      .json({ success: false, message: "Error! Token was not provided" });
  }

const decodedToken = jwt.verify(chktoken, "secretkeyappearshere");
if (decodedToken)
{
  var sql = `SELECT PositiveReview from modelreviews`;
  db.query(sql, function (err, result) {
    if (err) 
    throw err;
    else{
        var rows = result;
        res.render('DashboardInnerPageDesktopTablet',{ row: rows })
    }
  });
}
else res.render("login");

})

app.get("/dashboardneginner",(req,res)=>{
  if (!chktoken) {
    res
      .status(200)
      .json({ success: false, message: "Error! Token was not provided" });
  }

  const decodedToken = jwt.verify(chktoken, "secretkeyappearshere");
  if (decodedToken)
  {
    var sql = `SELECT NegativeReview from modelreviews`;
    db.query(sql, function (err, result) {
      if (err) 
      throw err;
      else{
        // result[0]['count(PositiveReview)']
          var rows = result;
          res.render('DashboardInnerPageDesktopTablet1',{ row: rows })
      }
    });
  }
  else res.render("login");

  })
  
  app.get("/dashboardneuinner",(req,res)=>{
    if (!chktoken) {
      res
        .status(200)
        .json({ success: false, message: "Error! Token was not provided" });
    }
  
    const decodedToken = jwt.verify(chktoken, "secretkeyappearshere");

    if (decodedToken)
    {
      var sql = `SELECT NeutralReview from modelreviews`;
      db.query(sql, function (err, result) {
        if (err) 
        throw err;
        else{
          // result[0]['count(PositiveReview)']
            var rows = result;
            res.render('DashboardInnerPageDesktopTablet2',{ row: rows })
        }
      });
    }
    else res.render("login");
  
    })



app.listen(port, () => console.info(`App listening on port ${port}`));
