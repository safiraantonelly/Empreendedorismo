(function (E) {
  const { esc } = E;
  E.Ui = {
    $: (s, r = document) => r.querySelector(s),
    msg(el, txt, tipo = 'erro') { el.className = 'msg ' + tipo; el.textContent = txt; el.hidden = !txt; },
    falha(el, e) {
      if (!(e instanceof E.Erro)) console.error(e);
      this.msg(el, e instanceof E.Erro ? e.message : 'Ocorreu um erro inesperado. Tente novamente.');
    },
    nav() {
      const s = E.Auth.sessao();
      document.querySelector('.nav-links').insertAdjacentHTML('beforeend',
        '<li><a href="vagas.html">Vagas</a></li>' + (s
          ? '<li><a href="painel.html">Meu painel</a></li><li><a href="#" id="sair">Sair</a></li>'
          : '<li><a href="entrar.html">Entrar</a></li>'));
      document.getElementById('sair')?.addEventListener('click', e => { e.preventDefault(); E.Auth.logout(); location.href = 'index.html'; });
    },
    vagaCard(x, extra = '') {
      return `<div class="card-member"><h3>${esc(x.titulo)}</h3><span class="category">${esc(x.area)}</span>
        <p class="meta"><a href="empresa.html?id=${esc(x.empresaId)}">${esc(x.empresa)}</a> · ${esc(x.cidade)}</p>
        <p class="meta">${esc(x.modalidade)} · ${esc(x.tipo)}${x.salario ? ' · ' + esc(x.salario) : ''}</p>
        <p>${esc(x.descricao)}</p>${x.requisitos ? `<p class="meta"><strong>Requisitos:</strong> ${esc(x.requisitos)}</p>` : ''}${extra}</div>`;
    }
  };
})(window.E);
