import getLevels from "../levels/Levels.js"


const init = (): void => {
    displayLevels()
    initStartBtn()

    document.querySelector('button.clear')?.addEventListener('click', () => {
        localStorage.removeItem('unlocked_lvl')
        window.location.reload()
    })
}


const initStartBtn = (): void => {
    document.querySelector('button.start')?.addEventListener('click', () => {
        const main: Element = document.querySelector('main')!,
              lvl:  number  = [...main.children].findIndex(x => x.classList.contains('active'))

        if (lvl === -1)
            return
    
        localStorage.setItem('init_lvl', `${lvl}`)
        document.location.href = '/game.html'
    })
}

const displayLevels = (): void => {
    const main:     Element  = document.querySelector('main')!,
          lvls:     string[] = getLevels().map(x => x.image),
          len:      number   = lvls.length

    let unlocked: number[] = JSON.parse(localStorage.getItem('unlocked_lvl') ?? 'null')


    if (!unlocked)
    {
        unlocked    = [...new Array(len).fill(0)]
        unlocked[0] = 1
    }


    for (let n = 0; n < len; n++)
    {
        const s: HTMLElement      = document.createElement('section'),
              p: HTMLElement      = document.createElement('p'),
              f: HTMLElement      = document.createElement('figure'),
              i: HTMLImageElement = document.createElement('img')


        p.textContent = `Level ${n+1}`
        i.loading     = 'lazy'

        if (unlocked[n])
        {
            i.src = lvls[n]
    
            i.addEventListener('click', () => {
                for (const x of main.children)
                    x.classList.remove('active')
                
                s.className = 'active'
            })
        }
        else
        {
            i.src       = '/data/locked.png'
            s.className = 'locked'
        }

        f.append(i)
        s.append(p, f)
        main.append(s)
    }
}


init()