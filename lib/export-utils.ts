// Export utilities for AshiatoMemo
import { AshiatoMemo } from '@/types';

function escapeCSV(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

export function exportMemoAsCSV(memo: AshiatoMemo): void {
  const rows: string[][] = [
    ['タイトル', memo.title],
    ['作成日', memo.createdAt.toLocaleDateString('ja-JP')],
  ];

  if (memo.prefecture) {
    rows.push(['都道府県', memo.prefecture]);
  }
  if (memo.district) {
    rows.push(['地区', memo.district]);
  }

  rows.push([]);
  rows.push(['カテゴリ', '内容', 'タグ']);

  memo.blocks
    .filter(block => block.text?.trim() || block.imageUrl)
    .sort((a, b) => a.order - b.order)
    .forEach(block => {
      rows.push([
        block.categoryName,
        block.text || '',
        block.tags.join('; '),
      ]);
    });

  const csvContent = rows
    .map(row => row.map(cell => escapeCSV(cell)).join(','))
    .join('\n');

  // BOM for Japanese Excel compatibility
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${memo.title}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function exportMemoAsPDF(
  contentElement: HTMLElement,
  title: string
): Promise<void> {
  const html2canvas = (await import('html2canvas')).default;
  const { jsPDF } = await import('jspdf');

  const canvas = await html2canvas(contentElement, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const imgWidth = 210; // A4 width in mm
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  const doc = new jsPDF('p', 'mm', 'a4');
  const pageHeight = 297; // A4 height in mm

  let yOffset = 0;
  let remainingHeight = imgHeight;

  while (remainingHeight > 0) {
    if (yOffset > 0) {
      doc.addPage();
    }
    doc.addImage(imgData, 'PNG', 0, -yOffset, imgWidth, imgHeight);
    yOffset += pageHeight;
    remainingHeight -= pageHeight;
  }

  doc.save(`${title}.pdf`);
}
