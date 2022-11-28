const jwt = require('jsonwebtoken')

// secret key for jwt
const secret = "I am a very bad b0y"

const fetchuser = (req, res, next)=>{
    // get the user
    const token = req.cookies.authToken
    if(token){
        jwt.verify(token, secret, (err, userId)=>{
            if(err){
                return res.sendStatus(403)
            }else{
                req.userId = userId
            }
        })
    }
    else{
        return res.sendStatus(401).json({"msg" : "Unauthorised"});
    }
    next()
}

module.exports = fetchuser;