document.addEventListener("DOMContentLoaded", loadAlbums);

setTimeout(startUpdatingAlbums, 120000); // update every 2 minutes

// globals

// load the icon's code from their files
let ondiskIcon = loadIcon("/static/icons/ondisk.svg");
let notondiskIcon = loadIcon("/static/icons/notondisk.svg");

let pauseIcon = loadIcon("/static/icons/pause.svg");
let downloadIcon = loadIcon("/static/icons/download.svg");
let deleteIcon = loadIcon("/static/icons/delete.svg");

// TODO: refactor repetitive code into functions (downloadAlbum, deleteAlbum)

// show the loading screen and hide the table
function showLoading() {
    document.getElementById("loading").style.display = "flex";
    document.getElementById("loaded").style.display = "none";
}

// hide the loading screen and show the table
function hideLoading() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("loaded").style.display = "flex";
}

// load the albums from the server
function loadAlbums() {
    showLoading();
    updateAlbums(true);
}

// populate the table with the albums
function populateTable(data) {
    let tableBody = document.getElementById("table");
    tableBody.innerHTML = "";

    tableBody.appendChild(createHeaderRow());

    for(let album in data){
        if (data.hasOwnProperty(album)) {
            const row = document.createElement("tr");
            const nameCell = document.createElement("td");
            nameCell.textContent = album;
            const countCell = document.createElement("td");
            countCell.textContent = data[album]["photo_count"];
            const downloadedCell = document.createElement("td");
            if (data[album]["downloaded"]) {
                downloadedCell.innerHTML = ondiskIcon;
            } else {
                downloadedCell.innerHTML = notondiskIcon;
            }

            row.appendChild(nameCell);
            row.appendChild(countCell);
            row.appendChild(downloadedCell);
            tableBody.appendChild(row);

            row.addEventListener("click", function () {
                selectRow(row);
            });
        }
    }
}

// create the header row for the table
function createHeaderRow() {
    const row = document.createElement("tr");
    const nameHeader = document.createElement("th");
    nameHeader.textContent = "Name";
    const countHeader = document.createElement("th");
    countHeader.textContent = "Photo Count";
    const downloadedHeader = document.createElement("th");
    downloadedHeader.textContent = "Downloaded";

    row.appendChild(nameHeader);
    row.appendChild(countHeader);
    row.appendChild(downloadedHeader);
    return row;
}

// select a row in the table
function selectRow(row) {
    if(row.classList.contains("selected")){
        row.classList.remove("selected");
    } else {
        let rows = document.getElementsByTagName("tr");
        for(let i = 0; i < rows.length; i++){
            rows[i].classList.remove("selected");
        }
        row.classList.toggle("selected");
    }

    let downloadButton = getDownloadButton();
    let deleteButton = getDeleteButton();

    downloadButton.innerHTML = downloadIcon;
    deleteButton.innerHTML = deleteIcon;
}

// download the selected album
function downloadAlbum() {
    let albumName = getSelectedAlbumName();

    // send the album name to the server
    let xhr = new XMLHttpRequest();
    xhr.open("POST", `/download_album/${albumName}`, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();

    // disable the download button
    let downloadButton = getDownloadButton();
    downloadButton.textContent = "Pause";

    // check the response from the server
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data.error) {
                    alert(data.error)
                } else if (data.success === true) {
                    updateAlbums();
                }
            }
        }
    };
}

// delete the selected album
function deleteAlbum() {
    let albumName = getSelectedAlbumName();

    // send the album name to the server
    let xhr = new XMLHttpRequest();
    xhr.open("POST", `/delete_album/${albumName}`, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send();

    // check if the deletion is complete
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data.error) {
                    alert(data.error)

                } else if (data.success === true) {
                    updateAlbums();
                }
            }
        }
    };
}

// update the albums
function updateAlbums(hideLoadingOnSuccess=false) {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/load_albums", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data.error) {
                    alert(data.error)
                } else {
                    populateTable(data.albums);
                }
            }
            if(hideLoadingOnSuccess){
                hideLoading();
            }
        }
    };
    xhr.send();
}

// start updating the albums
function startUpdatingAlbums() {
    setInterval(updateAlbums, 120000);
}

// pause the download
function pauseDownload() {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", `/pause_download/${getSelectedAlbumName()}`, true);
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data.error) {
                    alert(data.error)
                } else if (data.success === true) {
                    updateAlbums();
                }
            }
        }
    };
}

// get the name of the selected album
function getSelectedAlbumName() {
    let rows = document.getElementsByClassName("selected");
    if(rows.length === 0){
        console.log("No row selected");
        return;
    }
    return rows[0].getElementsByTagName("td")[0].textContent;
}

// get the download button
function getDownloadButton() {
    return document.getElementById("download-button");
}

// get the delete button
function getDeleteButton() {
    return document.getElementById("delete-button");
}

// load the icon's code from their files
function loadIcon(path){
    let xhr = new XMLHttpRequest();
    xhr.open("GET", path, false);
    xhr.send();
    if (xhr.status === 200) {
        return xhr.responseText;
    } else {
        return "[icon not found]";
    }
}
