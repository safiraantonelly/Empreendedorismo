window.E = {};
(function (E) {
  class Erro extends Error {}
  const C = {
    areas: ['Tecnologia', 'Vendas', 'Atendimento', 'Administrativo', 'Gastronomia', 'Serviços', 'Outros'],
    modalidades: ['Presencial', 'Remoto', 'Híbrido'],
    tipos: ['CLT', 'PJ', 'Estágio', 'Temporário', 'Freelancer'],
    segmentos: { comercio: 'Comércio / Varejo', servicos: 'Prestação de Serviços', tecnologia: 'Tecnologia / Inovação', gastronomia: 'Gastronomia / Alimentação', outros: 'Outros' },
    status: { em_analise: 'Em análise', entrevista: 'Entrevista', aprovado: 'Aprovado', recusado: 'Recusado' },
    statusVaga: { ativa: 'Ativa', pausada: 'Pausada', encerrada: 'Encerrada' }
  };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const v = {
    txt(x, nome, min = 2, max = 100) {
      x = String(x ?? '').trim();
      if (!x) throw new Erro(`Informe ${nome}.`);
      if (x.length < min || x.length > max) throw new Erro(`Verifique ${nome}: use entre ${min} e ${max} caracteres.`);
      return x;
    },
    opc(x, max, nome) {
      x = String(x ?? '').trim();
      if (x.length > max) throw new Erro(`Verifique ${nome}: máximo de ${max} caracteres.`);
      return x;
    },
    email(x) {
      x = String(x ?? '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x)) throw new Erro('Informe um e-mail válido.');
      return x;
    },
    senha(x) {
      x = String(x ?? '');
      if (x.length < 8 || !/[A-Za-z]/.test(x) || !/\d/.test(x)) throw new Erro('A senha deve ter ao menos 8 caracteres, com letras e números.');
      return x;
    },
    tel(x) {
      const d = String(x ?? '').replace(/\D/g, '');
      if (d.length < 10 || d.length > 11) throw new Erro('Informe um telefone válido, com DDD.');
      return d;
    },
    escolha(x, lista, msg) { if (!lista.includes(x)) throw new Erro(msg); return x; }
  };
  Object.assign(E, {
    Erro, C, esc, v,
    fmtTel: d => d.length >= 10 ? `(${d.slice(0, 2)}) ${d.slice(2, -4)}-${d.slice(-4)}` : d,
    fmtTam: b => b < 1048576 ? Math.max(1, Math.round(b / 1024)) + ' KB' : (b / 1048576).toFixed(1) + ' MB',
    data: i => new Date(i).toLocaleDateString('pt-BR')
  });
})(window.E);
