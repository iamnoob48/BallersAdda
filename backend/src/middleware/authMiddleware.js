import jwt from 'jsonwebtoken';


//For verifying the access token middleware

export const verifyAccessToken = (req, res, next)=>{
    const accessToken = req.cookies.accessToken;
    if(!accessToken){
        return res.status(401).json({message: 'No access token provided'});
    }
    try {
        const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_JWT_SECRET);
        req.user = user;
        next();
        
    } catch (error) {
        return res.status(403).json({message: 'Invalid access token'});
        
    }
}