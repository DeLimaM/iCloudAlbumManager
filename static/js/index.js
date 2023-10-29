document.addEventListener("DOMContentLoaded", loadAlbums);
document.addEventListener("DOMContentLoaded", initEventListeners);

setInterval(updateAlbums, 120000)

// TODO: refactor repetitive code into functions (downloadAlbum, deleteAlbum)

function showLoading() {
    document.getElementById("loading").style.display = "flex";
    document.getElementById("loaded").style.display = "none";
}

function hideLoading() {
    document.getElementById("loading").style.display = "none";
    document.getElementById("loaded").style.display = "flex";
}

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

function downloadAlbum() {
    let rows = document.getElementsByClassName("selected");
    if(rows.length === 0){
        console.log("No row selected");
        return;
    }
    let albumName = rows[0].getElementsByTagName("td")[0].textContent;

    // send the album name to the server
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/download_album", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({"album_name": albumName}));

    // disable the download button
    let downloadButton = document.getElementById("download-button");
    downloadButton.textContent = "Downloading...";
    downloadButton.disabled = true;

    // check if the download is complete
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data.error) {
                    alert(data.error)
                } else {
                    downloadButton.textContent = "Download";
                    downloadButton.disabled = false;
                    updateAlbums();
                }
            }
        }
    };
}

function deleteAlbum() {
    let rows = document.getElementsByClassName("selected");
    if(rows.length === 0){
        console.log("No row selected");
        return;
    }
    let albumName = rows[0].getElementsByTagName("td")[0].textContent;

    // send the album name to the server
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/delete_album", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({"album_name": albumName}));
    
    // disable the delete button
    let deleteButton = document.getElementById("delete-button");
    deleteButton.textContent = "Deleting...";
    deleteButton.disabled = true;

    // check if the deletion is complete
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                if (data.error) {
                    alert(data.error)
                } else {
                    let deleteButton = document.getElementById("delete-button");
                    deleteButton.textContent = "Delete";
                    deleteButton.disabled = false;
                    updateAlbums();
                }
            }
        }
    };
}

function initEventListeners() {
    let downloadButton = document.getElementById("download-button");
    downloadButton.addEventListener("click", downloadAlbum);
    
    let deleteButton = document.getElementById("delete-button");
    deleteButton.addEventListener("click", deleteAlbum);
}