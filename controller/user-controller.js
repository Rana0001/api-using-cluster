const User = require("../model/users");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getUsers = async(req, res, next) => {
  await User.find()
    .then((users) => {
      res.status(200).json({
        message: "Users found",
        data: users,
      });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const getUserById = async(req, res, next) => {
  let id = req.params.id;
  await User.findById(id)
    .then((user) => {
      res.status(200).json({
        message: "User found",
        data: user,
      });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
};

const registerUser = (req, res, next) => {
  console.log(req.body);

  const { username, password, identifier, biometric } = req.body;

  if (!username || !password || !identifier) {
    res.status(400).json({ msg: "Please enter all fields" });
  }

  User.findOne({ username }).then((user) => {
    if (user) return res.status(400).json({ msg: "User already exists" });

    const newUser = new User({
      username,
      password,
      identifier,
      biometric,
    });

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then((user) => {
          jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token, refreshToken) => {
              if (err) throw next(err);
              res.status(200).json({
                token,
                refreshToken,
                user: {
                  id: user.id,
                  username: user.username,
                  email: user.email,
                },
              });
            }
          );
        });
      });
    });
  });
};

const loginUser = async(req, res, next) => {
  const user = await User.findOne({ username: req.body.username });


  const secretKey = process.env.JWT_SECRET;

  if (!user) return res.status(400).json({ msg: "User does not exist" });
  try {
   if(!bcrypt.compare(req.body.password, user.password)){
      return res.status(400).json({ msg: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id,
      username: user.username,

     }, secretKey, { expiresIn: "1d" });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });    
 
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};

const updateUser = (req, res, next) => {
  let id = req.params.id;
  let updatedUser = {
    username: req.body.username,
    email: req.body.email,
    identifier: req.body.identifier,
    biometric: req.body.biometric,
  };
  User.findByIdAndUpdate(id, updatedUser)
    .then(() => {
      res.json("User updated");
    })
    .catch((err) => {
      res.json(err);
    });
};

const deleteUser = (req, res, next) => {
  let id = req.params.id;
  User.findByIdAndRemove(id)
    .then(() => {
      res.json("User deleted");
    })
    .catch((err) => {
      res.json(err);
    });
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  registerUser,
  loginUser,
};
