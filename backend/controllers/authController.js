const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Streak } = require("../models/index");


// we need to create a JWT token, add new user to database
// hash their password with bcrpyt
const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // checking if the email already exists or not
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(422).json({ message: "User already exists" });
    }

    // hashing password
    const hashedPassword = await bcrypt.hash(password, 12)

    // userID auto generated in db
    const user = await User.create({
        username,
        email,
        password: hashedPassword
    })

    // create streak record for new user (starting at 0)
    await Streak.create({
        user_id: user.user_id,
        current_streak: 0,
        longest_streak: 0
    })


    // signing JWT token
    const token = jwt.sign(
        { user_id: user.user_id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d'}
    )


    // user.username and user.email same as username and email
    res.status(201).json({
        token,
        user: {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            created_at: user.created_at
        }
    })
  } catch(err) {
    console.error('Register error', err)
    res.status(500).json({ message: 'Signup failed, please try again' })
  }
};


const login = async (req, res) => {
    const { email, password } = req.body

    try {
        // find user by email
        const user = await User.findOne({ where: { email } })
        if(!user) {
            return res.status(401).json({ message: 'Email or Password incorrect' })
        }

        // generating JWT token
        const token = jwt.sign(
            { user_id: user.user_id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        )

        res.json({
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                created_at: user.created_at
            }
        })
    } catch(err) {
        console.error('Login erorr', err)
        res.status(500).json({message: 'Login failed, please try again' })
    }
}

module.exports = { register, login }
