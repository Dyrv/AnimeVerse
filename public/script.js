// Função para mostrar ou ocultar a listbox de gêneros dependendo da seleção de "Pesquisa Avançada"
document.getElementById('advancedSearch').addEventListener('change', function () {
  const genreSelectGroup = document.getElementById('genreSelectGroup');
  if (this.checked) {
    genreSelectGroup.style.display = 'block';
  } else {
    genreSelectGroup.style.display = 'none';
  }
});

// Função para fazer requisição para a API dependendo da pesquisa
document.getElementById('searchButton').addEventListener('click', async function () {
  const searchQuery = document.getElementById('searchQuery').value.trim();
  const genreQuery = document.getElementById('genreSelect') ? document.getElementById('genreSelect').value : null;
  const resultsContainer = document.getElementById('animeResults');

  if (!searchQuery && !genreQuery) {
    resultsContainer.innerHTML = 'Por favor, digite um valor para pesquisa ou escolha um gênero.';
    return;
  }

  // Limpar resultados anteriores
  resultsContainer.innerHTML = 'Carregando...';

  try {
    let url = '';
    if (searchQuery && genreQuery) {
      // Pesquisa por nome e gênero
      url = `http://localhost:3000/pesquisar?nome=${searchQuery}&genre=${genreQuery}`;
    } else if (searchQuery) {
      // Pesquisa apenas por nome
      url = `http://localhost:3000/pesquisar?nome=${searchQuery}`;
    } else if (genreQuery) {
      // Pesquisa apenas por gênero
      url = `http://localhost:3000/recomendar?genre=${genreQuery}`;
    }

    // Requisição para o servidor
    const response = await fetch(url);
    const data = await response.json();

    // Verificar a estrutura dos dados
    console.log(data);

    // Exibir resultados
    if (data.length === 0) {
      resultsContainer.innerHTML = 'Nenhum anime encontrado.';
    } else {
      resultsContainer.innerHTML = data.map(anime => `
        <div class="anime">
          <a href="animePage.html?id=${anime.id}"><img src="${anime.coverImage}" alt="${anime.title}"></a>
          <h3>${anime.title}</h3>
        </div>
      `).join('');
    }
  } catch (error) {
    resultsContainer.innerHTML = 'Erro ao buscar os animes. Tente novamente mais tarde.';
    console.error('Erro na requisição:', error);
  }
});

// Função para registrar o IP do usuário ao carregar a página
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/log-ip');
    const data = await response.json();
    if (data.success) {
      console.log('IP registrado com sucesso:', data.ip);
    } else {
      console.error('Falha ao registrar IP:', data.message);
    }
  } catch (error) {
    console.error('Erro ao conectar ao servidor:', error);
  }
});

// Função para buscar um anime aleatório
document.getElementById('randomLink').addEventListener('click', async function (event) {
  event.preventDefault(); // Prevenir o comportamento padrão do link

  // Exibir pop-up de carregamento
  const popup = document.getElementById('loadingPopup');
  const overlay = document.getElementById('popupOverlay');
  popup.style.display = 'block';
  overlay.style.display = 'block';

  try {
      // Esperar 5 segundos antes de buscar o anime aleatório
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Buscar anime aleatório da Kitsu API
      const response = await fetch('https://kitsu.io/api/edge/anime?page[limit]=1&page[offset]=' + Math.floor(Math.random() * 10000));
      const data = await response.json();
      const randomAnime = data.data[0];

      if (randomAnime && randomAnime.id) {
          window.location.href = `animePage.html?id=${randomAnime.id}`;
      } else {
          popup.style.display = 'none';
          overlay.style.display = 'none';
          alert('Não foi possível encontrar um anime aleatório. Tente novamente.');
      }
  } catch (error) {
      console.error('Erro ao buscar anime aleatório:', error);
      popup.style.display = 'none';
      overlay.style.display = 'none';
      alert('Erro ao buscar anime aleatório. Tente novamente mais tarde.');
  }
});

//Função de logout
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    alert('Você saiu com sucesso.');
    window.location.href = "index.html";
});

// Função para verificar se o usuário está logado e exibir o menu
window.addEventListener('DOMContentLoaded', () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  const loginButton = document.getElementById('login');
  const menu = document.getElementById('menu');

  if (isLoggedIn === 'true') {
      if (loginButton) loginButton.style.display = 'none';
      if (menu) menu.style.display = 'block';
  } else {
      if (loginButton) loginButton.style.display = 'block';
      if (menu) menu.style.display = 'none';
  }
});

//Variáveis globais
const button = document.getElementById('button');
const menu = document.getElementById('menu');