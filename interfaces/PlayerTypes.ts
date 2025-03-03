export type MoveKeys = 'w' | 'a' | 's' | 'd'

export type PlayerPos = {
    x: number
    y: number
}

export type Bind = {
    keys: string[]
    fn:   () => void
}

export type Bindings = {
    [key:string]: Bind
}