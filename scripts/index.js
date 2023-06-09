import View from './View.js';
import Client from './Client.js';

console.log("Hello from index.js");

const view = new View();
const client = new Client();
//daten aus local storage holen und anzeigen
function displayMoviesFromLocalStorage() {
  const movieList = JSON.parse(localStorage.getItem('movieList')) || [];
  movieList.forEach(async movie => {
    const movieData = await client.getMovieData(movie.title);
    view.displayMovieOnPage(movieData);
    
  });
}
displayMoviesFromLocalStorage();
//Ende Daten aus local storage holen und anzeigen

const saveBtn = document.querySelector('.btn-save');
saveBtn.addEventListener('click',async (e) => {
  e.preventDefault();
  
  const movieInput = document.querySelector('.movie-input').value.trim();

  if (movieInput === '') {
  alert('Bitte gib einen Filmtitel ein.');
  return;}
    
  const movieData = await client.getMovieData(movieInput); 
    //ab hier wird gespeichert und geprüft ob der Film schon vorhanden ist, und falls nicht wird er gespeichert
  const movieList = JSON.parse(localStorage.getItem('movieList')) || [];
  const movieExists = movieList.find(movie => movie.imdbID === movieData.imdbID);
  
  if (movieExists) {
    alert('Film schon vorhanden.');
    return;
  }
  
  movieList.push({title: movieData.Title, imdbID: movieData.imdbID });
  localStorage.setItem('movieList', JSON.stringify(movieList));
  //Ende Speichern und prüfen

  console.log(movieData);
  view.displayMovieOnPage(movieData); 
}); 
  //Reset Button
  const resetBtn = document.querySelector('.btn-reset');
resetBtn.addEventListener('click', () => {
  console.log('reset');
  const confirmReset = confirm('Die gesamte Filmliste wird gelöscht. Bist du sicher?');
  
  if (confirmReset) {
        view.removeDisplay();
        localStorage.removeItem('movieList');

  }
});
//Ende Reset Button
  
 
 
