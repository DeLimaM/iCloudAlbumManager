document.addEventListener("DOMContentLoaded", loadAlbums);

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

function populateTable(data) {
    let tableBody = document.getElementById("table");
    tableBody.innerHTML = "<tr><th>Album</th><th>Photo count</th></tr>";

    for(let album in data){
        if (data.hasOwnProperty(album)) {
            const row = document.createElement("tr");
            const nameHeader = document.createElement("th");
            nameHeader.textContent = "Name";
            const countHeader = document.createElement("th");
            countHeader.textContent = "Photo Count";
            const nameCell = document.createElement("td");
            nameCell.textContent = album;
            const countCell = document.createElement("td");
            countCell.textContent = data[album]["photo_count"];

            row.appendChild(nameCell);
            row.appendChild(countCell);
            tableBody.appendChild(row);
        }
    }
}