(async function load() {
  const tmdbOptions = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOTc0YTc3MTUzMzJlYjEzMDc0YWZlM2M2ZTE1NmJkZCIsInN1YiI6IjY2NGVlNGU3OGJkOTEwN2ZhMTE4YmRjYyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.y7SBNKHx775DDEsaj_IqQQGV9z4dS83UMLy8DSMagyE'
    }
  };

  async function getData(url) {
    const response = await fetch(url, tmdbOptions);
    const data = await response.json();
    return data;
  }

  const genresData = await getData('https://api.themoviedb.org/3/genre/movie/list');
  const genres = genresData.genres;
  console.log(genres);

  async function getMoviesByGenre(genreId) {
    const moviesData = await getData(`https://api.themoviedb.org/3/discover/movie?with_genres=${genreId}`);
    return moviesData.results;
  }

  const actionGenre = genres.find(genre => genre.name.toLowerCase() === 'action');
  const romanceGenre = genres.find(genre => genre.name.toLowerCase() === 'romance');

  const actionList = await getMoviesByGenre(actionGenre.id);
  const romanceList = await getMoviesByGenre(romanceGenre.id);
  
  console.log(actionList, romanceList);

  const carouselData = await getData('https://api.themoviedb.org/3/movie/now_playing');
  const filteredCarouselData = carouselData.results.filter(movie => movie.title !== 'Un père idéal');
  const carouselImages = filteredCarouselData.map(movie => ({
    image: `https://image.tmdb.org/t/p/original${movie.backdrop_path}`,
    title: movie.title,
    description: movie.overview
  }));
  console.log(carouselImages);

  function videoItemTemplate(movie) {
    return `
      <div class="primaryPlaylistItem" data-id="${movie.id}">
        <div class="primaryPlaylistItem-image">
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        </div>
        <h4 class="primaryPlaylistItem-title">${movie.title}</h4>
      </div>`;
  }

  function createVideoTemplate(movie) {
    const HTMLString = videoItemTemplate(movie);
    const html = document.implementation.createHTMLDocument();
    html.body.innerHTML = HTMLString;
    return html.body.children[0];
  }

  function renderMovieList(list, $container) {
    $container.innerHTML = '';
    list.forEach((movie) => {
      const HTMLString = createVideoTemplate(movie);
      $container.append(HTMLString);
    });
    addEventClick();
  }

  const $actionContainer = document.getElementById('action');
  const $romanceContainer = document.getElementById('romance');
  const $featuring = document.querySelector('.home-featuring');

  renderMovieList(actionList, $actionContainer);
  renderMovieList(romanceList, $romanceContainer);

  function addEventClick() {
    const $primaryPlaylistItems = document.querySelectorAll('.primaryPlaylistItem');
    $primaryPlaylistItems.forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.dataset.id;
        const category = item.closest('.primaryPlaylist').dataset.category;
        const data = findMovie(id, category);
        showSidebar(data);
      });
    });
  }

  function findMovie(id, category) {
    switch (category) {
      case 'action':
        return actionList.find(movie => movie.id === parseInt(id));
      case 'romance':
        return romanceList.find(movie => movie.id === parseInt(id));
      default:
        return null;
    }
  }

  function showSidebar(data) {
    const $home = document.getElementById('home');
    const $sidebar = document.querySelector('.home-sidebar');
    const $carousel = document.querySelector('.carousel');
    
    $home.classList.remove('sidebar-hidden');
    $home.classList.add('sidebar-visible');
    $sidebar.classList.add('show');
    $carousel.innerHTML = `
      <div class="fadeIn">
        <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title}">
        <h4>${data.title}</h4>
        <p>${data.overview}</p>
      </div>`;
  }

  // Carousel
  let currentIndex = 0;

  function showNextImage() {
    const imageURL = carouselImages[currentIndex].image;
    const title = carouselImages[currentIndex].title;
    const description = carouselImages[currentIndex].description;
    const $featuringImage = document.querySelector('.featuring-image');
    const $featuringTitle = document.querySelector('.featuring-title');
    const $featuringDescription = document.querySelector('.featuring-description');

    $featuringImage.src = imageURL;
    $featuringTitle.textContent = title;
    $featuringDescription.textContent = description;

    currentIndex = (currentIndex + 1) % carouselImages.length;
  }

  setInterval(showNextImage, 5000);
  showNextImage();

  // Navigation arrows functionality
  document.querySelectorAll('.primaryPlaylist-container').forEach(container => {
    const list = container.querySelector('.primaryPlaylist-list');
    const leftArrow = container.querySelector('.arrow.left');
    const rightArrow = container.querySelector('.arrow.right');

    leftArrow.style.display = 'none';

    rightArrow.addEventListener('click', () => {
      list.scrollLeft += list.offsetWidth;
      leftArrow.style.display = '';
      if (list.scrollWidth - list.scrollLeft <= list.offsetWidth) {
        rightArrow.style.display = 'none';
      }
    });

    leftArrow.addEventListener('click', () => {
      list.scrollLeft -= list.offsetWidth;
      rightArrow.style.display = '';
      if (list.scrollLeft === 0) {
        leftArrow.style.display = 'none';
      }
    });
  });

})();
