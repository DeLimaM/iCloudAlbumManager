class Icon {
    constructor(buttonId) {
        this.buttonId = buttonId;
        this.buttonElement = document.getElementById(this.buttonId);
        this.states = {
            sync: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"> <path fill="var(--ci-primary-color, currentColor)" d="M410.168,133.046,381.21,104.088,464.017,104l-.034-32L328,72.144V208h32V128.132l27.541,27.541A152.5,152.5,0,0,1,279.972,416l.056,32a184.5,184.5,0,0,0,130.14-314.954Z" class="ci-primary"/> <path fill="var(--ci-primary-color, currentColor)" d="M232.028,104l-.056-32a184.5,184.5,0,0,0-130.14,314.954L130.878,416H48v32H184V312H152v79.868l-27.541-27.541A152.5,152.5,0,0,1,232.028,104Z" class="ci-primary"/>',
            download: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16"> <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/> <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>',
            cancel: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-stop-circle" viewBox="0 0 16 16"> <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/> <path d="M5 6.5A1.5 1.5 0 0 1 6.5 5h3A1.5 1.5 0 0 1 11 6.5v3A1.5 1.5 0 0 1 9.5 11h-3A1.5 1.5 0 0 1 5 9.5v-3z"/>'
        };
        this.currentState = 'sync';
        this.updateIcon();
    }

    // Method to change the state to 'download'
    download() {
        this.currentState = 'download';
        this.updateIcon();
    }

    // Method to change the state to 'cancel'
    cancel() {
        this.currentState = 'cancel';
        this.updateIcon();
    }

    // Method to change the state to 'sync'
    sync() {
        this.currentState = 'sync';
        this.updateIcon();
    }

    // Method to update the icon display
    updateIcon() {
        if (this.buttonElement) {
            this.buttonElement.innerHTML = this.states[this.currentState];
        }
    }
}

export default Icon;