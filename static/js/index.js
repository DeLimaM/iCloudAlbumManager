addEventListener("DOMContentLoaded", updateAlbums);

setInterval(updateAlbums, 10000);

function updateAlbums(){
    $.ajax({
        url: 'update_albums',
        type: "POST",
        data: { },
        success: function (response) {
        }
    })
}