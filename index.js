const express = require('express');
const bodyParser = require('body-parser');
const jwt = require("jsonwebtoken");
const dotenv = require('dotenv');

const app = express();
dotenv.config();

const users = [
  {id: 1, username: "joellord", password: "joellord"},
  {id: 2, username: "guest", password: "guest"}
];

const HTTP_CAT_URL = process.env.HTTPCAT || "http://localhost:4444";
const PORT = process.env.PORT || "8080";
const SECRET = process.env.SECRET;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/login", function(req, res) {
  var loginForm = "<form method='post'><input type=hidden name=callback value='" + req.query.callback + "'><input type=text name=username /><input type=text name=password /><input type=submit></form>";
  res.status(200).send(loginForm);
});

app.post("/login", function(req, res) {
  if (!req.body.username || !req.body.password) return res.status(400).send(`Need username and password<br/><img src='${HTTP_CAT_URL}/400' width='300px'/>`);

  var user = users.find(function(u) {
    return u.username === req.body.username && u.password === req.body.password;
  });
  if (!user) return res.status(401).send(`User not found<br/><img src='${HTTP_CAT_URL}/401' width='300px'/>`);

  var token = jwt.sign({
    sub: user.id,
    scope: "api:read",
    username: user.username
  }, SECRET, {expiresIn: "10 minutes"});

  res.redirect(req.body.callback + "#access_token=" + token);
});

app.get('*', function (req, res) {
  res.sendStatus(404);
});

app.listen(PORT, () => console.log(`Auth server started on port ${PORT}`));