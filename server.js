const { error } = require("console");
const express = require("express");
var session = require("express-session");
const app = express();
const fs = require("fs");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//sesion
app.use(
  session({
    secret: "iam asecret on SSR",
    resave: true,
    saveUninitialized: true,
  })
);

//get homepage
app.get("/", function (req, res) {
  if (req.session.isLoggedIn === true) {
    res.render("dashboard", { user: req.session.user });
  } else {
    res.render("homepage", { error: null });
  }
});

//logout

app.get("/logout", async (req, res) => {
  if (req.session.isLoggedIn) {
    req.session.destroy((err) => {
      if (!err) res.redirect("/");
      else console.log(err);
    });
  }
});
//get login page

app.get("/login", function (req, res) {
  if (req.session.isLoggedIn) {
    res.redirect("/");
  } else {
    res.render("login", { error: null });
  }
});

//get signuppage
app.get("/signup", function (req, res) {
  res.render("signup", { error: null });
});

//signup page post

app.post("/signup", function (req, res) {
  const { email, firstname, lastname, password } = req.body;
  const user = {
    email: email,
    firstname: firstname,
    lastname: lastname,
    password: password,
  };
  //save user to file
  saveUser(user, function (error, flag) {
    if (error) {
      res.render("signup", { error: error });
    } else if (flag === true) {
      res.render("signup", { error: "User already exists. Go to login" });
    } else {
      res.redirect("/login");
    }
  });
});
//login post
app.post("/login", function (req, res) {
  const { email, password } = req.body;
  getAllusers(function (error, users) {
    if (error) {
      res.render("login", { error: error });
    } else {
      const match = users.find(function (user) {
        return user.email === email;
      });
      if (match === undefined) {
        res.render("login", { error: "User not registered !  GO to signup" });
      } else {
        if (match.email === email && match.password === password) {
          req.session.isLoggedIn = true;
          req.session.user = match;
          console.log(req.session);
          // res.send(match);
          res.redirect("/");
        } else {
          res.render("login", { error: "Password is incorrect" });
        }
      }
    }
  });
});

app.listen(8000, () => {
  console.log("server is running at 8000");
});

//to get all the users from file
function getAllusers(callback) {
  fs.readFile("./data.json", "utf-8", function (error, data) {
    if (error) {
      callback(error);
    } else {
      if (data.length === 0) {
        data = "[]";
      }
      try {
        let users = JSON.parse(data);
        callback(null, users);
      } catch (error) {
        callback(null, []);
      }
    }
  });
}

// function save the user
function saveUser(newuser, callback) {
  getAllusers(function (error, users) {
    if (error) {
      callback(error);
    } else {
      const user = users.find(function (user) {
        return user.email === newuser.email;
      });
      if (user) {
        callback(null, true);
      } else {
        users.push(newuser);

        fs.writeFile("./data.json", JSON.stringify(users), function (error) {
          if (error) {
            callback(error);
          } else {
            callback();
          }
        });
      }
    }
  });
}
