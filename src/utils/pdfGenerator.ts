import PDFDocument from "pdfkit";
import pdf from "html-pdf";
import fs from "fs";
import path from "path";
import { Request, Response } from "express";

const convertNumberToWords = (amount: string): string => {
  const converter = require("number-to-words");
  return converter.toWords(amount);
};

export const generateRentReceiptPDF = async (
  payload: any,
  res: Response,
): Promise<void> => {
  const filePath = path.join(
    __dirname,
    `../uploads/Rent_Receipt_${payload.id}.pdf`,
  );

  const html = getRentReceiptTemplate(payload);

  const options: any = {
    format: "A4",
    border: "10mm",
  };

  pdf.create(html, options).toFile(filePath, (err: any, result: any) => {
    if (err) {
      console.error("Error generating PDF:", err);
      res.status(500).send("Error generating PDF");
      return;
    }

    res.download(result.filename, `Rent_Receipt_${payload.id}.pdf`, (err) => {
      if (err) {
        res.status(500).send("Error in sending file");
      }
      fs.unlinkSync(result.filename); // Cleanup the file
    });
  });
};

const getRentReceiptTemplate = (payload: any): string => {
  return `
    <html>
    <head>
      <meta charset="utf-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <title>Rent Receipt</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body {
          font-size: 14px;
          font-family: Arial, sans-serif;
          color: black;
        }
        h1 {
          text-align: center;
        }
        .content {
          margin: 20px;
        }
        .details {
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <h1>RENT RECEIPT</h1>
      <div class="content">
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <div class="details">
          <p>Received a sum of ₦${payload.paymentAmount} (in words: ${convertNumberToWords(payload.paymentAmount)}) from</p>
          <p>User ID: ${payload.userId}</p>
          <p>Room Number: ${payload.roomNumber}</p>
          <p>Towards rent for the period starting ${new Date(payload.paymentDate).toLocaleDateString()} to ${new Date(payload.nextRentDueDate).toLocaleDateString()}</p>
          <p>For residential/commercial building located at: [Enter Address Here]</p>
        </div>
        <p style="text-align: right;">Name & Signature of Landlord:</p>
      </div>
    </body>
    </html>`;
};

// Helper to convert numbers to words

// Helper to generate PDF
// export const generateRentReceiptPDF = async (
//   payload: any,
//   res: Response,
// ): Promise<void> => {
//   const doc = new PDFDocument();
//   const filePath = path.join(
//     __dirname,
//     `../uploads/Rent_Receipt_${payload.id}.pdf`,
//   );

//   type Options = {
//     format: "A4" | "A3" | "A5" | "Legal" | "Letter" | "Tabloid";
//     border: string;
//   };

//   const writeStream = fs.createWriteStream(filePath);

//   doc.pipe(writeStream);

//   // Add receipt details
//   doc.fontSize(20).text("RENT RECEIPT", { align: "center" });
//   doc.moveDown();

//   doc
//     .fontSize(12)
//     .text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
//   doc.moveDown();

//   doc.text(
//     `Received a sum of ₦ ${payload.paymentAmount} (in words: ${convertNumberToWords(payload.paymentAmount)}) from`,
//   );
//   doc.text(`User ID: ${payload.userId}`);
//   doc.text(`Room Number: ${payload.roomNumber}`);
//   doc.moveDown();

//   doc.text(
//     `Towards rent for the period starting ${new Date(payload.paymentDate).toLocaleDateString()} to ${new Date(payload.nextRentDueDate).toLocaleDateString()}`,
//   );
//   doc.text(
//     `For residential/commercial building located at: [Enter Address Here]`,
//   );
//   doc.moveDown();

//   doc.text("Name & Signature of Landlord:", { align: "right" });

//   // Finalize the PDF file
//   doc.end();

//   // Return the PDF as a response
//   writeStream.on("finish", () => {
//     res.download(filePath, `Rent_Receipt_${payload.id}.pdf`, (err) => {
//       if (err) {
//         res.status(500).send("Error in sending file");
//       }
//       fs.unlinkSync(filePath); // Cleanup the file
//     });
//   });
// };
