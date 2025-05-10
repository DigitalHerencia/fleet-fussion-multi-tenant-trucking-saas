import ExcelJS from 'exceljs';

export async function exportToExcel<T>(data: T[], sheetName = 'Sheet1'): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  if (data.length === 0) return Buffer.from('');
  worksheet.columns = data[0] ? Object.keys(data[0]).map((key) => ({ header: key, key })) : [];
  data.forEach((row) => worksheet.addRow(row));
  const result = await workbook.xlsx.writeBuffer();
  return Buffer.isBuffer(result) ? result : Buffer.from(result);
}
