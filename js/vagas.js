(function (E) {
  const { Db, Erro, v, C } = E;
  const norm = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const anexar = async l => {
    const m = Object.fromEntries((await E.Empresas.listar()).map(e => [e.id, e.nome]));
    return l.map(x => ({ ...x, empresa: m[x.empresaId] || '' }));
  };
  const propria = async (eid, id) => {
    const x = await Db.get('vagas', id);
    if (!x || x.empresaId !== eid) throw new Erro('Vaga não encontrada.');
    return x;
  };
  E.Vagas = {
    validar(d) {
      return {
        titulo: v.txt(d.titulo, 'o título da vaga', 5, 80),
        area: v.escolha(d.area, C.areas, 'Selecione a área.'),
        modalidade: v.escolha(d.modalidade, C.modalidades, 'Selecione a modalidade.'),
        tipo: v.escolha(d.tipo, C.tipos, 'Selecione o tipo de contratação.'),
        cidade: v.txt(d.cidade, 'a cidade', 2, 60),
        salario: v.opc(d.salario, 40, 'a remuneração'),
        descricao: v.txt(d.descricao, 'a descrição', 20, 2000),
        requisitos: v.opc(d.requisitos, 1000, 'os requisitos')
      };
    },
    async criar(eid, d) {
      if (!await E.Empresas.obter(eid)) throw new Erro('Apenas empresas cadastradas podem publicar vagas.');
      return Db.insert('vagas', { empresaId: eid, status: 'ativa', ...this.validar(d) });
    },
    async editar(eid, id, d) {
      const x = await propria(eid, id);
      if (x.status === 'encerrada') throw new Erro('Vagas encerradas não podem ser editadas.');
      return Db.update('vagas', id, this.validar(d));
    },
    async alterarStatus(eid, id, status) {
      v.escolha(status, Object.keys(C.statusVaga), 'Status de vaga inválido.');
      const x = await propria(eid, id);
      if (x.status === 'encerrada') throw new Erro('Esta vaga já foi encerrada e não pode ser reaberta.');
      return Db.update('vagas', id, { status });
    },
    async excluir(eid, id) {
      await propria(eid, id);
      await E.Candidaturas.removerDaVaga(id);
      await Db.remove('vagas', id);
    },
    async daEmpresa(eid) { return anexar((await Db.where('vagas', x => x.empresaId === eid)).reverse()); },
    async ativasDaEmpresa(eid) { return anexar((await Db.where('vagas', x => x.empresaId === eid && x.status === 'ativa')).reverse()); },
    async buscar({ q, area, modalidade, tipo, cidade, pagina = 1, porPagina = 3 } = {}) {
      let l = await anexar(await Db.where('vagas', x => x.status === 'ativa'));
      q = norm(q); cidade = norm(cidade);
      l = l.filter(x => (!q || norm([x.titulo, x.descricao, x.requisitos, x.empresa].join(' ')).includes(q))
        && (!area || x.area === area) && (!modalidade || x.modalidade === modalidade)
        && (!tipo || x.tipo === tipo) && (!cidade || norm(x.cidade).includes(cidade)));
      l.reverse();
      const total = l.length, paginas = Math.max(1, Math.ceil(total / porPagina));
      pagina = Math.min(Math.max(1, +pagina || 1), paginas);
      return { itens: l.slice((pagina - 1) * porPagina, pagina * porPagina), total, pagina, paginas };
    }
  };
})(window.E);
