// Função para buscar detalhes de um anime na Kitsu API pelo ID
const fetchKitsuAnimeDetails = async (animeId) => {
  try {
    const response = await fetch(`https://kitsu.io/api/edge/anime/${animeId}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Erro na requisição à Kitsu API:', error);
    return null;
  }
};

// Função para buscar detalhes de um anime na AniList API pelo título
const fetchAniListAnimeDetails = async (animeTitle) => {
  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query ($search: String) {
            Media(search: $search, type: ANIME) {
              title {
                romaji
                english
                native
              }
              description
              coverImage {
                large
              }
              episodes
              averageScore
              startDate {
                year
                month
                day
              }
              studios {
                nodes {
                  name
                }
              }
              staff {
                edges {
                  node {
                    name {
                      full
                    }
                  }
                  role
                }
              }
              characters {
                edges {
                  node {
                    name {
                      full
                    }
                    image {
                      large
                    }
                  }
                  voiceActors {
                    name {
                      full
                    }
                  }
                }
              }
              trailer {
                id
                site
              }
            }
          }
        `,
        variables: { search: animeTitle },
      }),
    });
    const data = await response.json();
    return data.data.Media;
  } catch (error) {
    console.error('Erro na requisição à AniList API:', error);
    return null;
  }
};

// Função para escrever as informações do anime na página
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const animeId = urlParams.get('id');

  if (!animeId) {
    document.body.innerHTML = 'ID do anime não fornecido.';
    return;
  }

  const kitsuAnime = await fetchKitsuAnimeDetails(animeId);

  if (!kitsuAnime) {
    document.body.innerHTML = 'Anime não encontrado na Kitsu API.';
    return;
  }

  const title = kitsuAnime.attributes.canonicalTitle;
  const description = kitsuAnime.attributes.description || 'Sem descrição';
  const coverImage = kitsuAnime.attributes.posterImage ? kitsuAnime.attributes.posterImage.original : 'Imagem não disponível';
  const episodeCount = kitsuAnime.attributes.episodeCount || 'Desconhecido';
  const averageRating = kitsuAnime.attributes.averageRating || 'Sem avaliação';

  const aniListAnime = await fetchAniListAnimeDetails(title);

  const studio = aniListAnime?.studios.nodes.length > 0 ? aniListAnime.studios.nodes[0].name : 'Desconhecido';
  const releaseDate = aniListAnime?.startDate ? `${aniListAnime.startDate.day}/${aniListAnime.startDate.month}/${aniListAnime.startDate.year}` : 'Desconhecido';
  const director = aniListAnime?.staff.edges.find(edge => edge.role.toLowerCase().includes('director'))?.node.name.full || 'Desconhecido';
  const cast = aniListAnime?.characters.edges.map(edge => `${edge.node.name.full} (voz: ${edge.voiceActors.map(actor => actor.name.full).join(', ')})`).join(', ') || 'Desconhecido';
  const trailerUrl = aniListAnime?.trailer && aniListAnime.trailer.site === 'youtube' ? `https://www.youtube.com/embed/${aniListAnime.trailer.id}` : '';

  document.getElementById('anime-title').textContent = title;
  document.getElementById('anime-description').textContent = description;
  document.getElementById('cover-image').src = coverImage;
  document.getElementById('episode-count').textContent = episodeCount;
  document.getElementById('average-rating').textContent = averageRating;
  document.getElementById('studio').textContent = studio;
  document.getElementById('release-date').textContent = releaseDate;
  document.getElementById('director').textContent = director;
  document.getElementById('cast').textContent = cast;
  if (trailerUrl) {
    document.getElementById('trailer-video').src = trailerUrl;
  } else {
    document.querySelector('.trailer').style.display = 'none';
  }

  // Exibir personagens
  const charactersContainer = document.getElementById('characters');
  if (aniListAnime?.characters.edges.length > 0) {
    aniListAnime.characters.edges.forEach(edge => {
      const character = edge.node;
      const voiceActors = edge.voiceActors.map(actor => actor.name.full).join(', ');

      const characterElement = document.createElement('div');
      characterElement.classList.add('col-md-4', 'character');
      characterElement.innerHTML = `
        <div class="card mb-4">
          <img src="${character.image.large}" class="card-img-top" alt="${character.name.full}">
          <div class="card-body">
            <h5 class="card-title">${character.name.full}</h5>
            <p class="card-text">Voz: ${voiceActors}</p>
          </div>
        </div>
      `;
      charactersContainer.appendChild(characterElement);
    });
  } else {
    charactersContainer.innerHTML = '<p>Personagens não encontrados.</p>';
  }
});