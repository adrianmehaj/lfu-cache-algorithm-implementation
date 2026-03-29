import type { BenchmarkResult } from '../types';
import { downloadBlob } from './benchmarkExport';

/** Styled for Microsoft Excel (light canvas): header brand color, alternating rows, 2 decimal numeric format. */
const HEADER_ARGB = 'FF4F46E5';
const ROW_ALT_ARGB = 'FFEEF2FF';
const BORDER_ARGB = 'FFCBD5E1';
const TEXT_ARGB = 'FF0F172A';

export async function exportBenchmarkExcel(
  results: BenchmarkResult[],
  headers: { policy: string; hitRate: string; missRate: string; avgLatency: string; totalTime: string },
  sheetTitle: string,
  filename: string,
): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = 'LFU Cache Visual Simulator';
  wb.created = new Date();

  const ws = wb.addWorksheet(sheetTitle, {
    views: [{ state: 'frozen', ySplit: 1 }],
  });

  ws.columns = [
    { key: 'policy', width: 16 },
    { key: 'hitRate', width: 14 },
    { key: 'missRate', width: 14 },
    { key: 'avgLatency', width: 18 },
    { key: 'totalTime', width: 14 },
  ];

  const headerRow = ws.addRow([
    headers.policy,
    headers.hitRate,
    headers.missRate,
    headers.avgLatency,
    headers.totalTime,
  ]);
  headerRow.height = 24;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HEADER_ARGB } };
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = thinBorder();
  });

  results.forEach((r, i) => {
    const row = ws.addRow({
      policy: r.policy,
      hitRate: r.hitRate,
      missRate: r.missRate,
      avgLatency: r.avgLatencyUs,
      totalTime: r.totalTimeMs,
    });
    row.height = 22;
    const alt = i % 2 === 1;
    row.eachCell((cell, colNumber) => {
      if (colNumber >= 2) {
        cell.numFmt = '0.00';
      }
      cell.font = { bold: colNumber === 1, color: { argb: TEXT_ARGB }, size: 11 };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colNumber === 1 ? 'left' : 'right',
      };
      if (alt) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ROW_ALT_ARGB } };
      }
      cell.border = thinBorder();
    });
  });

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  downloadBlob(filename, blob);
}

function thinBorder() {
  const c = { argb: BORDER_ARGB };
  return {
    top: { style: 'thin' as const, color: c },
    left: { style: 'thin' as const, color: c },
    bottom: { style: 'thin' as const, color: c },
    right: { style: 'thin' as const, color: c },
  };
}
