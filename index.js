const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const db = require("./database/dbConfig.js");

const server = express();

server.use(express.json());
server.use(cors());

server.get("/", (req, res) => {
  res.send("Its Alive!");
});

server.post("/api/register", (req, res) => {
  //grab credentials
  const creds = req.body;
  //hash password                          //this means 2 ^ 3
  const hash = bcrypt.hashSync(creds.password, 3);
  //replace the user password with the hash
  creds.password = hash;
  //save the user
  db("users")
    .insert(creds)
    .then(ids => {
      const id = ids[0];
      //return 201
      res.status(201).json(id);
    })
    .catch(err => res.status(500).send(err));
});

server.post("/api/login", (req, res) => {
  //grab creds
  const creds = req.body;
  //find the user
  db("users")
    .where({ username: creds.username })
    .first()
    .then(user => {
      //check creds
      if (user && bcrypt.compareSync(creds.password, user.password)) {
        res.status(200).send("Welcome");
      } else {
        res.status(401).json({ message: "Wrong Credentials" });
      }
    })
    .catch(err => res.status(500).send(err));
});

// protect this route, only authenticated users should see it
server.get("/api/users", (req, res) => {
  db("users")
    .select("id", "username", "password")
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.listen(3300, () => console.log("\nrunning on port 3300\n"));
