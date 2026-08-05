/** Geometria pura do braço — sem React, sem SVG, testável.
 *
 *  A física de verdade: a casa n fica a  L × (1 − 2^(−n/12))  do capotraste.
 *  É por isso que as casas apertam conforme sobem e a 12ª divide a corda
 *  ao meio. Uma foto gerada não respeita isso; a matemática respeita. */

/** Posição da casa n (0 = capotraste) normalizada pra [0..1] no trecho visível */
export function fretX(n: number, totalFrets: number): number {
  const raw = (k: number) => 1 - Math.pow(2, -k / 12)
  return raw(n) / raw(totalFrets)
}

/** Centro da célula da casa n (entre a casa n-1 e a n) — onde o dedo pisa */
export function cellCenterX(n: number, totalFrets: number): number {
  if (n === 0) return 0 // corda solta: no capotraste
  return (fretX(n - 1, totalFrets) + fretX(n, totalFrets)) / 2
}

/** Casas com marcador (bolinha) no padrão universal; a 12ª e a 24ª são duplas */
export const MARKER_FRETS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]

export function isDoubleMarker(n: number): boolean {
  return n === 12 || n === 24
}

/** Espessura relativa da corda i (0 = mais grave/grossa) pra desenho */
export function stringWeight(index: number, stringCount: number): number {
  // da mais grossa (1) pra mais fina (0)
  return 1 - index / (stringCount - 1)
}
