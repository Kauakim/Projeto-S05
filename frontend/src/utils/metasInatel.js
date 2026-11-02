/**
 * Metas Curriculares Oficiais do Inatel por Curso:
 * - Meta de AC (Atividades Complementares): sempre 200h para qualquer curso.
 * - Meta de Trilha:
 *   - Engenharia Biomédica: 20h
 *   - Engenharia de Controle e Automação: 20h
 *   - Engenharia de Computação: 60h
 *   - Engenharia Elétrica: 20h
 *   - Engenharia de Produção: 60h
 *   - Engenharia de Software: 60h
 *   - Engenharia de Telecomunicações: 20h
 * - Meta de CP (Competências Pessoais):
 *   - Engenharia Biomédica: 20h
 *   - Engenharia de Controle e Automação: 20h
 *   - Engenharia de Computação: 40h
 *   - Engenharia Elétrica: 20h
 *   - Engenharia de Produção: 40h
 *   - Engenharia de Software: 40h
 *   - Engenharia de Telecomunicações: 20h
 */

export const METAS_CURSOS_INATEL = {
  'Engenharia Biomédica': { ac: 200, cp: 20, trilha: 20 },
  'Engenharia de Controle e Automação': { ac: 200, cp: 20, trilha: 20 },
  'Engenharia de Computação': { ac: 200, cp: 40, trilha: 60 },
  'Engenharia Elétrica': { ac: 200, cp: 20, trilha: 20 },
  'Engenharia de Produção': { ac: 200, cp: 40, trilha: 60 },
  'Engenharia de Software': { ac: 200, cp: 40, trilha: 60 },
  'Engenharia de Telecomunicações': { ac: 200, cp: 20, trilha: 20 },
};

export function obterMetasPorCurso(nomeCurso) {
  const padrao = { ac: 200, cp: 40, trilha: 60 };
  if (!nomeCurso) return padrao;
  const cursoNorm = String(nomeCurso).trim().toLowerCase();

  if (cursoNorm.includes('software')) {
    return { ac: 200, cp: 40, trilha: 60 };
  }
  if (cursoNorm.includes('computa')) {
    return { ac: 200, cp: 40, trilha: 60 };
  }
  if (cursoNorm.includes('produ')) {
    return { ac: 200, cp: 40, trilha: 60 };
  }
  if (cursoNorm.includes('biom')) {
    return { ac: 200, cp: 20, trilha: 20 };
  }
  if (cursoNorm.includes('controle') || cursoNorm.includes('automa')) {
    return { ac: 200, cp: 20, trilha: 20 };
  }
  if (cursoNorm.includes('elétr') || cursoNorm.includes('eletri')) {
    return { ac: 200, cp: 20, trilha: 20 };
  }
  if (cursoNorm.includes('telecom')) {
    return { ac: 200, cp: 20, trilha: 20 };
  }

  return padrao;
}

