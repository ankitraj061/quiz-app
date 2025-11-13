import { config } from "../config";

export const getVerficationMailTemplate = (studentName: string, verificationLink: string, teamName: string) => {
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .team-badge {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 15px 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .team-badge strong {
            color: #667eea;
            font-size: 18px;
        }
        .message {
            color: #555;
            font-size: 16px;
            margin: 20px 0;
        }
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .link-section {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 25px 0;
        }
        .link-section p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
        }
        .verification-link {
            word-break: break-all;
            color: #667eea;
            font-size: 13px;
            display: block;
            margin-top: 10px;
        }
        .expiry-notice {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            font-size: 13px;
            color: #6c757d;
        }
        .divider {
            height: 1px;
            background-color: #e9ecef;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <h1>🎉 Team Leader Verification</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${studentName}! 👋</div>
            
            <p class="message">
                Congratulations! You have been registered as the <strong>Team Leader</strong>.
            </p>
            
            <div class="team-badge">
                <strong>Team Name:</strong><br>
                <span style="font-size: 24px; color: #333;">${teamName}</span>
            </div>
            
            <p class="message">
                As the team leader, you need to verify your email address to activate your entire team's account. 
                Once you verify, all your team members will be able to login.
            </p>
            
            <div class="button-container">
                <a href="${verificationLink}" class="button">
                    Verify Email Address
                </a>
            </div>
            
            <div class="link-section">
                <p><strong>Can't click the button?</strong></p>
                <p>Copy and paste this link into your browser:</p>
                <span class="verification-link">${verificationLink}</span>
            </div>
            
            <div class="expiry-notice">
                ⏰ <strong>Important:</strong> This verification link will expire in 24 hours.
            </div>
            
            <div class="divider"></div>
            
            <p class="message" style="font-size: 14px; color: #666;">
                <strong>What happens after verification?</strong><br>
                • Your entire team will be activated<br>
                • All team members can login with their credentials<br>
                • Your team can start participating immediately
            </p>
        </div>
        
        <div class="footer">
            <p>If you didn't register for this, please ignore this email.</p>
            <p>This is an automated message, please do not reply.</p>
            <p style="margin-top: 15px; color: #999;">© 2025 Quiz App. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `;
    return htmlTemplate;
};


export const getWelcomeMailTemplate = (studentName: string, teamName: string, email: string, leaderName: string) => {
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .email-wrapper {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 22px;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
        }
        .team-info {
            background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
            border: 2px solid #667eea;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        .team-name {
            font-size: 28px;
            font-weight: 700;
            color: #667eea;
            margin: 10px 0;
        }
        .team-label {
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #666;
            font-weight: 600;
        }
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            margin: 25px 0;
            border-radius: 4px;
        }
        .info-box h3 {
            margin: 0 0 10px 0;
            color: #667eea;
            font-size: 18px;
        }
        .info-box p {
            margin: 8px 0;
            color: #555;
            font-size: 15px;
        }
        .message {
            color: #555;
            font-size: 16px;
            margin: 20px 0;
            line-height: 1.8;
        }
        .highlight-box {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .highlight-box p {
            margin: 5px 0;
            color: #1565c0;
            font-size: 15px;
        }
        .button-container {
            text-align: center;
            margin: 35px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 40px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .features {
            display: table;
            width: 100%;
            margin: 30px 0;
        }
        .feature-item {
            padding: 15px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .feature-item:last-child {
            border-bottom: none;
        }
        .feature-icon {
            display: inline-block;
            width: 30px;
            font-size: 20px;
        }
        .feature-text {
            display: inline-block;
            vertical-align: middle;
            color: #555;
            font-size: 15px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
            font-size: 13px;
            color: #6c757d;
        }
        .divider {
            height: 1px;
            background-color: #e9ecef;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <h1>🎊 Welcome to Your Team!</h1>
            <p>You're all set and ready to go</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hello ${studentName}! 👋</div>
            
            <p class="message">
                Great news! You have been successfully registered as a team member.
            </p>
            
            <div class="team-info">
                <div class="team-label">YOUR TEAM</div>
                <div class="team-name">${teamName}</div>
            </div>
            
            <div class="info-box">
                <h3>📋 Team Details</h3>
                <p><strong>Team Leader:</strong> ${leaderName}</p>
                <p><strong>Your Email:</strong> ${email}</p>
                <p><strong>Status:</strong> <span style="color: #28a745; font-weight: 600;">Registered ✓</span></p>
            </div>
            
            <div class="highlight-box">
                <p><strong>📧 Important:</strong> Your team leader needs to verify their email address before you can login. Once they verify, you'll be all set to access your account!</p>
            </div>
            
            <div class="divider"></div>
            
            <h3 style="color: #333; margin-bottom: 15px;">🚀 What's Next?</h3>
            
            <div class="features">
                <div class="feature-item">
                    <span class="feature-icon">1️⃣</span>
                    <span class="feature-text">Wait for your team leader to verify their email</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">2️⃣</span>
                    <span class="feature-text">Once verified, login with your credentials</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">3️⃣</span>
                    <span class="feature-text">Start collaborating with your team</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">4️⃣</span>
                    <span class="feature-text">Explore all available features and tools</span>
                </div>
            </div>
            
            <div class="button-container">
                <a href="${config.frontendUrl}/auth/student/login" class="button">
                    Go to Login Page
                </a>
            </div>
            
            <div class="message" style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 6px; font-size: 14px;">
                <strong>💡 Quick Tip:</strong> Keep your login credentials safe and bookmark the login page for easy access. If you have any questions, feel free to reach out to your team leader or our support team.
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Need Help?</strong></p>
            <p>Contact your team leader: ${leaderName}</p>
            <p style="margin-top: 20px;">This is an automated message, please do not reply.</p>
            <p style="margin-top: 15px; color: #999;">© 2025 Quiz App. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
    return htmlTemplate;
}