// CAMADA DE DADOS: único arquivo que conhece o localStorage.
// Para usar uma API, reimplemente estes métodos (todos assíncronos) com fetch().
(function (E) {
  const P = 'empreende:';
  const ler = k => { try { return JSON.parse(localStorage.getItem(P + k)); } catch { return null; } };
  const gravar = (k, v) => {
    try { localStorage.setItem(P + k, JSON.stringify(v)); }
    catch { throw new E.Erro('O armazenamento do navegador está cheio. Use um arquivo menor ou limpe dados do site.'); }
  };
  const uid = () => crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  E.Db = {
    uid,
    async list(c) { return ler(c) || []; },
    async get(c, id) { return (await this.list(c)).find(x => x.id === id) || null; },
    async where(c, fn) { return (await this.list(c)).filter(fn); },
    async insert(c, o) {
      const l = await this.list(c), n = { id: uid(), ...o, criadoEm: new Date().toISOString() };
      l.push(n); gravar(c, l); return n;
    },
    async update(c, id, patch) {
      const l = await this.list(c), i = l.findIndex(x => x.id === id);
      if (i < 0) throw new E.Erro('Registro não encontrado.');
      l[i] = { ...l[i], ...patch }; gravar(c, l); return l[i];
    },
    async remove(c, id) { gravar(c, (await this.list(c)).filter(x => x.id !== id)); },
    async removeWhere(c, fn) { gravar(c, (await this.list(c)).filter(x => !fn(x))); },
    // Chave/valor simples (sessão, flag do seed)
    kv: { get: ler, set: gravar, del: k => localStorage.removeItem(P + k) }
  };
})(window.E);
