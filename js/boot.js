// Carrega os módulos na ordem certa (funciona abrindo o arquivo direto, sem servidor).
['util','data','empresas','candidatos','vagas','candidaturas','auth','seed','ui','pages']
  .forEach(n => document.write('<script src="js/' + n + '.js"><\/script>'));
