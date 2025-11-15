export const getCertificateHtml = (quizTitle: string, studentName: string, teamName: string, submittedAt: string, score: number) => {

    const template = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate of Achievement</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
    
            body {
                font-family: 'Helvetica', Arial, sans-serif;
                background-color: #f0f0f0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                padding: 20px;
            }
    
            .certificate-container {
                width: 297mm;
                height: 210mm;
                background-color: #f8f4e9;
                position: relative;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            }
    
            .background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0.05;
                pointer-events: none;
            }
    
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 60px;
                color: #bdc3c7;
                opacity: 0.08;
                font-weight: bold;
                pointer-events: none;
                white-space: nowrap;
            }
    
            .border {
                position: absolute;
                top: 30px;
                left: 30px;
                right: 30px;
                bottom: 30px;
                border: 4px solid #d4af37;
                border-radius: 10px;
            }
    
            .inner-border {
                position: absolute;
                top: 50px;
                left: 50px;
                right: 50px;
                bottom: 50px;
                border: 2px dashed #f9d71c;
                border-radius: 8px;
            }
    
            .content {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 80px;
                z-index: 1;
            }
    
            .left-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding-right: 40px;
            }
    
            .right-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding-left: 40px;
            }
    
            .badge-container {
                width: 150px;
                height: 150px;
                margin-bottom: 30px;
            }
    
            .badge {
                width: 100%;
                height: 100%;
                object-fit: contain;
            }
    
            .title {
                font-size: 36px;
                font-weight: bold;
                color: #2c3e50;
                text-align: center;
                margin-bottom: 30px;
                letter-spacing: 2px;
            }
    
            .main-content {
                text-align: center;
                width: 100%;
            }
    
            .body-text {
                font-size: 16px;
                color: #34495e;
                line-height: 1.8;
                margin-bottom: 15px;
            }
    
            .student-name {
                font-size: 32px;
                font-weight: bold;
                color: #c0392b;
                margin: 15px 0;
                border-bottom: 2px solid #bdc3c7;
                padding-bottom: 8px;
                text-transform: uppercase;
                letter-spacing: 1px;
                display: inline-block;
            }
    
            .course-name {
                font-size: 22px;
                font-weight: bold;
                color: #2980b9;
                margin: 15px 0;
            }
    
            .additional-info {
                font-size: 14px;
                color: #7f8c8d;
                margin: 8px 0;
            }
    
            .performance-text {
                font-size: 18px;
                color: #34495e;
                margin: 12px 0;
            }
    
            .performance-value {
                font-size: 18px;
                color: #27ae60;
                font-weight: bold;
            }
    
            .date {
                font-size: 14px;
                color: #7f8c8d;
                margin-top: 20px;
            }
    
            .signature-block {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-top: 40px;
                width: 100%;
            }
    
            .signature-line {
                width: 80%;
                height: 1px;
                background-color: #2c3e50;
                margin-top: 30px;
                margin-bottom: 10px;
            }
    
            .signature-name {
                font-size: 14px;
                font-weight: bold;
                color: #2c3e50;
            }
    
            .signature-title {
                font-size: 12px;
                color: #7f8c8d;
            }
    
            @media print {
                body {
                    background-color: white;
                    padding: 0;
                }
    
                .certificate-container {
                    box-shadow: none;
                    page-break-after: always;
                }
            }
        </style>
    </head>
    <body>
        <div class="certificate-container">
            <div class="background"></div>
            <div class="watermark">CERTIFICATE</div>
            <div class="border"></div>
            <div class="inner-border"></div>
    
            <div class="content">
                <!-- Left Section -->
                <div class="left-section">
                    <div class="badge-container">
                        <img 
                            class="badge" 
                            src="https://ik.imagekit.io/s0kb1s3cx3/PWIOI/badge.png?updatedAt=1753185233828" 
                            alt="Achievement Badge"
                        />
                    </div>
                    <h1 class="title">Certificate of Achievement</h1>
                </div>
    
                <!-- Right Section -->
                <div class="right-section">
                    <div class="main-content">
                        <p class="body-text">This is to certify that</p>
                        
                        <div class="student-name" id="studentName">${studentName}</div>
                        
                        <p class="body-text">has successfully completed the</p>
                        
                        <div class="course-name" id="quizName">${quizTitle}</div>
                        
                        <p class="additional-info" id="teamName">Team: ${teamName}</p>
                        
                        <p class="performance-text">
                            with a score of 
                            <span class="performance-value" id="percentage">${score}</span>%
                        </p>
                        
                        <p class="date" id="date">Awarded on: ${submittedAt}</p>
                    </div>
    
                    <!-- Signature -->
                    <div class="signature-block">
                        <div class="signature-line"></div>
                        <p class="signature-name">Mr. Alakh Pandey</p>
                        <p class="signature-title">Founder & CEO</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    return template;
}