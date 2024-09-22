const express = require("express");
const router = express.Router();
const connection = require("../utils/db");
const { verifyToken } = require("../utils/webToken");
const { uid } = require("uid");

router.get("/getQuestions/:courseID", (req, res) => {
    const { courseID } = req.params;
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send("Token not provided");
    }
    const payload = verifyToken(token);
    const { username } = payload;
    
    connection.query(
        "SELECT teachers.teacherID,courses.courseId,courses.courseName FROM teachers INNER JOIN courses ON teachers.teacherID = courses.teacherID WHERE teachers.username = ? AND courses.courseID = ?",
        [payload.username, courseID],
        (error, results) => {
            if (error) {
                console.error("Error executing SQL query:", error);
                res.status(500).send("Error in getting questions");
                return;
            }
    
            if (results.length === 0) {
                return res.status(400).send("Teacher not found or not the teacher of the course");
            }
    
            const teacherID = results[0].teacherID;
            const courseName = results[0].courseName;
            const courseId = results[0].courseId;
            console.log(results)
    
            connection.query(
                //get the discussion id, question, and who created it
                "SELECT * FROM discussion WHERE course_id = ?",
                [courseID],
                (error, results) => {
                    if (error) {
                        console.error("Error executing SQL query:", error);
                        res.status(500).send("Error in getting questions");
                        return;
                    }
                    const questions = results;
                    // send the questions and the course name as a response
                    res.send(
                        {
                            questions,
                            courseName,
                            courseId
                        }
                    );
                    

                    
                }
            );
            
        }
    );
    
    

});

router.get("/getAnswers/:discussionID", (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send("Token not provided");
    }

    const payload = verifyToken(token);
    const { username } = payload;
    
        


    const { discussionID } = req.params;
    connection.query(
        "SELECT * FROM messages WHERE discussion_ID = ?",
        [discussionID],
        (error, results) => {
            if (error) {
                console.error("Error executing SQL query:", error);
                res.status(500).send("Error in getting answers");
                return;
            }

            res.send(results);
        }
    );
}
);

router.post("/addQuestion/:courseID", (req, res) => {
    const { courseID } = req.params;
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send("Token not provided");
    }
    const payload = verifyToken(token);
    const { username } = payload;
    
    connection.query(
        "SELECT teachers.teacherID FROM teachers INNER JOIN courses ON teachers.teacherID = courses.teacherID WHERE teachers.username = ? AND courses.courseID = ?",
        [payload.username, courseID],
        (error, results) => {
            if (error) {
                console.error("Error executing SQL query:", error);
                res.status(500).send("Error in adding question");
                return;
            }
    
            if (results.length === 0) {
                return res.status(400).send("Teacher not found or not the teacher of the course");
            }
    
            const teacherID = results[0].teacherID;
    
            const { question } = req.body;
            const discussionID = uid(20);
            // res.send(`${question} ${discussionID} ${courseID} ${teacherID}`)
            connection.query(
                "INSERT INTO discussion (discussion_id, course_id, created_by, Question) VALUES (?, ?, ?,?)",
                [discussionID,courseID, "30f4f7b1ef", question],
                (error, results) => {
                    if (error) {
                        console.error("Error executing SQL query:", error);
                        res.status(500).send("Error in adding question");
                        return;
                    }
    
                    res.send("Question added successfully");
                }
            );
        }
    );
}
);
router.post('/addAnswer/:courseID', (req, res) => {
    const { courseID } = req.params;
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send("Token not provided");
    }
    const payload = verifyToken(token);
    const { username } = payload;
    
    connection.query(
        "SELECT * FROM teachers INNER JOIN courses ON teachers.teacherID = courses.teacherID WHERE teachers.username = ? AND courses.courseID = ?",
        [payload.username, courseID],
        (error, results) => {
            if (error) {
                console.error("Error executing SQL query:", error);
                res.status(500).send("Error in adding answer");
                return;
            }
    
            if (results.length === 0) {
                return res.status(400).send("Teacher not found or not the teacher of the course");
            }
    
            const teacherID = results[0].teacherID;
    
            const { discussion_id, message } = req.body;
            const message_id = uid(20);
    
            connection.query(
                "INSERT INTO messages (message_id,discussion_ID, created_by, message) VALUES (?, ?, ?,?)",
                [message_id,discussion_id, teacherID, message],
                (error, results) => {
                    if (error) {
                        console.error("Error executing SQL query:", error);
                        res.status(500).send("Error in adding answer");
                        return;
                    }
    
                    //send the message as a response
                    res.send(
                        {
                            message_id,
                            discussion_id,
                            created_by: teacherID,
                            message
                        }
                    
                    )

                }
            );
        }
    );
}
);
router.delete("/deleteMessage/:messageID", (req, res) => {
    const { messageID } = req.params;
    
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).send("Token not provided");
    }
    const payload = verifyToken(token);
    const { username } = payload;
    connection.query(
        "SELECT * FROM messages WHERE message_id = ?",
        [messageID],
        (error, results) => {
            if (error) {
                console.error("Error executing SQL query:", error);
                res.status(500).send("Error in deleting message");
                return;
            }
            if (results.length === 0) {
                return res.status(400).send("Message not found");
            }
            const message = results[0];
            connection.query(
                "SELECT * FROM teachers WHERE username = ?",
                [username],
                (error, results) => {
                    if (error) {
                        console.error("Error executing SQL query:", error);
                        res.status(500).send("Error in deleting message");
                        return;
                    }
                    if (results.length === 0) {
                        return res.status(400).send("Teacher not found");
                    }
                    const teacher = results[0];
                    if (message.created_by !== teacher.teacherID) {
                        return res.status(400).send("Teacher not the creator of the message");
                    }
                    connection.query(
                        "DELETE FROM messages WHERE message_id = ?",
                        [messageID],
                        (error, results) => {
                            if (error) {
                                console.error("Error executing SQL query:", error);
                                res.status(500).send("Error in deleting message");
                                return;
                            }
                
                            res.send("Message deleted successfully");
                        }
                    );
                }
            );
        }
    );


    
}
);

module.exports = router;