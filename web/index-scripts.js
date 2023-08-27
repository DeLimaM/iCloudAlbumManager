let swiper;
let albums;
let currentLanguage = 'en';

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

        if (value['is_on_disk']) {
            setSyncIcon(key);
        } else {
            setDownloadIcon(key);
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

function setDownloadIcon(albumName) {
    let downloadButton = document.getElementById(`download-${albumName}`);
    downloadButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"> <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/> <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/> </svg>';
    downloadButton.onclick = () => {
        albums[albumName]['is_on_disk'] = false;
        syncAlbum(albumName);
    }
}

function setSyncIcon(albumName) {
    let downloadButton = document.getElementById(`download-${albumName}`);
    downloadButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"> <path fill="var(--ci-primary-color, currentColor)" d="M410.168,133.046,381.21,104.088,464.017,104l-.034-32L328,72.144V208h32V128.132l27.541,27.541A152.5,152.5,0,0,1,279.972,416l.056,32a184.5,184.5,0,0,0,130.14-314.954Z" class="ci-primary"/> <path fill="var(--ci-primary-color, currentColor)" d="M232.028,104l-.056-32a184.5,184.5,0,0,0-130.14,314.954L130.878,416H48v32H184V312H152v79.868l-27.541-27.541A152.5,152.5,0,0,1,232.028,104Z" class="ci-primary"/> </svg>';
    downloadButton.onclick = () => {
        syncAlbum(albumName);
        albums[albumName]['is_on_disk'] = true;
    }
}

function setCancelIcon(buttonType, albumName) {
    let button = document.getElementById(`${buttonType}-${albumName}`);
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stop-circle" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/> <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z"/> </svg>';
    button.onclick = () => {
        cancelDownload(albumName);
    }
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
            setDownloadIcon(albumName);
            albums[albumName]['is_on_disk'] = false;
            updateAlbumInfos(albumName)
        });
    }
    deleteButton.classList.remove('disabled');
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
                setSyncIcon(albumName);
            } else {
                setDownloadIcon(albumName);
            }
        });
    });
    enableDeleteButton(albumName)
}

// sync an album
function syncAlbum(albumName) {
    disableDeleteButton(albumName);
    let downloadButton = document.getElementById(`download-${albumName}`);
    setCancelIcon('download', albumName);
    eel.sync_album(albumName)(function () {
        setSyncIcon(albumName);
        enableDeleteButton(albumName);
    });
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

document.addEventListener('DOMContentLoaded', function () {
    eel.get_albums_infos()(function (data) {
        albums = data;
        generateSwiper(albums);
    });
    updateContentLanguage(currentLanguage);
    eel._init();
});