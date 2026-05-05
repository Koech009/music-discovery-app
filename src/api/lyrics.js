import axios from 'axios';

let artist = 'celeste'
let title = 'stop ths flame'

axios.get(`https://api.lyrics.ovh/v1/${artist}/${title}`)
  .then(response => {
    console.log(response.data); // Data is already parsed as a JS object
  })
  .catch(error => {
    console.error(error.response.data, error.response.status);
  });