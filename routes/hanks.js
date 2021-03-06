var express = require("express");
var router = express.Router();
var hank = require("../models/hank");
var Comment = require("../models/comment");
var user = require("../models/user");
const { text } = require("body-parser");

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dgqsspuik', 
  api_key: 'enter  your api_key', 
  api_secret: 'enter your api_secret'
});

router.get("/hanks", function(req, res) {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), "gi");
        hank.find({ name: regex }, (err, hanks) => {
            if (err) {
                console.log(err);
            } else {
                res.render(`hanks/hanks`, { hanks: hanks, currentUser: req.user });
            }
        });

    } else {
        // console.log(req.user);
        hank.find({}, (err, hanks) => {
            if (err) {
                console.log(err);
            } else {
                res.render(`hanks/hanks`, { hanks: hanks, currentUser: req.user });
            }
        });
    }


})

// router.post("/hanks", isLoggedIn,upload.single('image'), function(req, res) {
//     //get data from form and add to hanks array 
//     var name = req.body.name;
//     var image = req.body.image;
//     var desc = req.body.description;
//     var link = req.body.link;
//     var author = {
//         id: req.user._id,
//         username: req.user.username
//     }
//     var newhank = { name: name, image: image, description: desc, author: author, link: link }
//         //hanks.push(newhank);

//     hank.create(newhank, (err, newlyCreated) => {
//         if (err) {
//             console.log(err);
//         } else {
//             console.log(req.body);
//             res.redirect("/hanks")
//         }
//     });

    



// })

router.post("/hanks", isLoggedIn,upload.single('image'), function(req, res) {
    cloudinary.uploader.upload(req.file.path, function(result) {
        // add cloudinary url for the image to the campground object under image property
        var name = req.body.name;
        var image = result.secure_url;
        var desc = req.body.description;
        var link = req.body.link;
        // add author to campground
        var author = {
                    id: req.user._id,
                    username: req.user.username
                }
        var newhank = { name: name, image: image, description: desc, author: author, link: link }
        hank.create(newhank, function(err, hank) {
          if (err) {
            // req.flash('error', err.message);
            return res.redirect('back');
          }
          res.redirect('/hanks/' + hank.id);
        });
      });
      
})

router.get("/hanks/new", isLoggedIn, function(req, res) {
    res.render("hanks/new");
})

router.get("/hanks/:id", function(req, res) {
    hank.findById(req.params.id).populate("comments").exec(function(err, foundhank) {
        if (err) {
            req.flash('error', 'Sorry, that Content does not exist!');
            console.log(err);
        } else {
            console.log(foundhank);
            res.render("hanks/show", { hank: foundhank })
        }
    });
})



//Edit
router.get("/hanks/:id/edit", checkHankOwnership, function(req, res) {
    hank.findById(req.params.id, function(err, foundhank) {
        res.render("hanks/edit", { hank: foundhank });
    })

})


//Update
router.put("/hanks/:id", checkHankOwnership, function(req, res) {

    hank.findByIdAndUpdate(req.params.id, req.body.hank, function(err, updatedhank) {
        if (err) {
            req.flash("error", err.message);
            res.redirect("/hanks");

        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/hanks/" + req.params.id)
        }
    })
})


//destroy
router.delete("/hanks/:id", checkHankOwnership, function(req, res) {
        hank.findByIdAndRemove(req.params.id, function(err) {
            if (err) {
                res.redirect("/hanks/");
            } else {
                req.flash('error', campground.name + ' deleted!');
                res.redirect("/hanks/")
            }
        })

    })
    // router.delete("/hanks/:id/comments/:comment_id", function(req, res) {
    //     comment.findByIdAndRemove(req.params.comment_id, function(err) {
    //         if (err) {
    //             res.redirect("back");
    //         } else {
    //             res.redirect("/hanks/" + req.params.id);
    //         }
    //     })
    // })
  
  

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}

function checkHankOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        //does the user own hank

        hank.findById(req.params.id, function(err, hank) {

            if (hank.author.id.equals(req.user._id) || req.user.isAdmin) {
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


function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$!#\s]/g, "\\$&");

};
module.exports = router;
