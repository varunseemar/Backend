const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()
const authUserLogin = async (req,res,next)=>{
    console.log("Authorization Header:", req.header['Authorization']);
    const token = req.headers['authorization'];
    if(!token){
        return res.status(401).send("Denied Access")
    }
    try{
        const verifiedToken = jwt.verify(token,process.env.JWTOKEN)
        if(verifiedToken){
            req.user = verifiedToken;
            next();
        }
    }
    catch(err){
        return res.status(400).send("Invalid Token");
    }
}

module.exports = authUserLogin;