var express = require("express");
var router = express.Router();
var hank = require("../models/hank");
var Comment = require("../models/comment");
var user = require("../models/user");
const comment = require("../models/comment");

//=================
router.get("/hanks/:id/comments/new", isLoggedIn, function(req, res) {

    hank.findById(req.params.id, function(err, hank) {
        if (err) {
            console.log(err);
        } else {
            res.render("comments/new", { hank: hank });

        }
    })


})

router.get("/hanks/:id/comments/:comment_id/edit", checkCommentOwnership, function(req, res) {
        comment.findById(req.params.comment_id, function(err, foundComment) {
            if (err) {
                res.redirect("back");
            } else {
                res.render("comments/edit", { hank_id: req.params.id, comment: foundComment });

            }
        })

    })
    //update
router.put("/hanks/:id/comments/:comment_id", function(req, res) {
    //res.send("you hit the update");
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if (err) {
            res.redirect("back");
        } else {
            res.redirect("/hanks/" + req.params.id);
        }
    })
})

///delete
router.delete("/hanks/:id/comments/:comment_id", function(req, res) {
    comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            res.redirect("back");
        } else {
            req.flash('error', 'Comment deleted!');
            res.redirect("/hanks/" + req.params.id);
        }
    })
})

router.post("/hanks/:id/comments", isLoggedIn, function(req, res) {
    hank.findById(req.params.id, function(err, hank) {
        if (err) {
            console.log(err);
            res.redirect("/hanks");
        } else {
            // console.log(req.body.Comment);
            Comment.create(req.body.comment, function(err, comment) {
                if (err) {
                    console.log(err)
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    ///
                    comment.save();
                    hank.comments.push(comment);
                    hank.save();
                    req.flash('success', 'Created a comment!');
                    res.redirect("/hanks/" + hank._id);
                }
            })

        }
    })
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkCommentOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        //does the user own hank

        comment.findById(req.params.comment_id, function(err, comment) {

            if (comment.author.id.equals(req.user._id) || req.user) {
                next();

            } else {
                res.redirect("back");
            }


        })

    } else {
        // console.log("YOU NEED TO BE LOGGED IN TO DO THAT!!!");
        // res.send("YOU NEED TO BE LOGGED IN TO DO THAT!!!");
        res.redirect("back");
    }
}
module.exports = router;