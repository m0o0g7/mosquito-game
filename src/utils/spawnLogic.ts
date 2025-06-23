// src/utils/spawnLogic.ts
/**
 * 현재 점수(score)에 따라 다음 모기 스폰까지의 간격(초 단위)을 계산
 */
export function getSpawnInterval(score: number): number {
  // 0~4점 → 1.0초, 5~9점 → 0.8초, … 15점 이상 → 0.6초 (최소값)
  return Math.max(0.15, 0.3 - 0.01 * Math.floor(score / 5));
}
