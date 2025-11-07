import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient.js';
import passport from 'passport';

//For generating JWT access token
const generateAccessToken = (user)=>{
    return jwt.sign({id : user.id}, process.env.ACCESS_TOKEN_JWT_SECRET, {expiresIn: '15m'});


}
//For generating JWT refresh token
const generateRefreshToken = (user)=>{
    return jwt.sign({id : user.id}, process.env.REFRESH_TOKEN_JWT_SECRET, {expiresIn: '7d'});
}

export const registerUser = async (req,res)=>{
    const {username, email, password} = req.body;
    try {
        //Check for the user exists previously or not
        const checkUser = await prisma.user.findUnique({
            where : {
                email: email
            }
        })
        if(checkUser){
            return res.status(400).json({message: 'User already exists'});
        }
        //For registering the user
        const hashedPassword = bcrypt.hashSync(password, 10); //hashing the pass using bcrypt
        const newUser = await prisma.user.create({
            data: {
                username: username,
                email: email,
                password: hashedPassword
            }
        });
        //Sending tokens in cookies
        const accessToken = generateAccessToken(newUser);
        const refreshToken = generateRefreshToken(newUser);
        //Access token
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        //Refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(201).json({message: 'User registered successfully'});
       

        
    } catch (error) {
        res.status(500).json({message: 'Server Error'});
        console.log(error);
        
    }
}
//For login the user
export const loginUser = async (req,res)=>{
    const {email, password} = req.body;
    try {
        //Check for the user exists previously or not
        const user = await prisma.user.findUnique({
            where : {
                email: email
            }
        })
        if(!user){
            return res.status(400).json({message: 'Invalid email or password'});
        }
        //Comparing the password
        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({message: 'Invalid email or password'});
        }
        //Sending tokens in cookies
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        //Access token
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        //Refresh token
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.status(200).json({message: 'User logged in successfully', accessToken: accessToken, refreshToken: refreshToken});
       

        
    } catch (error) {
        res.status(500).json({message: 'Server Error'});
        console.log(error);
        
    }
}

//For refreshing the access token
export const refreshAccessToken = (req, res)=>{
    //Get refresh token from cookies
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(401).json({message: 'No refresh token provided'});
    }
    try {

        const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_JWT_SECRET);
        if(!user){
            return res.status(403).json({message: 'Invalid refresh token'});
        }
        const newAccessToken = generateAccessToken(user);
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        res.status(200).json({message: 'Access token refreshed successfully'});
        
    } catch (error) {
        res.status(500).json({message: 'Server Error'});
        console.log(error);
        
    }

}

//For callback logic
export const googleAuthCallback = (req, res)=>{
    try {
        //Retrieving the authenticated user from req.user
        const user = req.user;
        //Generating tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        //Setting cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        //Redirecting to home page
        res.redirect('http://localhost:5175/home');

        
    } catch (error) {
        res.status(500).json({message: 'Server Error'});
        console.log(error);
        
    }
}

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

//For fetching the user profile picture
export const getUserProfile = async (req,res)=>{
    const accessToken = req.cookies.accessToken;
    //For checking the access token
    if(!accessToken){
        return res.status(401).json({message: 'No access token provided'});
    }
    try {
        //Extracting the id info
        const userPayload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: {id: userPayload.id}
        });
        if(!user){
            return res.status(404).json({message: 'User not found'});
        }
        res.status(200).json({profilePic: user.profilePic, username: user.username});
        
    } catch (error) {
        return res.status(403).json({message: 'Invalid access token'});
        
    }
}

//For logging out the user
export const logoutUser = (req, res)=>{
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({message: 'User logged out successfully'});
}



