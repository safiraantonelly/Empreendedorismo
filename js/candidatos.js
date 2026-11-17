(function (E) {
  const { Db, Erro, v } = E;
  const lista = x => {
    const vis = new Set();
    return (Array.isArray(x) ? x : String(x || '').split(',')).map(s => s.trim()).filter(s => {
      const k = s.toLowerCase(); if (!s || vis.has(k)) return false; vis.add(k); return true;
    });
  };
  E.Candidatos = {
    validar(d, exigirHab = false) {
      const h = lista(d.habilidades);
      if (exigirHab && !h.length) throw new Erro('Informe ao menos uma habilidade.');
      if (h.length > 20 || h.some(s => s.length > 40)) throw new Erro('Use até 20 habilidades, com no máximo 40 caracteres cada.');
      return {
        nome: v.txt(d.nome, 'seu nome', 3, 80), telefone: v.tel(d.telefone),
        cidade: v.txt(d.cidade, 'a cidade', 2, 60), resumo: v.opc(d.resumo, 600, 'o resumo'), habilidades: h
      };
    },
    criar: (id, email, d) => Db.insert('candidatos', { id, email, curriculo: null, ...d }),
    obter: id => Db.get('candidatos', id),
    async atualizar(id, d) { return Db.update('candidatos', id, this.validar(d, true)); },
    async definirCurriculo(id, file) {
      if (!file) throw new Erro('Selecione um arquivo.');
      if (!/\.(pdf|docx?)$/i.test(file.name)) throw new Erro('Formato inválido. Envie um arquivo PDF, DOC ou DOCX.');
      if (file.size === 0) throw new Erro('O arquivo está vazio.');
      if (file.size > 5 * 1024 * 1024) throw new Erro('O currículo deve ter no máximo 5 MB.');
      const base64 = await new Promise((ok, no) => {
        const r = new FileReader();
        r.onload = () => ok(r.result); r.onerror = () => no(new Erro('Não foi possível ler o arquivo.'));
        r.readAsDataURL(file);
      });
      return Db.update('candidatos', id, { curriculo: { nome: file.name.slice(0, 120), tamanho: file.size, base64 } });
    }
  };
})(window.E);
