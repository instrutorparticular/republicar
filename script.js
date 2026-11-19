const ofertasEl = document.getElementById("ofertas");
const contadorOfertas = document.getElementById("contador-ofertas");

document.getElementById("ano").textContent = new Date().getFullYear();

function textoSeguro(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[c]);
}

function linkValido(url) {
  return /^https?:\/\//i.test(String(url || "").trim());
}

function plural(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`;
}

async function carregarConteudo() {
  try {
    const resposta = await fetch("dados.json", { cache: "no-store" });
    if (!resposta.ok) throw new Error("Não foi possível carregar dados.json.");
    const dados = await resposta.json();

    // Cabeçalho
    document.getElementById("titulo").innerHTML =
      `${textoSeguro(dados.titulo || "Republicar")}<span>.</span>`;
    document.getElementById("descricao").textContent =
      dados.descricao || "Produtos e ofertas em destaque.";

    // Filtra as ofertas (garante que não vai carregar produtos vazios)
    const ofertas = (dados.ofertas || []).filter(o => 
      o && o.ativo !== false && String(o.nome || "").trim() !== ""
    );
    
    contadorOfertas.textContent = plural(ofertas.length, "oferta", "ofertas");

    if (!ofertas.length) {
      ofertasEl.innerHTML = `
        <div class="estado-vazio">
          <strong>Novas ofertas em breve.</strong>
          <p>Estamos selecionando produtos para você.</p>
        </div>`;
      return;
    }

    // Renderiza as ofertas
    ofertasEl.innerHTML = ofertas.map(oferta => {
      const nome = textoSeguro(oferta.nome);
      const imagem = oferta.imagem ? textoSeguro(oferta.imagem) : "";
      const descricao = textoSeguro(oferta.descricao || "");
      const loja = textoSeguro(oferta.loja || "");
      const preco = textoSeguro(oferta.preco || "");
      const precoAntigo = oferta.precoAntigo ? textoSeguro(oferta.precoAntigo) : "";
      const selo = oferta.selo ? textoSeguro(oferta.selo) : "";
      const imagemHtml = imagem
        ? `<img src="${imagem}" alt="${nome}" loading="lazy">`
        : `<div class="sem-imagem">Sem imagem</div>`;

      return `
        <article class="oferta">
          ${selo ? `<span class="oferta-selo">${selo}</span>` : ""}
          <div class="oferta-imagem">${imagemHtml}</div>
          <div class="oferta-corpo">
            ${loja ? `<span class="oferta-loja">${loja}</span>` : ""}
            <h3>${nome}</h3>
            ${descricao ? `<p>${descricao}</p>` : ""}
            
            ${(preco || precoAntigo) ? `
            <div class="oferta-precos">
              ${preco ? `<strong>${preco}</strong>` : ""}
              ${precoAntigo ? `<s>${precoAntigo}</s>` : ""}
            </div>
            ` : ""}

            ${linkValido(oferta.link)
              ? `<a class="botao-afiliado" href="${textoSeguro(oferta.link)}" target="_blank" rel="noopener noreferrer sponsored">Ver oferta</a>`
              : `<span class="botao-afiliado desativado">Indisponível</span>`}
          </div>
        </article>`;
    }).join("");
  } catch (erro) {
    ofertasEl.innerHTML = '<div class="erro">Erro ao carregar as ofertas. Verifique o arquivo dados.json.</div>';
    console.error(erro);
  }
}

carregarConteudo();