import { memo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import type { BenchmarkResult } from '../../types';
import { stamp } from '../../utils/benchmarkExport';
import { exportBenchmarkExcel } from '../../utils/benchmarkExcel';

interface Props {
  results: BenchmarkResult[];
  label: string;
  hint: string;
  headers: {
    policy: string;
    hitRate: string;
    missRate: string;
    avgLatency: string;
    totalTime: string;
  };
  sheetName: string;
}

const btnMotion = { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, transition: { duration: 0.2 } };

export const TableExportButton = memo(function TableExportButton({ results, label, hint, headers, sheetName }: Props) {
  const [busy, setBusy] = useState(false);

  const onExport = useCallback(async () => {
    setBusy(true);
    try {
      const ts = stamp();
      await exportBenchmarkExcel(results, headers, sheetName, `lfu-benchmark-results-${ts}.xlsx`);
    } finally {
      setBusy(false);
    }
  }, [results, headers, sheetName]);

  return (
    <div className="bench-export-table">
      <motion.button
        type="button"
        className="btn btn--primary bench-export-btn"
        {...btnMotion}
        onClick={onExport}
        disabled={busy}
        title={hint}
      >
        {label}
      </motion.button>
      <p className="bench-export-table__hint">{hint}</p>
    </div>
  );
});
