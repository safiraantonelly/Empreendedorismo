(function (E) {
  const { Ui, esc, C, fmtTel, fmtTam } = E, $ = Ui.$;
  const AV = { comercio: '🛍️', servicos: '🛠️', tecnologia: '💻', gastronomia: '☕', outros: '🏢' };
  const dados = f => Object.fromEntries([...f.elements].filter(e => (e.name || e.id) && !['submit', 'button', 'file'].includes(e.type)).map(e => [e.name || e.id, e.value]));
  const op = (a, ph) => (ph === undefined ? '' : `<option value="">${ph}</option>`) + a.map(x => `<option>${esc(x)}</option>`).join('');
  const opo = (o, sel) => Object.entries(o).map(([k, l]) => `<option value="${k}"${k === sel ? ' selected' : ''}>${esc(l)}</option>`).join('');
  const badge = s => `<span class="badge s-${s}">${esc(C.status[s] || C.statusVaga[s] || s)}</span>`;
  const on = (el, ev, fn) => el.addEventListener(ev, fn);
  const run = (m, fn) => async (...a) => { try { Ui.msg(m, ''); await fn(...a); } catch (e) { Ui.falha(m, e); } };
  const sub = (f, m, fn) => on(f, 'submit', e => { e.preventDefault(); run(m, fn)(); });

  async function pEmpresa(s) {
    $('#painel-empresa').hidden = false;
    const f = $('#form-vaga'), m = $('#msg-vaga'), mg = $('#msg-gestao'); let edit = null, cache = [];
    $('#v-area').innerHTML = op(C.areas); $('#v-mod').innerHTML = op(C.modalidades); $('#v-tipo').innerHTML = op(C.tipos);
    const reset = () => { edit = null; f.reset(); $('#titulo-form').textContent = 'Publicar nova vaga'; $('#btn-vaga').textContent = 'Publicar vaga'; $('#cancelar').hidden = true; };
    const carregar = async () => {
      const [vs, cs] = await Promise.all([E.Vagas.daEmpresa(s.uid), E.Candidaturas.daEmpresa(s.uid)]); cache = vs;
      $('#lista-vagas').innerHTML = vs.map(x => {
        const n = cs.filter(c => c.vagaId === x.id).length, fim = x.status === 'encerrada', alvo = x.status === 'ativa' ? 'pausada' : 'ativa';
        return `<div class="card-member"><h3>${esc(x.titulo)}</h3><span class="category">${esc(x.area)}</span> ${badge(x.status)}
          <p class="meta">${esc(x.modalidade)} · ${esc(x.tipo)} · ${esc(x.cidade)} · ${n} candidatura(s)</p><div class="acoes">
          ${fim ? '' : `<button data-acao="editar" data-id="${x.id}">Editar</button><button data-acao="${alvo}" data-id="${x.id}">${alvo === 'pausada' ? 'Pausar' : 'Reativar'}</button><button data-acao="encerrada" data-id="${x.id}">Encerrar</button>`}
          <button class="perigo" data-acao="excluir" data-id="${x.id}">Excluir</button></div></div>`;
      }).join('') || '<p>Você ainda não publicou vagas.</p>';
      $('#lista-cands').innerHTML = cs.length ? `<table><thead><tr><th>Candidato</th><th>Vaga</th><th>Habilidades</th><th>Currículo</th><th>Status</th></tr></thead><tbody>${cs.map(c => {
        const k = c.candidato || {}, cv = k.curriculo;
        return `<tr><td><strong>${esc(k.nome)}</strong><br>${esc(k.email)}<br>${esc(fmtTel(k.telefone || ''))}</td><td>${esc(c.vaga?.titulo)}</td>
          <td>${(k.habilidades || []).map(h => `<span class="category">${esc(h)}</span>`).join(' ')}</td>
          <td>${cv ? `<a href="${esc(cv.base64)}" download="${esc(cv.nome)}">${esc(cv.nome)}</a> (${fmtTam(cv.tamanho)})` : '—'}</td>
          <td><select data-cid="${c.id}">${opo(C.status, c.status)}</select></td></tr>`;
      }).join('')}</tbody></table>` : '<p>Nenhuma candidatura recebida ainda.</p>';
    };
    sub(f, m, async () => {
      const d = dados(f);
      if (edit) { await E.Vagas.editar(s.uid, edit, d); Ui.msg(m, 'Vaga atualizada.', 'ok'); }
      else { await E.Vagas.criar(s.uid, d); Ui.msg(m, 'Vaga publicada!', 'ok'); }
      reset(); await carregar();
    });
    on($('#cancelar'), 'click', reset);
    on($('#lista-vagas'), 'click', run(mg, async e => {
      const b = e.target.closest('button[data-acao]'); if (!b) return; const { acao, id } = b.dataset;
      if (acao === 'editar') {
        const x = cache.find(y => y.id === id); edit = id;
        for (const k of ['titulo', 'cidade', 'salario', 'descricao', 'requisitos']) $('#v-' + k).value = x[k];
        $('#v-area').value = x.area; $('#v-mod').value = x.modalidade; $('#v-tipo').value = x.tipo;
        $('#titulo-form').textContent = 'Editar vaga'; $('#btn-vaga').textContent = 'Salvar alterações'; $('#cancelar').hidden = false;
        return f.scrollIntoView({ behavior: 'smooth' });
      }
      if (acao === 'excluir') {
        if (!confirm('Excluir esta vaga e todas as candidaturas recebidas? Esta ação não pode ser desfeita.')) return;
        await E.Vagas.excluir(s.uid, id);
      } else {
        if (acao === 'encerrada' && !confirm('Encerrar esta vaga? Ela não poderá ser reaberta.')) return;
        await E.Vagas.alterarStatus(s.uid, id, acao);
      }
      await carregar();
    }));
    on($('#lista-cands'), 'change', run(mg, async e => {
      const sel = e.target.closest('select[data-cid]'); if (!sel) return;
      await E.Candidaturas.mudarStatus(s.uid, sel.dataset.cid, sel.value); Ui.msg(mg, 'Status atualizado.', 'ok');
    }));
    await carregar();
  }

  async function pCand(s) {
    $('#painel-candidato').hidden = false;
    const f = $('#form-perfil'), m = $('#msg-perfil');
    const pintar = async () => {
      const c = await E.Candidatos.obter(s.uid);
      for (const k of ['nome', 'cidade', 'resumo']) $('#p-' + k).value = c[k] || '';
      $('#p-telefone').value = fmtTel(c.telefone || ''); $('#p-habilidades').value = (c.habilidades || []).join(', ');
      $('#cv-atual').textContent = c.curriculo ? `Currículo atual: ${c.curriculo.nome} (${fmtTam(c.curriculo.tamanho)})` : 'Nenhum currículo enviado.';
      const cs = await E.Candidaturas.doCandidato(s.uid);
      $('#lista-cands').innerHTML = cs.map(x => `<div class="card-member"><h3>${esc(x.vaga?.titulo || 'Vaga removida')}</h3><span class="category">${esc(x.empresa || '')}</span> ${badge(x.status)}<p class="meta">Enviada em ${E.data(x.criadoEm)}</p></div>`).join('') || '<p>Você ainda não se candidatou. <a href="vagas.html">Buscar vagas</a></p>';
    };
    sub(f, m, async () => {
      const file = $('#curriculo').files[0];
      await E.Candidatos.atualizar(s.uid, dados(f));
      if (file) await E.Candidatos.definirCurriculo(s.uid, file);
      $('#curriculo').value = ''; Ui.msg(m, 'Perfil salvo!', 'ok'); await pintar();
    });
    await pintar();
  }

  const Pages = {
    async index() {
      $('#lista-empresas').innerHTML = (await E.Empresas.listar()).slice(0, 6).map(e => `<div class="card-member"><div class="member-avatar">${AV[e.segmento] || '🏢'}</div><h3>${esc(e.nome)}</h3><span class="category">${esc(C.segmentos[e.segmento])}</span><p>${esc(e.descricao)}</p><p><a href="empresa.html?id=${esc(e.id)}">Ver perfil e vagas</a></p></div>`).join('') || '<p>Nenhuma empresa cadastrada ainda.</p>';
      const f = $('#form-empresa');
      sub(f, $('#msg-empresa'), async () => {
        const d = dados(f);
        await E.Auth.cadastrar({ perfil: 'empresa', email: d.email, senha: d.senha, dados: { nome: d.empresa, responsavel: d.nome, whatsapp: d.whatsapp, segmento: d.segmento } });
        await E.Auth.login(d.email, d.senha); location.href = 'painel.html';
      });
    },
    async entrar() {
      if (E.Auth.sessao()) return location.replace('painel.html');
      const nx = new URLSearchParams(location.search).get('next');
      const destino = /^[\w-]+\.html(\?[\w=&.%-]*)?$/.test(nx || '') ? nx : 'painel.html';
      const fl = $('#form-login'), fc = $('#form-cadastro');
      sub(fl, $('#msg-login'), async () => { const d = dados(fl); await E.Auth.login(d.email, d.senha); location.href = destino; });
      sub(fc, $('#msg-cadastro'), async () => { const d = dados(fc); await E.Auth.cadastrar({ perfil: 'candidato', email: d.email, senha: d.senha, dados: d }); await E.Auth.login(d.email, d.senha); location.href = destino; });
    },
    async vagas() {
      const f = $('#form-filtros'), m = $('#msg'), s = E.Auth.sessao(); let pag = 1, ap = new Set();
      $('#f-area').innerHTML = op(C.areas, 'Todas as áreas'); $('#f-mod').innerHTML = op(C.modalidades, 'Todas as modalidades'); $('#f-tipo').innerHTML = op(C.tipos, 'Todos os tipos');
      if (s?.perfil === 'candidato') ap = await E.Candidaturas.idsDoCandidato(s.uid);
      const buscar = run(m, async () => {
        const r = await E.Vagas.buscar({ ...dados(f), pagina: pag }); pag = r.pagina;
        $('#resumo').textContent = `${r.total} vaga(s) encontrada(s)`;
        $('#resultados').innerHTML = r.itens.map(x => Ui.vagaCard(x, ap.has(x.id) ? '<button class="btn-submit" disabled>Candidatura enviada</button>' : `<button class="btn-submit" data-acao="candidatar" data-id="${x.id}">Candidatar-se</button>`)).join('') || '<p>Nenhuma vaga encontrada com esses filtros.</p>';
        $('#paginacao').innerHTML = r.paginas > 1 ? Array.from({ length: r.paginas }, (_, i) => `<button class="${i + 1 === pag ? 'ativo' : ''}" data-pag="${i + 1}">${i + 1}</button>`).join('') : '';
      });
      on(f, 'submit', e => { e.preventDefault(); pag = 1; buscar(); });
      on($('#paginacao'), 'click', e => { const b = e.target.closest('[data-pag]'); if (b) { pag = +b.dataset.pag; buscar(); scrollTo({ top: 0, behavior: 'smooth' }); } });
      on($('#resultados'), 'click', run(m, async e => {
        const b = e.target.closest('[data-acao="candidatar"]'); if (!b) return;
        if (!s) return location.assign('entrar.html?next=vagas.html');
        if (s.perfil !== 'candidato') throw new E.Erro('Entre como candidato para se candidatar às vagas.');
        await E.Candidaturas.candidatar(s.uid, b.dataset.id); ap.add(b.dataset.id);
        await buscar(); Ui.msg(m, 'Candidatura enviada! Acompanhe o status no seu painel.', 'ok');
      }));
      buscar();
    },
    async empresa() {
      const m = $('#msg');
      try {
        const { empresa: e, vagas } = await E.Empresas.perfilPublico(new URLSearchParams(location.search).get('id'));
        document.title = `${e.nome} - Empreende Mossoró`;
        $('#cabecalho').innerHTML = `<div class="member-avatar">${AV[e.segmento] || '🏢'}</div><h3>${esc(e.nome)}</h3><span class="category">${esc(C.segmentos[e.segmento])}</span><p>${esc(e.descricao)}</p><p class="meta">📍 ${esc(e.cidade)} · WhatsApp: ${esc(fmtTel(e.whatsapp))}</p>`;
        $('#resultados').innerHTML = vagas.map(x => Ui.vagaCard(x, '<a class="btn-main" href="vagas.html">Candidatar-se na busca de vagas</a>')).join('') || '<p>Esta empresa não tem vagas ativas no momento.</p>';
      } catch (e) { Ui.falha(m, e); }
    },
    async painel() {
      const s = E.Auth.exigir(); if (!s) return;
      await (s.perfil === 'empresa' ? pEmpresa : pCand)(s);
    }
  };

  document.addEventListener('DOMContentLoaded', async () => {
    try { await E.Seed.rodar(); } catch (e) { console.error('Seed:', e); }
    Ui.nav();
    try { await Pages[document.body.dataset.page]?.(); } catch (e) { console.error(e); }
  });
})(window.E);
