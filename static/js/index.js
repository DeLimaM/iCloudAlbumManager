document.addEventListener("DOMContentLoaded", loadAlbums);
document.addEventListener("DOMContentLoaded", initEventListeners);

setTimeout(startUpdatingAlbums, 120000); // update every 2 minutes

// globals

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

    let xhr = new XMLHttpRequest();
    xhr.open("GET", "/load_albums", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data.error) {
                    alert(data.error)
                    return
                } else {
                    populateTable(data.albums);
                }
            }
            hideLoading();
        }
    };
    xhr.send();
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
            downloadedCell.textContent = data[album]["on_disk"];

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
                    downloadButton.textContent = "Download";
                    updateAlbums();
                } else {
                    console.log("Unknown error");
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
    
    // disable the delete button
    let deleteButton = getDeleteButton();
    deleteButton.textContent = "Deleting...";
    deleteButton.disabled = true;
    deleteButton.classList.add("disabled");

    // check if the deletion is complete
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data.error) {
                    alert(data.error)
                } else if (data.success === true) {
                    deleteButton.textContent = "Delete";
                    deleteButton.disabled = false;
                    deleteButton.classList.remove("disabled");
                    updateAlbums();
                } else {
                    console.log("Unknown error");
                }
            }
        }
    };
}

// initialize the event listeners
function initEventListeners() {
    toDownload();
    let deleteButton = getDeleteButton();
    deleteButton.onclick = deleteAlbum;
}

// update the albums
function updateAlbums() {
    console.log("Updating albums");
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
                } else {
                    console.log("Unknown error");
                }
            }
        }
    };
}

// transform the download button into a pause button
function toPause() {
    let downloadButton = getDownloadButton();
    downloadButton.textContent = "Pause";

    downloadButton.onclick = function() {
        pauseDownload();
        toDownload();
    }
}

// display the download button
function toDownload() {
    let downloadButton = getDownloadButton();
    downloadButton.textContent = "Download";

    downloadButton.onclick = function() {
        downloadAlbum();
        toPause();
    }
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