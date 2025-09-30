export interface Subject {
  name: string;
  value: number | null;
  weight: number;
}

export interface HensachiResult {
  total: number;
  subjects: { name: string; value: number }[];
  hasAshikiri: boolean;
}

export function calculateHensachi(subjects: Subject[]): HensachiResult | null {
  const validSubjects = subjects.filter((s) => s.value !== null && s.value !== undefined);

  if (validSubjects.length === 0) {
    return null;
  }

  let totalSum = 0;
  let totalWeight = 0;
  const hasAshikiri = validSubjects.some((s) => s.value !== null && s.value < 40);

  validSubjects.forEach((subject) => {
    if (subject.value !== null) {
      totalSum += subject.value * subject.weight;
      totalWeight += subject.weight;
    }
  });

  const total = totalWeight > 0 ? totalSum / totalWeight : 0;

  return {
    total: Number(total.toFixed(2)),
    subjects: validSubjects.map((s) => ({
      name: s.name,
      value: s.value!,
    })),
    hasAshikiri,
  };
}

export function getTweetMessage(total: number, hasAshikiri: boolean, subjects: { name: string; value: number | string }[]): string {
  const subjectLines = subjects
    .map((s) => {
      const shortName = s.name
        .replace('財務会計論', '財務')
        .replace('管理会計論', '管理')
        .replace('監査論', '監査')
        .replace('企業法', '企業')
        .replace('租税法', '租税')
        .replace('経営学', '経営');
      return `${shortName}：${s.value}`;
    })
    .join('\n');

  if (hasAshikiri) {
    return `${subjectLines}\n\n総合偏差値：${total}、残念ながら、足切りです...☠️ #会計士 #偏差値計算`;
  }

  let message = '';
  if (total >= 65) {
    message = `総合偏差値${total}！？やるやん！天才爆誕！？🤯`;
  } else if (total >= 60) {
    message = `総合偏差値${total}！いいね！このまま突っ走れ～💨`;
  } else if (total >= 55) {
    message = `総合偏差値${total}、ジワジワきてる、その調子🔥`;
  } else if (total >= 52) {
    message = `総合偏差値${total}！もうひと伸び！次の自分に期待😎`;
  } else if (total >= 50) {
    message = `総合偏差値${total}、おしい！あとちょっとでゾーン突入🚀`;
  } else {
    message = `総合偏差値${total}。まだまだここから！レベチ目指してリベンジ🔥`;
  }

  return `${subjectLines}\n\n${message}\n#公認会計士 #偏差値計算`;
}