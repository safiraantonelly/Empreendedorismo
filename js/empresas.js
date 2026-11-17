(function (E) {
  const { Db, Erro, v, C } = E;
  const pub = e => ({ id: e.id, nome: e.nome, segmento: e.segmento, cidade: e.cidade, descricao: e.descricao, whatsapp: e.whatsapp });
  E.Empresas = {
    validar(d) {
      return {
        nome: v.txt(d.nome, 'o nome da empresa', 2, 80),
        responsavel: v.txt(d.responsavel, 'o nome do responsável', 3, 80),
        whatsapp: v.tel(d.whatsapp),
        segmento: v.escolha(d.segmento, Object.keys(C.segmentos), 'Selecione o segmento de atuação.'),
        cidade: v.opc(d.cidade, 60, 'a cidade') || 'Mossoró',
        descricao: v.opc(d.descricao, 300, 'a descrição')
      };
    },
    criar: (id, email, d) => Db.insert('empresas', { id, email, ...d }),
    obter: id => Db.get('empresas', id),
    async atualizar(id, d) { return Db.update('empresas', id, this.validar(d)); },
    async listar() { return (await Db.list('empresas')).map(pub); },
    async perfilPublico(id) {
      const e = await Db.get('empresas', id);
      if (!e) throw new Erro('Empresa não encontrada.');
      return { empresa: pub(e), vagas: await E.Vagas.ativasDaEmpresa(id) };
    }
  };
})(window.E);
