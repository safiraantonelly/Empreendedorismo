// Dados de exemplo (executa uma vez). Senha de todas as contas: Senha123
(function (E) {
  E.Seed = {
    async rodar() {
      if (E.Db.kv.get('seed')) return;
      const mk = (perfil, email, dados) => E.Auth.cadastrar({ perfil, email, senha: 'Senha123', dados });
      const cafe = await mk('empresa', 'contato@cafedooeste.com.br', { nome: 'Café do Oeste', responsavel: 'Maria Silva', whatsapp: '84999990001', segmento: 'gastronomia', cidade: 'Mossoró', descricao: 'Cafeteria artesanal focada em grãos regionais e ambiente para reuniões de negócios.' });
      const tech = await mk('empresa', 'contato@mossorotech.com.br', { nome: 'Mossoró Tech', responsavel: 'João Pereira', whatsapp: '84999990002', segmento: 'tecnologia', cidade: 'Mossoró', descricao: 'Desenvolvimento de softwares e soluções digitais sob medida para o comércio local.' });
      const vaga = (eid, titulo, area, modalidade, tipo, cidade, salario, descricao, requisitos) =>
        E.Vagas.criar(eid, { titulo, area, modalidade, tipo, cidade, salario, descricao, requisitos });
      const v1 = await vaga(cafe, 'Barista', 'Gastronomia', 'Presencial', 'CLT', 'Mossoró', 'R$ 1.800', 'Preparo de cafés especiais e atendimento no balcão da cafeteria.', 'Experiência com cafeteria é um diferencial.');
      await vaga(cafe, 'Atendente de Salão', 'Atendimento', 'Presencial', 'Temporário', 'Mossoró', 'R$ 1.500', 'Atendimento às mesas e organização do salão em horários de pico.', 'Boa comunicação e disponibilidade nos fins de semana.');
      const v3 = await vaga(tech, 'Desenvolvedor Front-end Júnior', 'Tecnologia', 'Híbrido', 'CLT', 'Mossoró', 'R$ 3.000', 'Desenvolvimento de interfaces web para clientes do comércio local.', 'HTML, CSS, JavaScript e Git.');
      await vaga(tech, 'Estagiário de Suporte Técnico', 'Tecnologia', 'Presencial', 'Estágio', 'Mossoró', 'R$ 1.100', 'Apoio ao suporte de sistemas e atendimento a clientes da empresa.', 'Cursando Informática ou áreas afins.');
      await vaga(tech, 'Analista de Marketing Digital', 'Vendas', 'Remoto', 'PJ', 'Natal', 'A combinar', 'Gestão de redes sociais e campanhas pagas para clientes da empresa.', 'Experiência com Meta Ads e Canva.');
      const ana = await mk('candidato', 'ana.souza@exemplo.com', { nome: 'Ana Beatriz Souza', telefone: '84999990011', cidade: 'Mossoró', resumo: 'Experiência em atendimento ao público e rotinas de loja.', habilidades: ['Atendimento', 'Excel', 'Comunicação'] });
      const carlos = await mk('candidato', 'carlos.lima@exemplo.com', { nome: 'Carlos Eduardo Lima', telefone: '84999990012', cidade: 'Mossoró', resumo: 'Estudante de sistemas de informação, buscando a primeira vaga na área.', habilidades: ['JavaScript', 'HTML', 'CSS', 'Git'] });
      await mk('candidato', 'fernanda.alves@exemplo.com', { nome: 'Fernanda Alves', telefone: '84999990013', cidade: 'Natal', resumo: 'Atuação em vendas e criação de conteúdo para redes sociais.', habilidades: ['Vendas', 'Redes sociais', 'Canva'] });
      const c1 = await E.Candidaturas.candidatar(ana, v1.id);
      await E.Candidaturas.mudarStatus(cafe, c1.id, 'entrevista');
      await E.Candidaturas.candidatar(carlos, v3.id);
      E.Db.kv.set('seed', true);
    }
  };
})(window.E);
