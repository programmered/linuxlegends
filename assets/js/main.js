/**
 * LÓGICA PRINCIPAL DO LINUX LEGENDS
 * Esse arquivo controla como as páginas carregam e como os cards são criados.
 */

// Onde o texto do site vai aparecer (a tag <main> do seu HTML)
const contentArea = document.getElementById('content-area');

/**
 * BANCO DE DADOS DA EQUIPE
 * Adicione aqui o nome da pessoa exatamente como você vai escrever no .md
 * e coloque o link do perfil e a foto dela.
 */
const equipe = {
    "Admin": {
        perfil: "https://github.com/seu-usuario",
        foto: "https://github.com/seu-usuario.png" // Foto do GitHub (pode usar qualquer link de imagem)
    },
    "Mariana": {
        perfil: "https://linkedin.com/in/mariana",
        foto: "https://i.pravatar.cc/150?u=mari" // Exemplo de foto externa
    }
};

/**
 * MOTOR DE NAVEGAÇÃO (ROTEADOR)
 * Ele decide qual arquivo .md carregar baseado no que você clica no menu.
 */
async function router() {
    let hash = window.location.hash.replace('#', '').split('?')[0].toLowerCase() || 'inicio';
    
    if (hash === 'contatos') hash = 'contato';

    contentArea.innerHTML = '<div class="status-msg">Buscando informações no setor: ' + hash + '...</div>';

    try {
        const response = await fetch(`md/${hash}.md`);
        
        if (!response.ok) throw new Error('404');

        const md = await response.text();
        const html = marked.parse(md);

        if (hash === 'arquivos') {
            renderCards(html);
        } else {
            contentArea.innerHTML = `<div class="markdown-body fade-in">${html}</div>`;
        }
    } catch (err) {
        contentArea.innerHTML = `
            <div class="error-container">
                <h1 class="error-code">404</h1>
                <p>O setor <strong>"${hash}"</strong> não responde ou o arquivo md/${hash}.md não foi criado.</p>
                <a href="#inicio" class="btn-back">[ VOLTAR AO INÍCIO ]</a>
            </div>`;
    }
    
    window.scrollTo(0, 0);
}

/**
 * CRIADOR DE CARDS
 * Transforma sua lista de links do arquivo arquivos.md em cards visuais.
 */
function renderCards(htmlContent) {
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
    
    const links = tempDiv.querySelectorAll('a');

    links.forEach(link => {
        const textoOriginal = link.innerText;
        const separador = textoOriginal.split('|');
        const title = separador[0].trim();
        const author = separador[1] ? separador[1].trim() : "Linux Legends";

        const href = link.getAttribute('href').replace('#', '').replace('.md', '').toLowerCase();
        
        // --- INÍCIO DA ALTERAÇÃO PARA FOTO E PERFIL ---
        let infoAutor;
        
        // Verifica se o autor está cadastrado na nossa lista de equipe
        if (equipe[author]) {
            const dados = equipe[author];
            // Se estiver, cria o link com foto e abre em nova aba
            infoAutor = `
                <a href="${dados.perfil}" target="_blank" rel="noopener noreferrer" class="author-link" onclick="event.stopPropagation();">
                    <img src="${dados.foto}" alt="${author}" style="width:20px; height:20px; border-radius:50%; margin-right:5px; vertical-align:middle; border:1px solid #ddd;">
                    ${author}
                </a>`;
        } else {
            // Se não estiver na lista, mostra apenas o bonequinho padrão
            infoAutor = `👤 ${author}`;
        }
        // --- FIM DA ALTERAÇÃO ---

        // Mudamos o card de <a> para <div> para evitar erro de links um dentro do outro
        const card = document.createElement('div');
        card.className = 'file-card';
        card.style.cursor = 'pointer';
        
        // Faz o card inteiro ser clicável para abrir o arquivo
        card.onclick = () => { window.location.hash = href; };
        
        card.innerHTML = `
            <div class="card-header"><h3>${title}</h3></div>
            <div class="card-content">
                <span class="emoji-big">${getEmoji(title)}</span>
            </div>
            <div class="card-author">${infoAutor}</div>
        `;
        grid.appendChild(card);
    });

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
 */
function getEmoji(title) {
    const t = title.toLowerCase();
    const biblioteca = {
        'comando': '⌨️', 'vim': '⌨️', 'terminal': '⌨️',
        'guia': '📚', 'tutorial': '📚', 'projeto': '📚',
        'log': '📊', 'relatorio': '📊', 'sistema': '📊',
        'ideia': '💡', 'lista': '💡',
        'linux': '🐧', 'pinguim': '🐧',
        'segurança': '🛡️', 'rede': '🌐', 'nuvem': '☁️',
        'script': '📜', 'hardware': '⚙️'
    };

    for (let chave in biblioteca) {
        if (t.includes(chave)) return biblioteca[chave];
    }
    return '📄'; 
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);