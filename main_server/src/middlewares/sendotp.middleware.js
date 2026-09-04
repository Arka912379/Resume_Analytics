import nodemailer from 'nodemailer'
import util from 'util'
const sendemail = async (sendtoemail,otp) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,      // Your email
            pass: process.env.PASSWORD    // App password (not your real password)
        }
    });
   const otpEmailTemplateHTML = (otp) => `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>AI Interview System OTP</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
}

body{
background:#F8F6F0;
font-family:Arial,Helvetica,sans-serif;
padding:40px 15px;
}

.wrapper{
max-width:620px;
margin:auto;
background:#ffffff;
border:4px solid #111;
box-shadow:10px 10px 0px #111;
overflow:hidden;
}

.header{

background:linear-gradient(135deg,#8B5CF6,#6D4AFF);
padding:35px;
text-align:center;
color:#111;
border-bottom:4px solid #111;

}

.logo{

display:inline-block;
background:#FFD84D;
border:3px solid #111;
padding:12px 18px;
font-size:26px;
font-weight:900;
margin-bottom:18px;
box-shadow:5px 5px 0 #111;

}

.brand{

font-size:34px;
font-weight:900;
letter-spacing:1px;
color:#111;

}

.tagline{

margin-top:10px;
font-size:15px;
font-weight:700;
color:#222;
letter-spacing:1px;

}

.content{

padding:45px 35px;
color:#222;

}

.content h2{

font-size:30px;
margin-bottom:15px;
font-weight:900;

}

.content p{

font-size:16px;
line-height:1.8;
margin-bottom:20px;

}

.otp-card{

margin:35px auto;
max-width:320px;
background:#8B5CF6;
border:4px solid #111;
box-shadow:8px 8px 0 #111;
padding:22px;

}

.otp-title{

font-size:14px;
color:white;
margin-bottom:12px;
font-weight:bold;
text-transform:uppercase;
letter-spacing:2px;

}

.otp{

font-size:40px;
font-weight:900;
letter-spacing:10px;
color:white;

}

.notice{

background:#F8F6F0;
border:3px solid #111;
padding:18px;
margin-top:35px;
font-size:15px;
line-height:1.8;

}

.button{

display:inline-block;
margin-top:35px;
padding:16px 40px;
background:#62E6A4;
color:#111;
text-decoration:none;
font-weight:900;
font-size:18px;
border:3px solid #111;
box-shadow:5px 5px 0 #111;

}

.footer{

background:#111;
color:white;
padding:28px;
text-align:center;

}

.footer h3{

font-size:22px;
margin-bottom:10px;

}

.footer p{

font-size:14px;
color:#cccccc;
line-height:1.7;

}

.small{

margin-top:15px;
font-size:12px;
color:#999;

}

</style>

</head>

<body>

<div class="wrapper">

<div class="header">

<div class="logo">
AI
</div>

<div class="brand">
AI INTERVIEW SYSTEM
</div>

<div class="tagline">
PRACTICE. IMPROVE. SUCCEED.
</div>

</div>

<div class="content">

<h2>Hello 👋</h2>

<p>
Thank you for joining <strong>AI Interview System</strong>.
</p>

<p>
Use the verification code below to complete your account registration.
</p>

<div class="otp-card">

<div class="otp-title">
Your Verification Code
</div>

<div class="otp">
${otp}
</div>

</div>

<div class="notice">

<b>Security Notice</b><br><br>

• This OTP is valid for <strong>10 minutes</strong>.<br>
• Never share this code with anyone.<br>
• Our team will never ask for your OTP.

</div>

<center>

<a href="#" class="button">
START YOUR JOURNEY →
</a>

</center>

</div>

<div class="footer">

<h3>AI Interview System</h3>

<p>
Practice real interview questions.<br>
Improve your communication.<br>
Succeed in your dream career.
</p>

<div class="small">

© 2026 AI Interview System<br>
Practice. Improve. Succeed.

</div>

</div>

</div>

</body>
</html>
`;

    const mailOptions = {
        from: process.env.EMAIL,    // Fixed the `from` field
        to: sendtoemail,
        subject: "OTP for register",
        html: otpEmailTemplateHTML(otp),
    };

    // Convert sendMail to return a promise
    const sendMailAsync = util.promisify(transporter.sendMail.bind(transporter));

    try {
        const info = await sendMailAsync(mailOptions);
        console.log("✅ Email sent:", info.response);
        return info.response;  // Return the response
    } catch (error) {
        console.error("❌ Error sending email:", error);
        throw error;   // Throw error for proper handling
    }
}
export default sendemail;