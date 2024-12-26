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
   <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rent Receipt</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 20px;
      background-color: #f9f9f9;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    h1 {
      font-size: 24px;
      text-align: center;
      margin: 0 0 20px;
      color: #444;
    }
    .date {
      text-align: right;
      font-weight: bold;
    }
    .details {
      margin-top: 20px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #fff;
    }
    .details p {
      margin: 8px 0;
    }
    .signature {
      margin-top: 30px;
      text-align: right;
      font-style: italic;
    }
    .highlight {
      font-weight: bold;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Rent Receipt</h1>
    <p class="date">Date: ${new Date().toLocaleDateString()}</p>
    <div class="details">
      <p>
        This is to acknowledge receipt of the sum of 
        <span class="highlight">₦${payload.paymentAmount}</span> 
        (<span class="highlight">${convertNumberToWords(payload.paymentAmount)}</span>) 
        from the tenant.
      </p>
      <p>
        <strong>User ID:</strong> ${payload.userId}
      </p>
      <p>
        <strong>Room Number:</strong> ${payload.roomNumber}
      </p>
      <p>
        This payment is towards rent for the period starting 
        <span class="highlight">${new Date(payload.paymentDate).toLocaleDateString()}</span> 
        to 
        <span class="highlight">${new Date(payload.nextRentDueDate).toLocaleDateString()}</span>.
      </p>
      <p>
        The property is located at: 
        <span class="highlight">[Enter Address Here]</span>.
      </p>
    </div>
    <p class="signature">
      Name & Signature of Landlord:
    </p>
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
