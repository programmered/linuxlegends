/**
 * LÓGICA PRINCIPAL DO LINUX LEGENDS
 * Esse arquivo controla como as páginas carregam e como os cards são criados.
 */

// Onde o texto do site vai aparecer (a tag <main> do seu HTML)
const contentArea = document.getElementById('content-area');

/**
 * MOTOR DE NAVEGAÇÃO (ROTEADOR)
 * Ele decide qual arquivo .md carregar baseado no que você clica no menu.
 */
async function router() {
    // Pega o nome da página na URL (o que vem depois do #)
    // Se não tiver nada, ele entende que você está na página 'inicio'
    let hash = window.location.hash.replace('#', '').split('?')[0].toLowerCase() || 'inicio';
    
    // Pequeno ajuste automático: se você linkar para 'contatos', ele busca o arquivo 'contato.md'
    if (hash === 'contatos') hash = 'contato';

    // Texto amigável enquanto o site busca o conteúdo
    contentArea.innerHTML = '<div class="status-msg">Buscando informações no setor: ' + hash + '...</div>';

    try {
        // Tenta buscar o arquivo dentro da sua pasta /md/
        const response = await fetch(`md/${hash}.md`);
        
        // Se o arquivo não existir, ele pula para o bloco de erro (catch)
        if (!response.ok) throw new Error('404');

        const md = await response.text();
        
        // Transforma o texto bruto do Markdown em HTML bonito
        const html = marked.parse(md);

        // Se estivermos na página de 'arquivos', usamos a função que cria os cards
        if (hash === 'arquivos') {
            renderCards(html);
        } else {
            // Se for uma página comum (como inicio ou contato), apenas joga o texto na tela
            contentArea.innerHTML = `<div class="markdown-body fade-in">${html}</div>`;
        }
    } catch (err) {
        // Caso algo dê errado ou o arquivo não exista, mostra essa mensagem
        contentArea.innerHTML = `
            <div class="error-container">
                <h1 class="error-code">404</h1>
                <p>O setor <strong>"${hash}"</strong> não responde ou o arquivo md/${hash}.md não foi criado.</p>
                <a href="#inicio" class="btn-back">[ VOLTAR AO INÍCIO ]</a>
            </div>`;
    }
    
    // Sempre que trocar de página, o site volta para o topo automaticamente
    window.scrollTo(0, 0);
}

/**
 * CRIADOR DE CARDS
 * Transforma sua lista de links do arquivo arquivos.md em cards visuais.
 */
function renderCards(htmlContent) {
    // Injeta a barra de pesquisa e o lugar onde os cards vão ficar
    contentArea.innerHTML = `
        <div class="search-container-center">
            <div class="search-wrapper">
                <input type="text" id="cardSearch" placeholder="🔍 Filtrar base de dados..." autocomplete="off">
            </div>
        </div>
        <div id="grid" class="files-grid"></div>
    `;

    const grid = document.getElementById('grid');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Captura todos os links [Texto](link) que você escreveu no seu arquivos.md
    const links = tempDiv.querySelectorAll('a');

    links.forEach(link => {
        // LÓGICA DE AUTOR: 
        // Se você escrever no .md assim: [Tutorial Linux | João], 
        // o sistema separa o "Tutorial Linux" do "João".
        const textoOriginal = link.innerText;
        const separador = textoOriginal.split('|');
        const title = separador[0].trim();
        const author = separador[1] ? separador[1].trim() : "Linux Legends";

        // Prepara o link para o site entender qual arquivo abrir ao clicar no card
        const href = link.getAttribute('href').replace('#', '').replace('.md', '').toLowerCase();
        
        // Cria a estrutura visual do card
        const card = document.createElement('a');
        card.className = 'file-card';
        card.href = `#${href}`; 
        
        card.innerHTML = `
            <div class="card-header"><h3>${title}</h3></div>
            <div class="card-content">
                <span class="emoji-big">${getEmoji(title)}</span>
            </div>
            <div class="card-author">👤 ${author}</div>
        `;
        grid.appendChild(card);
    });

    // Lógica da barra de pesquisa: esconde os cards que não batem com o que você digitou
    const searchInput = document.getElementById('cardSearch');
    if(searchInput) {
        searchInput.oninput = (e) => {
            const digitado = e.target.value.toLowerCase();
            document.querySelectorAll('.file-card').forEach(card => {
                const encontrou = card.innerText.toLowerCase().includes(digitado);
                card.style.display = encontrou ? 'flex' : 'none';
            });
        };
    }
}

/**
 * DICIONÁRIO DE EMOJIS
 * Aqui você define qual desenho aparece em cada card baseado em palavras-chave.
 * É só adicionar uma linha nova seguindo o padrão: 'palavra': 'desenho',
 */
function getEmoji(title) {
    const t = title.toLowerCase();
    const biblioteca = {
        'comando': '⌨️', 
        'vim': '⌨️', 
        'terminal': '⌨️',
        'guia': '📚', 
        'tutorial': '📚', 
        'projeto': '📚',
        'log': '📊', 
        'relatorio': '📊', 
        'sistema': '📊',
        'ideia': '💡', 
        'lista': '💡',
        'linux': '🐧', 
        'pinguim': '🐧',
        'segurança': '🛡️', 
        'rede': '🌐', 
        'nuvem': '☁️',
        'script': '📜', 
        'hardware': '⚙️'
    };

    // Percorre a lista acima para ver se o título do card tem alguma dessas palavras
    for (let chave in biblioteca) {
        if (t.includes(chave)) return biblioteca[chave];
    }
    
    // Se não encontrar nada, coloca um ícone de documento padrão
    return '📄'; 
}

// Avisa o navegador para rodar o roteador sempre que a URL mudar ou o site carregar
window.addEventListener('hashchange', router);
window.addEventListener('load', router);