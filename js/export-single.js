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
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 },
            size: { orientation: "landscape" }
          }
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: `📅 التاريخ: ${flight["Date"] || "غير محدد"}`, size: 24 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Najaf International Airport", bold: true, size: 32 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Airside Operations Dept", italics: true, size: 26 }),
              new TextRun({ text: "\nAircraft Coordination Unit", break: 1, size: 24 })
            ]
          }),
          new Paragraph({ text: " " }),
          createFlightTable(flight),
          new Paragraph({ text: " " }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: `اسم المنسق: ${flight["اسم المنسق"] || "غير معروف"}`, bold: true, size: 24 })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            children: [
              new TextRun({ text: `ملاحظات: ${flight["NOTES"] || "-"}`, size: 22 })
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
    "FLT.NO",
    "ON chocks Time",
    "Open Door Time",
    "Start Cleaning Time",
    "Complete Cleaning Time",
    "Ready Boarding Time",
    "Start Boarding Time",
    "Complete Boarding Time",
    "Close Door Time",
    "Off chocks Time",
    "Date"
  ];

  const rows = [
    new TableRow({
      children: fields.map(field => new TableCell({
        width: { size: 100 / fields.length, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ text: field, bold: true })]
      }))
    }),
    new TableRow({
      children: fields.map(field => new TableCell({
        width: { size: 100 / fields.length, type: WidthType.PERCENTAGE },
        children: [new Paragraph({ text: data[field] || "-" })]
      }))
    })
  ];

  return new Table({
    rows: rows
  });
}
