import { Achievement } from "../interfaces/GameTypes.js"
import Game from "./Game.js"


const init = (): void => {
    const [all, unl]: [Achievement[], Achievement[]] = new Game().getAllAchievements()

    const container: Element = document.querySelector('main.achievements-page section.container')!,
          count:     Element = document.querySelector('span.count')!,
          perc:      Element = document.querySelector('span.perc')!


    count.textContent = `${unl.length}/${all.length}`
    perc.textContent  = `(${(100 * unl.length / all.length).toFixed(0)}%)`

    for (const a of all)
    {
        const f:  HTMLElement      = document.createElement('figure'),
              d:  HTMLElement      = document.createElement('div'),
              p1: HTMLElement      = document.createElement('p'),
              p2: HTMLElement      = document.createElement('p'),
              i:  HTMLImageElement = document.createElement('img')

        let src: string = a.img


        if (!a.unlocked)
        {
            f.className = 'locked'
            src         = '/data/locked.png'
        }
        
        p1.textContent = a.title
        p1.className   = 'title'
        p2.textContent = a.txt
        p2.className   = 'txt'

        i.src     = src
        i.loading = 'lazy'

        d.append(p1, p2)
        f.append(i, d)
        container.append(f)
    }
}


init()