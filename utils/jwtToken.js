//send Token to cookie in broser

const sendToken = (user, statuscode, resp) => {
    const token = user.getJWTToken();
    //   console.log("token ok : ",token )
    const options = {
        expires: new Date(
            Date.now() + process.env.EXPIRECOOKIE * 24  * 60 * 60 * 1000
        ),
        httpOnly: true,
        };
      

    resp.status(statuscode).cookie("token",token,options).json({
        success:true,
        user,
        token
    });
};

module.exports = sendToken;