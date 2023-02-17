// if (process.env.NODE_ENV !== "production") {
//     require("dotenv").config();
// }

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const initializePassport = require("./passport-config");
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)
const users = [];

const port = 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));

app.use(flash());
app.use(
    session({
        secret: 'abc',
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get("/", checkAuthenticated, (req, res) => {
    res.render("index", { name: req.user.name });
});

app.get("/login", checkIsNotAuthenticated, (req, res) => {
    res.render("login");
});

app.post(
    "/login",
    checkIsNotAuthenticated,
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login",
        failureFlash: true,
    })
);

app.get("/register", checkIsNotAuthenticated, (req, res) => {
    res.render("register");
});

app.post("/register", checkIsNotAuthenticated, async(req, res) => {
    try {
        const hashedPwd = await bcrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPwd,
        });
        res.redirect("/login");
    } catch {
        res.redirect("/register");
    }
    console.log("Users:", users);
});


app.delete('/logout', function(req, res, next) {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');
    });
});

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkIsNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
}

app.listen(port, () => {
    console.log(`Server http://localhost:${port}`);
});