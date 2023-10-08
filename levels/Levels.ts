import Entity from '../Entity.js'
import { Level } from '../interfaces/GameTypes'

// HAS TO BE AT LEAST ONE "SURFACE" ENTITY IN EACH LEVEL
const LEVELS: Level[] = [
    {
        player: {
            x: 0,
            y: 560
        },
        enemies: [],
        surfaces: [
            new Entity(500, 500, 40, 40)
        ],
        scores: [
            new Entity(200, 580, 20, 20),
            new Entity(300, 580, 20, 20)
        ]
    },

    {
        player: {
            x: 0,
            y: 560
        },
        enemies: [],
        surfaces: [
            new Entity(500, 500, 40, 40)
        ],
        scores: [
            new Entity(200, 580, 20, 20),
            new Entity(100, 520, 20, 20),
            new Entity(400, 520, 20, 20)
        ]
    }
]


export default LEVELS