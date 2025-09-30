// hensachi-calc.js

/**
 * 入力値から有効な偏差値データのみ抽出し、平均とラベル・値配列を返す
 * @param {Array<{name: string, value: string|number}>} subjects
 * @returns {{average: number, filteredLabels: string[], filteredValues: number[]}}
 */
export function calcHensachi(subjects) {
  const filtered = subjects.filter(
    (s) => s.value !== '' && !isNaN(Number(s.value))
  );
  if (filtered.length === 0) {
    return { average: null, filteredLabels: [], filteredValues: [] };
  }
  const values = filtered.map((s) => Number(s.value));
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    average: avg,
    filteredLabels: filtered.map((s) => s.name),
    filteredValues: values,
  };
}
