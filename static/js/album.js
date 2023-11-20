export class PhotoAlbumUI{
    constructor(name, photo_count, on_disk){
        this.name = name;
        this.photo_count = photo_count;
        this.on_disk = on_disk;
    }

    getName(){
        return this.name;
    }

    getPhotoCount(){
        return this.photo_count;
    }

    getOnDisk(){
        return this.on_disk;
    }

    setName(name){
        this.name = name;
    }

    setPhotoCount(photo_count){
        this.photo_count = photo_count;
    }

    setOnDisk(on_disk){
        this.on_disk = on_disk;
    }

    getDownloadButtonText(){
        if(this.on_disk){
            return "Synchronize";
        } else {
            return "Download";
        }
    }
}