const express = require("express");
const router = express.Router();
const connection = require("../utils/db");
const { checkIfExists } = require("../utils/helper");
const { verifyToken } = require("../utils/webToken");
const { uid } = require("uid");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Route to create a new course //	courseID 	courseName 	courseDescription 	courseInstructor 	created_at 	updated_at 	userID 	courseStatus 	courseImage
//demo data
/*
{
 
    "courseName": "Introduction to Machine Learning",
    "courseDescription": "Learn the fundamentals of machine learning",
    "courseCategory": "Data Science",
    "courseDuration": "8 weeks",
    "coursePrice": 99.99,
    "courseDifficulty": "Intermediate",
    "courseOutcome": "Understand machine learning concepts",
    "courseLanguage": "English",
    "courseStatus": "Active",
    "courseImage": "intro_to_ml.jpg"
}

*/

const storage = multer.diskStorage({
 destination: function (req, file, cb) {
    const dir = `./content/images/`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });


router.post("/create",upload.single('photo'), async (req, res) => {
  const {
    name,
    description,
    category,
    length,
    price,
    difficulty,
    language,
    outcome,
  } = req.body;

  if (
    !name ||
    !description ||
    !category ||
    !length ||
    !price ||
    !difficulty ||
    !language ||
    !outcome
  ) {
    return res.status(400).send("Please fill in all fields");
  }

  const token = req.cookies.token;
  if (!token) {
    return res.status(400).send("Token not provided");
  }

  try {
    // connection.query(

    //   "SELECT teacherID, name, username, email FROM teachers WHERE username = ?",
    //   [username],
    //   (error, userResults) => {
    //     if (error) {
    //       console.error("Error executing SQL query:", error);
    //       res.send("Error in creating course");
    //       return;
    //     }

    //     const userID = userResults[0].teacherID;

    //     connection.query(
    //       "INSERT INTO coursesCreated SET ?",
    //       {
    //         courseID,
    //         courseName,
    //         courseDescription,
    //         courseInstructor,
    //         created_at,
    //         updated_at,
    //         userID,
    //         courseStatus,
    //         courseImage,
    //       },
    //       (insertError, insertResults) => {
    //         connection.end();
    //         if (insertError) {
    //           console.error("Error executing SQL query:", insertError);
    //           res.send("Error in creating course");
    //           return;
    //         }

    //         console.log("Course created successfully");
    //         res.send("Course created successfully");
    //       }
    //     );
    //   }
    // );
    const payload = verifyToken(token);
   
    const { username } = payload;

    connection.query(
      "SELECT teacherID, name, username, email FROM teachers WHERE username = ?",
      [username],
      (error, userResults) => {
        if (error) {
          console.error("Error executing SQL query:", error);
          return res.status(500).send("Error in creating course");
          return;
        }
        const teacherID = userResults[0].teacherID;
        const teacherName = userResults[0].name;
        const courseID = uid(16);
        const urlPhoto = req.file.path;
        connection.query(
          "INSERT INTO courses SET ?",
          {
            courseID,
            courseName: name,
            courseDescription: description,
            courseCategory: category,
            courseDuration: length,
            coursePrice: price,
            courseDifficulty: difficulty,
            courseLanguage: language,
            courseOutcome: outcome,
            courseImage: urlPhoto,
            teacherID,
            courseInstructor: teacherName,
            courseStatus: "Active",
          },
          (insertError, insertResults) => {
            if (insertError) {
              console.error("Error executing SQL query:", insertError);
              res.status(500).send("Error in creating course");
              return;
            }

         
            return res.status(200).send({
              message: "Course created successfully",
              courseID,
            });
          }
        );
      }
    );
  } catch (error) {
    console.error(error);
    res.status(400).send("Error in creating course");
  }
});

router.put("/update", async (req, res) => {
  const {
    courseID,
    courseName,
    courseDescription,
    courseInstructor,
    updated_at,
    courseStatus,
    courseImage,
    username,
  } = req.body;

  connection.query(
    "SELECT teacherID, name, username, email FROM teachers WHERE username = ?",
    [username],
    (error, userResults) => {
      if (error) {
        console.error("Error executing SQL query:", error);
        res.send("Error in updating course");
        return;
      }

      const userID = userResults[0].teacherID;

      connection.query(
        "UPDATE coursesCreated SET ? WHERE courseID = ?",
        [
          {
            courseName,
            courseDescription,
            courseInstructor,
            updated_at,
            courseStatus,
            courseImage,
          },
          courseID,
        ],
        (updateError, updateResults) => {
          connection.end();
          if (updateError) {
            console.error("Error executing SQL query:", updateError);
            res.send("Error in updating course");
            return;
          }

          res.send("Course updated successfully");
        }
      );
    }
  );
});

router.get("/allCourses", (req, res) => {
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
        res.status(500).send("Error in fetching courses");
        return;
      }

      if (results.length === 0) {
        return res.status(400).send("Teacher not found");
      }

      const teacherID = results[0].teacherID;

      connection.query(
        "SELECT * FROM courses WHERE teacherID = ?",
        [teacherID],
        (error, results) => {
          if (error) {
            console.error("Error executing SQL query:", error);
            res.status(500).send("Error in fetching courses");
            return;
          }
        

          res.status(200).send(results);
        }
      );
    }
  );
});

// route needs fixing
router.delete("/delete", (req, res) => {
  const { courseID } = req.body;

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
        res.status(500).send("Error in fetching courses");
        return;
      }

      if (results.length === 0) {
        return res.status(400).send("Teacher not found");
      }

      const teacherID = results[0].teacherID;
      connection.query(
        "SELECT * FROM courses WHERE teacherID = ? AND courseID = ?",
        [teacherID, courseID],
        (error, results) => {
          if (error) {
            console.error("Error executing SQL query:", error);
            res.status(500).send("Error in fetching courses");
            return;
          }
          if (results.length === 0) {
            return res.status(400).send("Course not found");
          }

          connection.query(
            "SELECT contentID FROM courseContent WHERE courseID = ?",
            [courseID],
            (error, results) => {
              if (error) {
                console.error("Error executing SQL query:", error);
                res.status(500).send("Error in fetching course content");
                return;
              }
              const contentIDs = results.map((result) => result.contentID);
              contentIDs.forEach((contentID) => {
                connection.query(
                  "DELETE FROM assessments WHERE courseContentID = ?",
                  [contentID],
                  (error, results) => {
                    if (error) {
                      console.error("Error executing SQL query:", error);
                      res.status(500).send("Error in deleting assessments");
                      return;
                    }
                  }
                );
              });
              //delete courseContent
              connection.query(
                "DELETE FROM courseContent WHERE courseID = ?",
                [courseID],
                (error, results) => {
                  if (error) {
                    console.error("Error executing SQL query:", error);
                    res.status(500).send("Error in deleting course content");
                    return;
                  }

                  connection.query(
                    "DELETE FROM assessments WHERE courseID = ?",
                    [courseID],
                    (error, results) => {
                      if (error) {
                        console.error("Error executing SQL query:", error);
                        res.status(500).send("Error in deleting assessments");
                        return;
                      }
                    }
                  );

                  //delete course
                  connection.query(
                    "DELETE FROM courses WHERE courseID = ?",
                    [courseID],
                    (error, results) => {
                      if (error) {
                        console.error("Error executing SQL query:", error);
                        res.status(500).send("Error in deleting course");
                        return;
                      }
                      res.status(200).send("Course deleted successfully");
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

module.exports = router;
