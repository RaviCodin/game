
const nodeMailer = require('nodemailer');

exports.sendEmail = async (options)=>{
    // console.log(options)
    // console.log(options,process.env.SMPT_HOST,process.env.SMPT_PORT,process.env.SMVT_SERVISE,process.env.SMVT_MAIL,process.env.SMVT_PASS)

    const transporter = nodeMailer.createTransport({
        host:process.env.SMPT_HOST,
        port: process.env.SMPT_PORT,
        service:process.env.SMVT_SERVISE,
        // secure: true,
        auth:{
            user:process.env.SMVT_MAIL,
            pass:process.env.SMVT_PASS 
           
        }
    })
    console.log(process.env.SMVT_PASS,process.env.SMVT_MAIL)
    
    const mailOptions = {
        from: process.env.SMVT_MAIL,
        to: options.email ,
        subject: options.subject,
        html: options.html
    }
    
    await transporter.sendMail(mailOptions)
}

// exports.sendPaymentEmail = async (options)=>{

//     // console.log(options,process.env.SMPT_HOST,process.env.SMPT_PORT,process.env.SMVT_SERVISE,process.env.SMVT_MAIL,process.env.SMVT_PASS)

//     const transporter = nodeMailer.createTransport({
//         host:process.env.SMPT_HOST,
//         port: process.env.SMPT_PORT,
//         service:process.env.SMVT_SERVISE,
//         auth:{
//             user:process.env.SMVT_MAIL,
//             pass:process.env.SMVT_PASS
//         }
//     })
    
//     const mailOptions = {
//         from: process.env.SMVT_MAIL,
//         to: `${options.email}, sochsepehel2022@gmail.com`,
//         subject: options.subject,
//         html: options.html
//     }
    
//     await transporter.sendMail(mailOptions)
// }

// module.exports = sendEmail;