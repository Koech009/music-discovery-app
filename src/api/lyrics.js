import axios from 'axios';

export function SearchForLyric(artist, title) {
    axios.get(`https://api.lyrics.ovh/v1/${artist}/${title}`)
    .then(response => {
        console.log(response.data);
        return response.data;
    })
    .catch(error => {
        console.error(error.response.data, error.response.status);
        return error.response.data, error.response.status
    });
};