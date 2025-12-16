import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';

// 1. Dotenv ko initialize karein
dotenv.config(); 

// 2. API Key ko Library mein set karein (Yeh line MISSING thi)
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const ADMIN_ACCESS_KEY = process.env.ADMIN_ACCESS_KEY || 'GPG1101@gmail.com';

// 3. Yahaan wahi email dalein jo Screenshot 1 mein verified hai
const EMAIL_FROM = process.env.EMAIL_FROM || 'hostelwebapp@gmail.com'; 

export const sendOTP = async (email, otp, purpose) => {
    // Basic config check
    if (!process.env.SENDGRID_API_KEY) {
        console.warn(`[⚠️ MOCK EMAIL] SendGrid API Key missing. Logging OTP to console instead.`);
        console.log(`[👉 OTP for ${email}]: ${otp}`);
        return; 
    }

    const subject = purpose === 'LOGIN' 
        ? 'Admin Login Verification OTP' 
        : 'Admin Registration Verification OTP';
        
    const title = purpose === 'LOGIN' 
        ? 'OTP Verification for Admin Login' 
        : 'OTP Verification for Admin Registration';

    const msg = {
        to: email,
        from: EMAIL_FROM, // Ab yeh verified email use karega
        subject,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #333;">${title}</h2>
                <p>Please use the following One-Time Password (OTP) to complete your action:</p>
                <p style="font-size: 24px; font-weight: bold; color: #007bff; background-color: #f4f4f4; padding: 10px; border-radius: 4px; text-align: center;">${otp}</p>
                <p>This OTP is valid for 10 minutes.</p>
                <p style="margin-top: 30px; font-size: 12px; color: #777;">Regards, <br>The System Administrator</p>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`${purpose} OTP sent successfully to ${email}`);
    } catch (error) {
        console.error(`[❌ Email Failed] Could not send email to ${email}. Falling back to console log.`);
        
        // Error details print karna debugging ke liye zaroori hai
        if (error.response) {
            console.error(error.response.body);
        } else {
            console.error(`Error details: ${error.message}`);
        }

        // Log OTP to console so user can still proceed
        console.log(`[👉 OTP for ${email}]: ${otp}`);
    }
};