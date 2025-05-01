import load_save_ui from "./utils/load_save_ui.js"


const init = (): void => {
    load_save_ui('load', () => {})

    document.querySelector('i.material-icons.back')?.addEventListener('click', () => {
        window.location.href = '/index.html'
    })
}


init()