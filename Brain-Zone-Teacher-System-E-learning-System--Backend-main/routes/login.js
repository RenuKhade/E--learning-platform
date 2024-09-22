const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const connection = require("../utils/db");
const { generateToken } = require("../utils/webToken");
const { check, validationResult } = require("express-validator");

router.post('/', [
  check('username').trim().escape(),
  check('password').trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { password, username } = req.body;

  try {
    //get the user from the database
    connection.query(
      "SELECT * FROM teachers WHERE username = ?",
      [username],
      async (error, userResults) => {
        if (error) {
          console.error("Error executing SQL query:", error);
          res.status(400).send("Error in logging user");
          return;
        }

        const user = userResults[0];
        if (!user) {
          return res.status(400).send("User does not exist");
        }

        //check if the password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
          return res.status(400).send("Password is incorrect");
        }
        const tokenExpiresIn = 60 * 60 * 24 * 7; // 1 week

        const token = generateToken({ 
          username: user.username,
          teacherID: user.teacherID,
        }, tokenExpiresIn);

        res.cookie('token', token, { httpOnly: true, sameSite: 'strict' });

        return res.status(200).send({
          user:{
            username: user.username,
            email: user.email,
            name: user.name
          },
          message : "User logged in successfully",
          token : token
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(400).send("Error in logging user");
  }
});

module.exports = router;