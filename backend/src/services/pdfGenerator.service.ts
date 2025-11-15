import puppeteer from "puppeteer";
import { logger } from "../utils/logger";
import { getCertificateHtml } from "./../templates/certificate.template";
import { Readable } from "stream";

export async function generateCertificate(teamName: string, studentName: string, quizTitle: string, submittedAt: string, score: number): Promise<Buffer> {
    let browser: any = null;
    try {
        logger.info(`Generating certificate for student: ${studentName}`);
        // Get HTML template for Certificate
        const htmlTemplate = getCertificateHtml(quizTitle, studentName, teamName, submittedAt, score);

        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        await page.setContent(htmlTemplate, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            scale: 0.90,
            margin: { top: '5mm', bottom: '10mm', left: '15mm', right: '15mm' },
            preferCSSPageSize: false,
        });
        // const stream = Readable.from(pdfBuffer);

        logger.info(`Certificate stream generated for ${studentName} (${pdfBuffer.length} bytes)`);

        return pdfBuffer;
    } catch (error) {
        logger.error(`Failed to generate certificate stream for ${studentName}`, { error });
        throw error; 
    } finally {
        if (browser) {
            await browser.close().catch(() => { });
        }
    }
}
