import Icon from './icon.js';

let swiper;
let albums;
let currentLanguage = 'en';
const buttonIdToIconMap = {};

document.addEventListener('DOMContentLoaded', function () {
    // set the event listeners
    document.getElementById('change-language-button').addEventListener('click', changeLanguage);
    document.getElementById('input-switch').addEventListener('click', toggleTheme);
    document.getElementById('log-out-button').addEventListener('click', logOut);
    document.getElementById('set-dd-button').addEventListener('click', setDownloadDir);

    // get the albums infos and generate the swiper
    eel.get_albums_infos()(function (data) {
        albums = data;
        generateSwiper(albums);
    });

    // set the language
    updateContentLanguage(currentLanguage);
    eel._init();
    setSavedTheme();
});

// languages
const languages = {
    en: {
        setDownloadDirButton : "Set the main directory",
        logOutButton : "Log out",
        nameField: "Name",
        photosNumField: "Number of photos",
        onDiskField: "On disk",
        pathField: "Path",
        yes: "Yes",
        no: "No"
    },

    fr: {
        setDownloadDirButton: "Changer le répertoire principal",
        logOutButton: "Se déconnecter",
        nameField: "Nom",
        photosNumField: "Nombre de photos",
        onDiskField: "Sur le disque",
        pathField: "Chemin",
        yes: "Oui",
        no: "Non"
    }
}

// generate the swiper
function generateSwiper(albums) {
    let totalItems = albums.length;
    let numberOfRows = 3;
    let numberOfColumns = 3;
    let gap = 20;
    const swiperWrapper = document.querySelector('.swiper-wrapper');

    // add slides
    for (const [key, value] of Object.entries(albums)) {
        // add slide
        const swiperSlide = document.createElement('div');
        swiperSlide.classList.add('swiper-slide');
        swiperSlide.textContent = key;
        swiperSlide.style.height = `calc((100% - ${gap * (numberOfRows)}px) / ${numberOfRows})`;
        swiperSlide.onclick = () => {
            updateAlbumInfos(key);
            swiperSlide.classList.add('selected');
        };
        swiperWrapper.appendChild(swiperSlide);

        // add menus to slides
        const contextMenu = document.createElement('div');
        contextMenu.classList.add('context-menu');
        swiperSlide.appendChild(contextMenu);

        const progressMenu = document.createElement('div');
        progressMenu.classList.add('progress-menu');
        swiperSlide.appendChild(progressMenu);

        // add buttons to context-menu
        // download button
        const downloadButton = document.createElement('div');
        downloadButton.classList.add('context-button', 'download-button');
        downloadButton.id = `download-${key}`;
        contextMenu.appendChild(downloadButton);
        let icon = new Icon(`download-${key}`);
        buttonIdToIconMap[`download-${key}`] = icon;
        console.log(buttonIdToIconMap);

        if (value['is_on_disk']) {
            icon.sync();
        } else {
            icon.download();
        }

        downloadButton.onclick = () => {
            syncAlbum(key)
        }

        // delete button
        const deleteButton = document.createElement('div');
        deleteButton.classList.add('context-button', 'delete-button');
        deleteButton.id = `delete-${key}`;
        deleteButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"> <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/> <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/> </svg>';
        contextMenu.appendChild(deleteButton);

        deleteButton.onclick = () => {
            eel.delete_album(key)(function () {
                setDownloadIcon(key);
                updateAlbumInfos(key)
            });
        };

        // add progress bar to progress-menu
        const progressBar = document.createElement('div');
        progressBar.classList.add('progress-bar');
        progressBar.id = `progress-${key}`;
        progressMenu.appendChild(progressBar);
        const bar = document.createElement('span');
        bar.classList.add('bar');
        progressBar.appendChild(bar);
        const progress = document.createElement('span');
        progress.classList.add('progress');
        progressBar.appendChild(progress);
    }

    // add swiper
    swiper = new Swiper('.swiper', {
        slidesPerView: numberOfColumns,
        slidesPerGroup: numberOfColumns,
        spaceBetween: gap,
        effect: 'slide',

        keyboard: {
            enabled: true,
            onlyInViewport: false,
        },

        grid: {
            rows: numberOfRows,
        },

        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        pagination: {
            el: '.swiper-pagination',
        }
    });
}

function disableDeleteButton(albumName) {
    let deleteButton = document.getElementById(`delete-${albumName}`);
    deleteButton.onclick = null;
    deleteButton.classList.add('disabled');
}

function enableDeleteButton(albumName) {
    let deleteButton = document.getElementById(`delete-${albumName}`);
    deleteButton.onclick = () => {
        eel.delete_album(albumName)(function () {
            deleteAlbum(albumName);
        });
    }
    deleteButton.classList.remove('disabled');
}

function deleteAlbum(albumName) {
    eel.delete_album(albumName)(function () {
        setDownloadIcon(albumName);
        albums[albumName]['is_on_disk'] = false;
        updateAlbumInfos(albumName)
    });
}

// change the language
function changeLanguage() {
    if (currentLanguage === 'en') {
        currentLanguage = 'fr';
    }
    else {
        currentLanguage = 'en';
    }
    updateContentLanguage(currentLanguage);
}

// update the content language
function updateContentLanguage(language) {
    const content = languages[language];
    document.getElementById('set-dd-button').innerText = content.setDownloadDirButton;
    document.getElementById('log-out-button').innerText = content.logOutButton;
    document.getElementById('name-field').innerText = content.nameField;
    document.getElementById('on-disk-field').innerText = content.onDiskField;
    document.getElementById('path-field').innerText = content.pathField;
    document.getElementById('photos-num-field').innerText = content.photosNumField;
    if(currentLanguage==='en') {
        document.getElementById('change-language-button').innerText = 'FR';
    } else {
        document.getElementById('change-language-button').innerText = 'EN';
    }
}

// toggle the theme
function toggleTheme() {
    let body = document.querySelector('body');
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
    }
    localStorage.setItem('theme', body.classList);
}

// set the saved theme
function setSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    const themeCheckbox = document.getElementById('input-switch');
    if (savedTheme) {
      if (savedTheme==='light-theme') {
        themeCheckbox.click();
      }
    }
  }

// log out
function logOut() {
    console.log('[index-scripts.js] called app.log_out');
}

function updateAlbumInfos(albumName) {
    document.getElementById('name-value').innerText = albums[albumName]['name'];
    document.getElementById('photos-num-value').innerText = albums[albumName]['num_photos'];
    document.getElementById('on-disk-value').innerText = albums[albumName]['is_on_disk'] ? languages[currentLanguage].yes : languages[currentLanguage].no;
    document.getElementById('path-value').innerText = albums[albumName]['disk_path'];
}

// cancel a download
function cancelDownload(albumName) {
    eel.cancel_download(albumName)(function () {
        eel.is_on_disk(albumName)(function (isOnDisk) {
            if (isOnDisk) {
                buttonIdToIconMap[`download-${albumName}`].sync();
            } else {
                buttonIdToIconMap[`download-${albumName}`].download();
            }
        });
    });
    enableDeleteButton(albumName)
}

// sync an album
function syncAlbum(albumName) {
    disableDeleteButton(albumName);
    buttonIdToIconMap[`download-${albumName}`].cancel();
    document.getElementById(`download-${albumName}`).onclick = () => {
        cancelDownload(albumName);
    }
    eel.sync_album(albumName);
    eel.load_albums()(function (data) {
        albums = data;
        updateAlbumInfos(albumName);
    });
}

// set a new download directory
function setDownloadDir() {
    console.log('[index-scripts.js] called app.set_download_directory');
    eel.set_download_directory();
}

eel.expose(updateAlbumProgressBar)
function updateAlbumProgressBar(albumName, percentage) {
    const progressBar = document.getElementById(`progress-${albumName}`);
    if (progressBar) {
        progressBar.style.opacity = 1;
        const progress = progressBar.querySelector('.progress');
        progress.style.width = `${percentage}%`;
    }
    if (percentage >= 100) {
        setTimeout(() => {
            progressBar.style.opacity = 0;
        }, 500);
    }
    if (percentage >= 0) {
        progressBar.style.opacity = 1;
    }
}

eel.expose(Alert)
function Alert(content) {
    alert('An error occured : '+content);
}

eel.expose(endOfSync)
function endOfSync(albumName) {
    document.getElementById(`download-${albumName}`).onclick = () => {
        syncAlbum(albumName);
    }
    buttonIdToIconMap[`download-${albumName}`].sync();
    enableDeleteButton(albumName);
}