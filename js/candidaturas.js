(function (E) {
  const { Db, Erro, v, C } = E;
  E.Candidaturas = {
    async candidatar(cid, vagaId) {
      const vaga = await Db.get('vagas', vagaId);
      if (!vaga || vaga.status !== 'ativa') throw new Erro('Esta vaga não está recebendo candidaturas.');
      if (!await E.Candidatos.obter(cid)) throw new Erro('Apenas candidatos cadastrados podem se candidatar.');
      if ((await Db.where('candidaturas', c => c.vagaId === vagaId && c.candidatoId === cid)).length)
        throw new Erro('Você já se candidatou a esta vaga.');
      return Db.insert('candidaturas', { vagaId, candidatoId: cid, empresaId: vaga.empresaId, status: 'em_analise' });
    },
    async idsDoCandidato(cid) { return new Set((await Db.where('candidaturas', c => c.candidatoId === cid)).map(c => c.vagaId)); },
    async doCandidato(cid) {
      const l = await Db.where('candidaturas', c => c.candidatoId === cid);
      return Promise.all(l.reverse().map(async c => ({
        ...c, vaga: await Db.get('vagas', c.vagaId), empresa: (await E.Empresas.obter(c.empresaId))?.nome
      })));
    },
    async daEmpresa(eid) {
      const l = await Db.where('candidaturas', c => c.empresaId === eid);
      return Promise.all(l.reverse().map(async c => ({
        ...c, candidato: await E.Candidatos.obter(c.candidatoId), vaga: await Db.get('vagas', c.vagaId)
      })));
    },
    async mudarStatus(eid, id, status) {
      v.escolha(status, Object.keys(C.status), 'Status inválido.');
      const c = await Db.get('candidaturas', id);
      if (!c || c.empresaId !== eid) throw new Erro('Candidatura não encontrada.');
      return Db.update('candidaturas', id, { status });
    },
    removerDaVaga: vagaId => Db.removeWhere('candidaturas', c => c.vagaId === vagaId)
  };
})(window.E);
