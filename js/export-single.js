// ملف: js/export-single.js
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  AlignmentType
} from "https://cdn.jsdelivr.net/npm/docx@8.0.0/+esm";

export async function exportToWord(flight) {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Najaf International Airport", bold: true, size: 32 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Airside Operations Dept", italics: true, size: 26 })
            ]
          }),
          new Paragraph({ text: " " }),
          createFlightTable(flight),
          new Paragraph({ text: " " }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: `اسم المنسق: ${flight["اسم المنسق"] || "غير معروف"}`, bold: true })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `Flight_${flight["FLT.NO"] || "NoNumber"}.docx`;
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function createFlightTable(data) {
  const fields = [
    "Date",
    "FLT.NO",
    "Time on Chocks",
    "Time open Door",
    "Time Start Cleaning",
    "Time complete cleaning",
    "Time ready boarding",
    "Time start boarding",
    "Boarding Complete",
    "Time Close Door",
    "Time off Chocks",
    "NOTES"
  ];

  const rows = [
    new TableRow({
      children: fields.map(field => new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ text: field, bold: true })]
      }))
    }),
    new TableRow({
      children: fields.map(field => new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ text: data[field] || "-" })]
      }))
    })
  ];

  return new Table({
    rows: rows
  });
}
