(function (E) {
  const { Db, Erro, v } = E;
  const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
  const hash = async (senha, salt) => {
    if (!window.crypto?.subtle) throw new Erro('Este navegador não oferece criptografia segura. Abra o site por http://localhost.');
    return hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + senha)));
  };
  E.Auth = {
    async cadastrar({ perfil, email, senha, dados }) {
      if (!['empresa', 'candidato'].includes(perfil)) throw new Erro('Perfil inválido.');
      email = v.email(email); v.senha(senha);
      const alvo = perfil === 'empresa' ? E.Empresas : E.Candidatos;
      const limpo = alvo.validar(dados);                 // valida tudo antes de gravar qualquer coisa
      if ((await Db.where('usuarios', u => u.email === email)).length) throw new Erro('Este e-mail já está cadastrado.');
      const salt = hex(crypto.getRandomValues(new Uint8Array(16)));
      const u = await Db.insert('usuarios', { perfil, email, salt, hash: await hash(senha, salt) });
      await alvo.criar(u.id, email, limpo);
      return u.id;
    },
    async login(email, senha) {
      const u = (await Db.where('usuarios', x => x.email === String(email || '').trim().toLowerCase()))[0];
      if (!u || u.hash !== await hash(String(senha || ''), u.salt)) throw new Erro('E-mail ou senha incorretos.');
      Db.kv.set('sessao', { uid: u.id, perfil: u.perfil });
      return { uid: u.id, perfil: u.perfil };
    },
    sessao: () => Db.kv.get('sessao'),
    logout: () => Db.kv.del('sessao'),
    exigir() {
      const s = this.sessao();
      if (!s) { location.replace('entrar.html?next=' + encodeURIComponent(location.pathname.split('/').pop() || 'painel.html')); return null; }
      return s;
    }
  };
})(window.E);
