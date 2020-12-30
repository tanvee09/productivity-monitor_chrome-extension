const express = require("express");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const auth = require("../middleware/auth");

const User = require("../model/User");
const History = require("../model/History");
const Timetable = require("../model/timetableModel");

/**
 * @method - POST
 * @param - /signup
 * @description - User SignUp
 */

router.post(
    "/signup", [
        check("name", "Please Enter a Valid Username")
        .not()
        .isEmpty(),
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],
    async(req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { name, email, password } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (user) {
                return res.status(400).json({
                    msg: "User Already Exists"
                });
            }

            user = new User({
                name,
                email,
                password
            });

            const salt = await bcrypt.genSalt(12);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const payload = {
                user: {
                    id: user.id
                }
            };

            newTimetable = new Timetable();
            newTimetable.email = user.email;
            newTimetable.save(function(err3) {
                if (err3) {
                    // error = "Error Occured In The Database";
                    // console.log(err3);
                    // return res.render("signup", {error});
                    console.log(err.message);
                    return res.status(500).send("Error in Saving");
                }
            });

            hist = new History({email: user.email, timespent: {}});
            hist.save(function(err3) {
                if (err3) {
                    // error = "Error Occured In The Database";
                    // console.log(err3);
                    // return res.render("signup", {error});
                    console.log(err.message);
                    return res.status(500).send("Error in Saving");
                }
            });



            jwt.sign(
                payload,
                "randomString", {
                    expiresIn: Number.MAX_VALUE
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        token
                    });
                }
            );
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
);

router.post(
    "/login", [
        check("email", "Please enter a valid email").isEmail(),
        check("password", "Please enter a valid password").isLength({
            min: 6
        })
    ],
    async(req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }

        const { email, password } = req.body;
        try {
            let user = await User.findOne({
                email
            });
            if (!user)
                return res.status(400).json({
                    message: "User Not Exist"
                });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch)
                return res.status(400).json({
                    message: "Incorrect Password !"
                });

            const payload = {
                user: {
                    id: user.id
                }
            };

            jwt.sign(
                payload,
                "randomString", {
                    expiresIn: Number.MAX_VALUE
                },
                (err, token) => {
                    if (err) throw err;
                    res.status(200).json({
                        user,
                        token
                    });
                }
            );
        } catch (e) {
            console.error(e);
            res.status(500).json({
                message: "Server Error"
            });
        }
    }
);

/**
 * @method - POST
 * @description - Get LoggedIn User
 * @param - /user/me
 */

router.get("/me", auth, async(req, res) => {
    try {
        // request.user is getting fetched from Middleware after token authentication
        const user = await User.findById(req.user.name);
        res.json(user);
    } catch (e) {
        res.send({ message: "Error in Fetching user" });
    }
});


router.post("/timespent", async(req, res) => {
    const { email, timespent } = req.body;
    console.log(req.body)
        // console.log('ping');
    if (email) {
        try {
            var user = await History.findOne({ email });
            // console.log(user);
            if (!user) {
                user = new History({
                    email,
                    timespent: {}
                });
                user.save();
                user = await History.findOne({ email });
            }
            // time = doc.toObject(user.timespent);
            // console.log(typeof(time));
            // console.log('-------------');
            for (i in timespent) {
                var link = i.replace(/\./g, '|');
                // var link = link.split('.')[0]
                var val = user.timespent.get(link);
                // console.log(i,link);
                if (val) {
                    user.timespent.set(link, Number(user.timespent.get(link)) + Number(timespent[i]));
                } else {
                    user.timespent.set(link, timespent[i]);
                }
            }
            console.log(user.timespent);
            History.update({ email }, { timespent: user.timespent }).then((res) => console.log(res));
        } catch (err) {
            console.log(err.message);
            res.status(500).send("Error in Saving");
        }
    }
    res.status(200).json({
        user
    });
});

module.exports = router;