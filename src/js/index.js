import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { fetchImages } from './img-api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('form#search-form');
const gallery = document.querySelector('div.gallery');
const loadMoreButton = document.querySelector('button.load-more');
let lightbox;
let allImagesLoaded = false;
let page = 1; 

async function onSubmit(evt) {
  evt.preventDefault();
  loadMoreButton.classList.add('hidden');
  gallery.innerHTML = '';
  const searchQuery = evt.currentTarget.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    Notify.info('Please enter your search query!');
    return;
  }

  try {
    const data = await fetchImages(searchQuery, page); 
    let queriesArray = data.hits;

    if (queriesArray.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      renderImages(queriesArray);
      Notify.success(`Hooray! We found ${data.totalHits} images.`);
      loadMoreButton.classList.toggle('hidden', queriesArray.length < 40);
      allImagesLoaded = queriesArray.length < 40;
      initializeLightbox();
    }
  } catch (error) {
    Notify.info("We're sorry, but you've reached the end of search results.");
  }
}

async function onLoadMore() {
  try {
    if (allImagesLoaded) {
      return;
    }
    page++;
    const data = await fetchImages(form.elements.searchQuery.value.trim(), page);
    let queriesArray = data.hits;
    renderImages(queriesArray);
    loadMoreButton.classList.toggle('hidden', queriesArray.length < 40);
    allImagesLoaded = queriesArray.length < 40;
    initializeLightbox();
  } catch (error) {
    throw error;
  }
}

function renderImages(queriesArray) {
  let markup = '';

  queriesArray.forEach(item => {
    markup += `<a href="${item.largeImageURL}" class="lightbox-target">
      <div class="photo-card">
      <div class="thumb"><img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" /></div>
        <div class="info">
          <p class="info-item">
            <b>Likes</b><span>${item.likes}</span>
          </p>
          <p class="info-item">
            <b>Views</b><span>${item.views}</span>
          </p>
          <p class="info-item">
            <b>Comments</b><span>${item.comments}</span>
          </p>
          <p class="info-item">
            <b>Downloads</b><span>${item.downloads}</span>
          </p>
        </div>
      </div>
      </a>`;
  });
  gallery.insertAdjacentHTML('beforeend', markup);
}

function initializeLightbox() {
  if (lightbox) {
    lightbox.refresh();
  } else {
    lightbox = new SimpleLightbox('.lightbox-target');
  }
}

form.addEventListener('submit', onSubmit);
loadMoreButton.addEventListener('click', onLoadMore);


// window.addEventListener('scroll', () => {
//   const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
//   if (scrollTop + clientHeight >= scrollHeight - 100) {
//     onLoadMore(); 
//   }
// });



