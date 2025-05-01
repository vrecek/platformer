import { VoidFn } from "../../interfaces/GameTypes"


const load_save_ui = (type: 'save' | 'load', actionFn: VoidFn, unpauseFn?: VoidFn): void => {
    if (document.querySelector('section.ls-menu-section'))
        return

    const [mains, p1, container, btns, s1, i1, i2, i3] = ['section', 'p', 'section', 'section', 'section', 'i', 'i', 'i'].map(x => document.createElement(x)) 
    const saves = [...new Array(9)].map(_ => document.createElement('section'))


    mains.className = 'ls-menu-section'

    p1.className   = 'header-info'
    p1.textContent = `${type === 'load' ? 'Load' : 'Save'} game`

    container.className = 'container'
    
    for (const x of saves)
    {
        // ...
        x.onclick = () => {
            for (const y of saves)
                y.classList.remove('active')
            
            i1.classList.remove('off')
            i2.classList.remove('off')
            x.className = 'empty active' // empty | content
        }

        x.textContent = x.className = 'empty' // empty | content
    }

    container.append(...saves)

    i1.onclick = () => {
        if (saves.some(x => !x.classList.contains('active'))) 
            return

        actionFn()
    }

    i2.onclick = () => {
        if (!saves.some(x => !x.classList.contains('active'))) 
            return

        // delete save

        mains.remove()
        load_save_ui(type, actionFn, unpauseFn)
    }

    i3.onclick = () => {
        mains.remove()
        unpauseFn?.()
    }

    btns.className = 'buttons'
    
    i1.className = type === 'load' ? 'material-icons load off' : 'material-icons save off'
    i2.className = 'material-icons delete off'
    i3.className = 'material-icons back'

    i1.textContent = type === 'load' ? 'play_circle' : 'save'
    i2.textContent = 'delete'
    i3.textContent = 'close'

    s1.append(i1, i2)
    btns.append(s1)
    btns.append(i3)
    mains.append(p1, container, btns)


    document.body.append(mains)
}


export default load_save_ui