const express = require("express");
const router = express.Router();
const connection = require("../utils/db");
const { verifyToken } = require("../utils/webToken");
const { uid } = require("uid");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `./content/${req.params.courseID}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/upload/:courseID", upload.fields([{ name: 'file', maxCount: 1 }, { name: 'video', maxCount: 1 }]), (req, res) => {
  //get the id from param

  const token = req.cookies.token;
  if (!token) {
    return res.status(400).send("Token not provided");
  }
  const payload = verifyToken(token);

  const { username } = payload;

  connection.query(
    "SELECT teacherID FROM teachers WHERE username = ?",
    [username],
    (error, results) => {
      if (error) {
        console.error("Error executing SQL query:", error);
        res.status(500).send("Error in creating content");
        return;
      }

      if (results.length === 0) {
        return res.status(400).send("Teacher not found");
      }
    }
  );

  const { courseID } = req.params;
  
  const { title, description, type } = req.body;

  if (!title || !description ) {
    return res.status(400).send("Please fill in all fields");
  }
const {file, video} = req.files;
  if (!file || !video) {
    return res.status(400).send("Please upload a file and video");
  }

  const port = process.env.PORT || 3002;
  const contentID = uid(16);
  const contentURL = `http://localhost:${port}/content/${courseID}/${file[0].originalname}`;
  const fileType = file[0].mimetype;
  const videoURL = `http://localhost:${port}/content/${courseID}/${video[0].originalname}`;
  

  connection.query(
    "INSERT INTO courseContent SET ?",
    {
      contentID,
      courseID,
      contentTitle: title,
      contentDescription: description,
      contentURL,
      videoURL,
    },

    (error, results) => {
      if (error) {
        console.error("Error executing SQL query:", error);
        res.status(500).send("Error in creating content");
        return;
      }

      res.status(200).send({
        message: "Content created successfully",
        contentID,
        fileType,
        contentURL,
      });
    }
  );
});

router.get("/:courseID", (req, res) => {
  const { courseID } = req.params;
 
  //get the course content sorted by created_at
  connection.query(
    "SELECT * FROM courseContent WHERE courseID = ? ORDER BY created_at ASC",
    [courseID],
    (error, results) => {
      if (error) {
        console.error("Error executing SQL query:", error);
        res.status(500).send("Error in fetching content");
        return;
      }

      //get the course details 
      connection.query(
        "SELECT * FROM courses WHERE courseID = ?",
        [courseID],
        (error, course) => {
          if (error) {
            console.error("Error executing SQL query:", error);
            res.status(500).send("Error in fetching content");
            return;
          }

   

          res.status(200).send({
            course: course[0],
            content: results,
          });
        }
      );

      
    }
  );
});

router.put("/:courseID", upload.fields([{name:'file',maxCount:1},{name:'video',maxCount:1}]), (req, res) => {
  const { courseID } = req.params;
  const { file,video } = req.files
  const { title, description,contentID ,deleteExistingFile,deleteExistingVideo} = req.body;

  if (!title || !description) {
    return res.status(400).send("Please fill in all fields");
  }

  if (!file || !video) {
    
    connection.query(
      "UPDATE courseContent SET contentTitle = ?, contentDescription = ? WHERE contentID = ?",
      [title, description, contentID],
      (error, results) => {
        if (error) {
          console.error("Error executing SQL query:", error);
          res.status(500).send("Error in updating content");
          return;
        }

        res.status(200).send({
          message: "Content updated successfully",
          contentTitle: title,
          contentDescription: description,
          
        });
      }
    );
  


  } else if (file && video) {
    const port = process.env.PORT || 3002;
    const contentURL = `http://localhost:${port}/content/${courseID}/${file[0].originalname}`;
    const fileType = file[0].mimetype;
    const videoURL = `http://localhost:${port}/content/${courseID}/${video[0].originalname}`;
    connection.query(
      "UPDATE courseContent SET contentTitle = ?, contentDescription = ?, contentURL = ?, videoURL = ? WHERE contentID = ?",
      [title, description, contentURL, videoURL, contentID],
      (error, results) => {
        if (error) {
          console.error("Error executing SQL query:", error);
          res.status(500).send("Error in updating content");
          return;
        }

        res.status(200).send({
          message: "Content updated successfully",
          contentTitle: title,
          contentDescription: description,
          fileType,
          contentURL,
        });
      }
    );
  }
});

router.delete("/:contentID", (req, res) => {
  const { contentID } = req.params;
  connection.query(
    "SELECT * FROM courseContent WHERE contentID = ?",
    [contentID],
    (error, results) => {
      if (error) {
        console.error("Error executing SQL query:", error);
        res.status(500).send("Error in deleting content");
        return;
      }

      if (results.length === 0) {
        return res.status(400).send("Content not found");
      }

      const filePath = results[0].contentURL.split("http://localhost:3002")[1];
      fs.unlinkSync(path.join(__dirname, "..", filePath));

      connection.query(
        "DELETE FROM courseContent WHERE contentID = ?",
        [contentID],
        (error, results) => {
          if (error) {
            console.error("Error executing SQL query:", error);
            res.status(500).send("Error in deleting content");
            return;
          }

          res.status(200).send("Content deleted successfully");
        }
      );
    }
  );
});


module.exports = router;
