'use client';

import { Document, Page, Text, View, StyleSheet, Image as PDFImage } from '@react-pdf/renderer';

interface CertificateData {
  studentName: string;
  quizName: string;
  teamName: string;
  date: string;
  percentage: string;
}

interface CertificatePDFProps {
  certificateData: CertificateData;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#f8f4e9',
    padding: 0,
    fontFamily: 'Helvetica',
  },
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 80,
    boxSizing: 'border-box',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.05,
  },
  border: {
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30,
    bottom: 30,
    borderWidth: 4,
    borderColor: '#d4af37',
    borderStyle: 'solid',
    borderRadius: 10,
  },
  innerBorder: {
    position: 'absolute',
    top: 50,
    left: 50,
    right: 50,
    bottom: 50,
    borderWidth: 2,
    borderColor: '#f9d71c',
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  leftSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 40,
  },
  rightSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 40,
  },
  badgeContainer: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  badge: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 30,
    fontFamily: 'Helvetica-Bold',
    letterSpacing: 2,
  },
  mainContent: {
    textAlign: 'center',
    maxWidth: '100%',
  },
  bodyText: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 1.8,
    marginBottom: 15,
    fontFamily: 'Helvetica',
  },
  studentName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#c0392b',
    marginVertical: 15,
    fontFamily: 'Helvetica-Bold',
    borderBottomWidth: 2,
    borderBottomColor: '#bdc3c7',
    borderBottomStyle: 'solid',
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  courseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2980b9',
    marginVertical: 15,
    fontFamily: 'Helvetica-Bold',
  },
  additionalInfo: {
    fontSize: 14,
    color: '#7f8c8d',
    marginVertical: 8,
    fontFamily: 'Helvetica',
  },
  performanceText: {
    fontSize: 18,
    color: '#34495e', // Regular black color
    marginVertical: 12,
    fontFamily: 'Helvetica',
  },
  performanceValue: {
    fontSize: 18,
    color: '#27ae60', // Green color
    fontWeight: 'bold',
    fontFamily: 'Helvetica-Bold',
  },
  date: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 20,
    fontFamily: 'Helvetica',
  },
  signatureBlock: {
    alignItems: 'center',
    marginTop: 40,
    width: '100%',
  },
  signatureLine: {
    width: '80%',
    height: 1,
    backgroundColor: '#2c3e50',
    marginTop: 30,
    marginBottom: 10,
  },
  signatureName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    fontFamily: 'Helvetica-Bold',
  },
  signatureTitle: {
    fontSize: 12,
    color: '#7f8c8d',
    fontFamily: 'Helvetica',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'rotate(-45deg)',
    fontSize: 60,
    color: '#bdc3c7',
    opacity: 0.08,
    fontWeight: 'bold',
    pointerEvents: 'none',
  },
});

export const CertificatePDF = ({ certificateData }: CertificatePDFProps) => {
  return (
    <Document>
      <Page 
        size="A4" 
        orientation="landscape" 
        style={styles.page}
      >
        <View style={styles.container}>
          {/* Background elements */}
          <View style={styles.background} />
          <Text style={styles.watermark}>CERTIFICATE</Text>
          
          {/* Decorative borders */}
          <View style={styles.border} />
          <View style={styles.innerBorder} />

          {/* Left Section - Badge and Title */}
          <View style={styles.leftSection}>
            <View style={styles.badgeContainer}>
              <PDFImage
                style={styles.badge}
                src="https://ik.imagekit.io/s0kb1s3cx3/PWIOI/badge.png?updatedAt=1753185233828"
              />
            </View>
            <Text style={styles.title}>Certificate of Achievement</Text>
          </View>

          {/* Right Section - Main Content */}
          <View style={styles.rightSection}>
            <View style={styles.mainContent}>
              <Text style={styles.bodyText}>
                This is to certify that
              </Text>
              
              <Text style={styles.studentName}>{certificateData.studentName}</Text>
              
              <Text style={styles.bodyText}>
                has successfully completed the
              </Text>
              
              <Text style={styles.courseName}>{certificateData.quizName}</Text>
              
              {certificateData.teamName && certificateData.teamName !== "Individual" && (
                <Text style={styles.additionalInfo}>
                  Team: {certificateData.teamName}
                </Text>
              )}
              
              <Text style={styles.performanceText}>
                with a score of{' '}
                <Text style={styles.performanceValue}>{certificateData.percentage}%</Text>
              </Text>
              
              <Text style={styles.date}>
                Awarded on: {certificateData.date}
              </Text>
            </View>

            {/* Signature */}
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureName}>Mr. Alakh Pandey</Text>
              <Text style={styles.signatureTitle}>Founder & CEO</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};