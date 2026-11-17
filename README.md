# Empreende Mossoró — back-end no navegador

Abrir: dê dois cliques em `index.html` (ou, se o navegador reclamar da criptografia,
rode `python3 -m http.server 8000` na pasta e acesse http://localhost:8000).
Dados de exemplo são criados na primeira abertura. Senha de todas as contas: `Senha123`.
Para recomeçar: apague os dados do site (chaves `empreende:*` do localStorage).

Estrutura
- index.html, style.css (original), app.css (complementos), entrar.html, vagas.html, empresa.html, painel.html
- js/boot.js (ordem de carga) · util.js (validação/constantes) · data.js (ÚNICA camada que usa localStorage)
- js/auth.js · empresas.js · candidatos.js · vagas.js · candidaturas.js · seed.js · ui.js · pages.js (telas)

Trocar por API: reimplemente os métodos de `E.Db` (data.js) com fetch(); módulos e telas já são assíncronos.
