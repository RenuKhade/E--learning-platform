const express = require("express");
const router = express.Router();
const connection = require("../utils/db");
const { verifyToken } = require("../utils/webToken");
const { uid } = require("uid");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

/* fake data

{
    "courseID": "CSE101",
    "title": "Assignment 1",
    "assessmentDeadline": "2021-12-12",
    "generateAIQuestion": "true",
    "description": "This is the first assignment",
    questionJSON:[
        {
            "question": "What is the capital of Bangladesh?",
            "options": ["Dhaka", "Chittagong", "Rajshahi", "Khulna"],
            "answer": "Dhaka"
        },
        {
            "question": "What is the capital of India?",
            "options": ["Mumbai", "Delhi", "Kolkata", "Chennai"],
            "answer": "Delhi"
        }
    ],

    

}


*/


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = `./assestment/${req.params.courseID}/${req.params.assestmentID}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// router.post("/upload/:courseID", upload.single("file"), (req, res) => {

  

//   const token = req.cookies.token;
//   if (!token) {
//     return res.status(400).send("Token not provided");
//   }
//   const payload = verifyToken(token);
  
//   const { username } = payload;

//   connection.query(
//     "SELECT teacherID FROM teachers WHERE username = ?",
//     [username],
//     (error, results) => {
//       if (error) {
//         console.error("Error executing SQL query:", error);
//         res.status(500).send("Error in creating content");
//         return;
//       }

//       if (results.length === 0) {
//         return res.status(400).send("Teacher not found");
//       }
//     }
//   );

//   const { courseID } = req.params;
//   const { file } = req;
//   const { title, description,questionJSON,generateAIQuestion,assessmentDeadline } = req.body;

//   if (!title || !description) {
//     return res.status(400).send("Please fill in all fields");
//   }

//   if (!file && !questionJSON) {
//     return res.status(400).send("Please upload a file or provide a question");
//   }
//   let typeOfFile;
//   if(file ){

//     typeOfFile = file.mimetype.split("/")[0];


//     if (typeOfFile !== "application" && typeOfFile !== "text") {
//       return res.status(400).send("Please upload a valid file");
//     }
    
//   }
 
//     connection.query(
//         "SELECT * FROM courses WHERE courseID = ?",
//         [courseID],
//         (error, results) => {
//         if (error) {
//             console.error("Error executing SQL query:", error);
//             res.status(500).send("Error in creating content");
//             return;
//         }
    
//         if (results.length === 0) {
//             return res.status(400).send("Course not found");
//         }
//         }
//     );


//   // assessmentID 	courseID 	assessmentTitle 	assessmentDescription 	assessmentURL 	generateAIQuestion 	 	assessmentDeadline 	created_at 	updated_at 	questionsJson 
//     const assessmentID = uid(16);
//     const questionFileType = file ? typeOfFile : "json";
   
//     const assessmentURL = `http://localhost:3000/assestment/${courseID}/${assessmentID}/${file ? file.originalname : "question.json"}`;
//     connection.query(
//         "INSERT INTO assessments SET ?",
//         {
//         assessmentID,
//         courseID,
//         assessmentTitle: title,
//         assessmentDescription: description,
//         assessmentURL,
//        questionFileType,
//          generateAIQuestion: generateAIQuestion ? 1 : 0,
//         questionsJson: JSON.stringify(questionJSON),
//         assessmentDeadline

//         },
    
//         (error, results) => {
//         if (error) {
//             console.error("Error executing SQL query:", error);
//             res.status(500).send("Error in creating content");
//             return;
//         }
    
//         res.status(200).send({
//             message: "Content created successfully",
//             assessmentID: assessmentID,

//         });
//         }
//     );



// });
router.get("/all/:courseID", (req, res) => {
    const { courseID } = req.params;
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
            res.status(500).send("Error in fetching content");
            return;
        }
    
        if (results.length === 0) {
            return res.status(400).send("Teacher not found");
        }
        }
    );

    


    connection.query(
        "SELECT * FROM assessments WHERE courseID = ?",
        [courseID],
        (error, results) => {
        if (error) {
            console.error("Error executing SQL query:", error);
            res.status(500).send("Error in fetching content");
            return;
        }
        // const questionJSON = results.map((result) => {
        //     return {
        //         assessmentID: result.assessmentID,
        //         courseID: result.courseID,
        //         title: result.assessmentTitle,
        //         description: result.assessmentDescription,
        //         assessmentDeadline: result.assessmentDeadline,
        //         generateAIQuestion: result.generateAIQuestion,
        //         questionFileType: result.questionFileType,
        //         questionJSON: JSON.parse(result.questionsJson),
        //         assessmentURL: result.assessmentURL,
        //     };
        // });
        // console.log(questionJSON);
    
        res.status(200).send(results);
        }
    );
})

router.post('/upload/:courseID',  (req, res) => {
  //json questions only 
  const { courseID } = req.params;
  const { title, description,questionJSON,generateAIQuestion,assessmentDeadline } = req.body;
  console.log(req.body);
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
  connection.query(
      "SELECT * FROM courses WHERE courseID = ?",
      [courseID],
      (error, results) => {
      if (error) {
          console.error("Error executing SQL query:", error);
          res.status(500).send("Error in creating content");
          return;
      }
  
      if (results.length === 0) {
          return res.status(400).send("Course not found");
      }
      }
  );

  const assessmentID = uid(16);
  const questionFileType = "json";
  const assessmentURL = `http://localhost:3000/assestment/${courseID}/${assessmentID}/question.json`;
  connection.query(
      "INSERT INTO assessments SET ?",
      {
      assessmentID,
      courseID,
      assessmentTitle: title,
      assessmentDescription: description,
      assessmentURL,
     questionFileType,
       generateAIQuestion: generateAIQuestion ? 1 : 0,
      questionsJson: questionJSON,
      assessmentDeadline

      },
  
      (error, results) => {
      if (error) {
          console.error("Error executing SQL query:", error);
          res.status(500).send("Error in creating content");
          return;
      }
  
      res.status(200).send({
          message: "Content created successfully",
          assessmentID: assessmentID,

      });
      }
  );





})


router.get('/allByTeacher', (req, res) => {
    
   
    const token   = req.cookies.token;
    if (!token) {
        return res.status(400).send("Token not provided");
    }
    const payload = verifyToken(token);
    const { username } = payload;
    let teacherID;

    connection.query(
        "SELECT teacherID FROM teachers WHERE username = ?",
        [username],
        (error, results) => {
        if (error) {
            console.error("Error executing SQL query:", error);
            res.status(500).send("Error in fetching content");
            return;
        }
    
        if (results.length === 0) {
            return res.status(400).send("Teacher not found");
        }
        teacherID = results[0].teacherID;
        const sql = `
    SELECT a.*
    FROM assessments a
    JOIN courses c ON a.courseID = c.courseID
    WHERE c.teacherID = ?;
  `;
    //get all assestments from the courses of the teacher , assesstments are linked to courses and courses are linked to teacherID
    connection.query(
        sql,
        [teacherID],
        (error, results) => {
        if (error) {
            console.error("Error executing SQL query:", error);
            res.status(500).send("Error in fetching content");
            return;
        }
       res.status(200).send(results);
        }
        
    );
        }
    );




    
   

});

router.delete('/delete/:assessmentID', (req, res) => {
    const { assessmentID } = req.params;
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send("Token not provided");
    }
    const payload = verifyToken(token);
    const { username } = payload;
    let teacherID;
    


    //delete the assestment by id
    connection.query(
        "DELETE FROM assessments WHERE assessmentID = ?",
        [assessmentID],
        (error, results) => {
        if (error) {
            console.error("Error executing SQL query:", error);
            res.status(500).send("Error in deleting content");
            return;
        }

        res.status(200).send("Content deleted successfully");
        }
    );
});

router.put('/update/:assessmentID', (req, res) => {
    const { assessmentID } = req.params;
    console.log(assessmentID);
    const { title, description,questionJSON,generateAIQuestion,assessmentDeadline } = req.body;
  console.log(req.body);
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send("Token not provided");
    }
    const payload = verifyToken(token);
    const { username } = payload;
   //update the assestment by id
   let date = new Date(assessmentDeadline)
let mysqlFormatDate = date.toISOString().slice(0, 19).replace('T', ' ');
    connection.query(
        "UPDATE assessments SET assessmentTitle = ?, assessmentDescription = ?, questionsJson = ?, generateAIQuestion = ?, assessmentDeadline = ? WHERE assessmentID = ?",
        [title, description, questionJSON, generateAIQuestion ? 1 : 0, mysqlFormatDate, assessmentID],
        (error, results) => {
        if (error) {
            console.error("Error executing SQL query:", error);
            res.status(500).send("Error in updating content");
            return;
        }

        res.status(200).send(
            {
            message: "Content updated successfully",
            title,
            description,
            questionJSON,
            generateAIQuestion,
            assessmentDeadline
            }
        );
        }
    );


    
});

module.exports = router;