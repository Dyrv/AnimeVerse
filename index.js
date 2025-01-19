// Importa os módulos necessários
const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');
const port = 3000;
const supabase = require('./src/config/client');

// Configura o servidor para servir arquivos estáticos, usar CORS e JSON
app.use(express.static('public'));
app.use(cors());
app.use(express.json());

// Lista de gêneros válidos (em inglês, que é como a Kitsu os reconhece)
const validGenres = {
  "Ação": "Action",
  "Aventura": "Adventure",
  "Comédia": "Comedy",
  "Drama": "Drama",
  "Fantasia": "Fantasy",
  "Mistério": "Mystery",
  "Romance": "Romance",
  "Terror": "Horror",
  "Ficção científica": "Science Fiction",
  "Psicológico": "Psychological",
  "Esporte": "Sports"
};

// Função para obter os géneros de um anime pelo seu ID
const getGenres = async (animeId) => {
  try {
    const response = await axios.get(`https://kitsu.io/api/edge/anime/${animeId}/genres`);
    const genres = response.data.data.map(genre => genre.attributes.name);
    return genres.join(", ");
  } catch (error) {
    console.error(`Erro ao buscar gêneros para o anime ID ${animeId}:`, error.message);
    return 'Sem gênero';
  }
};

// Função para formatar os dados dos animes com seus géneros
const formatAnimeDataWithGenres = async (animes) => {
  const formattedAnimes = await Promise.all(animes.map(async anime => {
    const genres = await getGenres(anime.id);
    return {
      id: anime.id,
      title: anime.attributes.canonicalTitle,
      genre: genres,
      description: anime.attributes.description ? anime.attributes.description.substring(0, 200) + '...' : 'Sem descrição',
      coverImage: anime.attributes.posterImage ? anime.attributes.posterImage.original : 'Imagem não disponível'
    };
  }));
  return formattedAnimes;
};

// Rota para recomendar animes com base no género
app.get('/recomendar', async (req, res) => {
  const genre = req.query.genre;

  if (!genre) {
    return res.status(400).send('Por favor, forneça um gênero para recomendação.');
  }

  console.log('Gênero recebido:', genre);

  try {
    const response = await axios.get('https://kitsu.io/api/edge/anime', {
      params: {
        'filter[genres]': validGenres[genre],
        'page[limit]': 18,
        'sort': '-startDate',
      }
    });

    const animes = response.data.data;

    if (animes && animes.length > 0) {
      const animeData = await formatAnimeDataWithGenres(animes);
      res.json(animeData);
    } else {
      res.status(404).send('Nenhum anime encontrado para o gênero informado.');
    }
  } catch (error) {
    console.error('Erro na requisição para a Kitsu API:', error.response ? error.response.data : error.message);
    res.status(500).send('Erro ao buscar os animes. Detalhes: ' + (error.response ? error.response.data : error.message));
  }
});

// Rota para pesquisar animes pelo nome
app.get('/pesquisar', async (req, res) => {
  const nome = req.query.nome;

  if (!nome) {
    return res.status(400).send('Por favor, forneça um nome de anime para pesquisa.');
  }

  console.log('Nome do anime para pesquisa:', nome);

  try {
    const response = await axios.get('https://kitsu.io/api/edge/anime', {
      params: {
        'filter[text]': nome,
        'page[limit]': 18,
        'sort': '-startDate',
      }
    });

    const animes = response.data.data;

    if (animes && animes.length > 0) {
      const animeData = await formatAnimeDataWithGenres(animes);
      res.json(animeData);
    } else {
      res.status(404).send('Nenhum anime encontrado com o nome informado.');
    }
  } catch (error) {
    console.error('Erro na requisição para a Kitsu API para pesquisa:', error.response ? error.response.data : error.message);
    res.status(500).send('Erro ao buscar o anime. Detalhes: ' + (error.response ? error.response.data : error.message));
  }
});

// Função para registar o IP do utilizador
async function logUserIp() {
  try {
    // Obter o IP público do utilizador
    const response = await axios.get('https://api.ipify.org?format=json');
    const ip = response.data.ip;

    // Data e hora atual
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const hora = now.toTimeString().split(' ')[0]; // Formato HH:MM:SS

    console.log('Dados para inserir:', { ip, date});

    // Inserir os dados na tabela do Supabase
    const { data, error } = await supabase
      .from('registros')
      .insert({
        ip: ip,
        date: date,
        hours: hora
      })
    if (error) {
      console.error('Erro ao salvar no Supabase:', error.message);
    } else {
      console.log('Dados inseridos com sucesso:', data);
    }
  } catch (err) {
    console.error('Erro ao obter o IP ou salvar no Supabase:', err.message);
  }
}

// Chamar a função ao carregar a página
logUserIp();

// Rota raiz
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/html/index.html');
});

// Rota para registar um novo utilizador
app.post('/signup', async (req, res) => {
  const { email, senha } = req.body;

  if (!req.body || !email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
      console.log('Chamando signUp com:', email, senha);
      const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
      });

      if (error) {
          return res.status(400).json({ error: error.message });
      }

      res.json({ message: 'Signup successful', data });
  } catch (error) {
      console.error('Erro ao realizar signup:', error);
      res.status(500).json({ error: 'Erro ao realizar signup.' });
  }
});

// Rota para login do utilizador
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
      console.log('Chamando login com', email, senha);
      const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
      });
      if (error) {
          return res.status(400).json({ error: error.message });
      } else {
          return res.status(200).json({ message: 'Utilizador logado com sucesso', data });
      }
  } catch (error) {
      console.error('Erro no servidor:', error);
      return res.status(500).json({ error: 'Erro no servidor' });
  }
});



//Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
