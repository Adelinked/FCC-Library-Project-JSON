/*
 *
 *
 *       Complete the API routing below
 *
 *
 */
//const dbConnect = require("./lib/dbConnect");
//const Book = require("../models/Book");
//const mongoose = require("mongoose");
//const CONNECTION_STRING = process.env.MONGODB_URI; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

let fname = "./data/books.json";
const fs = require("fs");
const { writeFile } = fs;

module.exports = function (app) {
  //  mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true }, (err, db) => {
  app
    .route("/api/books")
    .get(function (req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      fs.readFile(fname, "utf8", (error, data) => {
        if (error) {
          res.json([]);
          return;
        }
        let result = JSON.parse(data);
        res.json(
          result.reduce((acc, obj) => {
            const { _id, title } = obj;
            acc.push({ _id, title, commentcount: obj.comments.length });
            return acc;
          }, [])
        );
      });
    })

    .post(function (req, res) {
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        res.send("missing required field title");
        return;
      }
      let readData = [];
      fs.readFile(fname, "utf8", (error, data) => {
        if (error) {
          const newResponse = {
            _id: "1",
            title: title,
          };
          const newArr = [{ ...newResponse, comments: [] }];
          writeFile(fname, JSON.stringify(newArr, null, 2), (errorWr) => {
            if (errorWr) {
              // console.log("An error has occurred ", error);
              return;
            }
            //console.log("Data written successfully to disk");
          });
          res.json(newResponse);

          return;
        }
        //console.log("Not first book");
        readData = JSON.parse(data);
        const id =
          readData.length > 0
            ? String(Math.max(...readData.map((i) => Number(i._id))) + 1)
            : "1";
        const response = {
          _id: String(id),
          title: title,
        };
        readData = [...readData, { ...response, comments: [] }];
        writeFile(fname, JSON.stringify(readData, null, 2), (error) => {
          if (error) {
            // console.log("An error has occurred ", error);
            return;
          }
          //console.log("Data written successfully to disk");
        });
        res.json(response);
      });

      /* db.collection("Book").insertOne({
          ...response,
          comments: [],
        });*/
    })

    .delete(function (req, res) {
      //if successful response will be 'complete delete successful'
      const newArr = [];
      writeFile(fname, JSON.stringify(newArr, null, 2), (errorWr) => {
        if (errorWr) {
          // console.log("An error has occurred ", error);
          return;
        }
        res.send("complete delete successful");
      });
    });

  app
    .route("/api/books/:id")
    .get(function (req, res) {
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      fs.readFile(fname, "utf8", (error, data) => {
        if (error) {
          res.json([]);
          return;
        }
        let result = JSON.parse(data).filter((b) => b._id == bookid);
        if (result.length > 0) {
          res.json(
            ...result.reduce((acc, obj) => {
              const { _id, title, comments } = obj;
              if (_id == bookid)
                acc.push({
                  comments,
                  _id,
                  title,
                  commentcount: obj.comments.length,
                });
              return acc;
            }, [])
          );
        } else {
          res.send("no book exists");
        }
      });
    })

    .post(function (req, res) {
      let bookid = req.params.id;
      let comment = req.body.comment;

      if (!comment) {
        res.send("missing required field comment");
        return;
      }

      fs.readFile(fname, "utf8", (error, data) => {
        if (error) {
          //res.json({ error: "could not update", _id: id });
          return;
        }
        let result = JSON.parse(data);

        if (result.filter((i) => i._id == bookid).length < 1) {
          res.send("no book exists");
          return;
        }
        result = result.map((i) =>
          i._id == bookid ? { ...i, comments: [...i.comments, comment] } : i
        );
        writeFile(fname, JSON.stringify(result, null, 2), (error) => {
          if (error) {
            //res.json({ error: "could not update", _id: id });
            return;
          }
          //res.json({ result: "successfully updated", _id: id });
          res.json(
            ...result.reduce((acc, obj) => {
              const { _id, title, comments } = obj;
              if (_id == bookid)
                acc.push({
                  comments,
                  _id,
                  title,
                  commentcount: obj.comments.length,
                });
              return acc;
            }, [])
          );
        });
      });

      //json res format same as .get
    })

    .delete(function (req, res) {
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      fs.readFile(fname, "utf8", (error, data) => {
        if (error) {
          // res.json({ error: "could not delete", _id: bookid });
          return;
        }
        let result = JSON.parse(data);
        if (result.filter((i) => i._id == bookid).length < 1) {
          res.send("no book exists");
          return;
        }
        result = result.filter((i) => i._id != bookid);

        writeFile(fname, JSON.stringify(result, null, 2), (error) => {
          if (error) {
            //res.json({ error: "could not delete", _id: bookid });
            return;
          }
          res.send("delete successful");
        });
      });
    });
  // });
};
