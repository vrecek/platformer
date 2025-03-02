import Entity from '../Entity.js'
import { Level } from '../interfaces/GameTypes'
import Score from '../Score.js'


const LEVELS: Level[] = [
    {
        player: { x: 0, y: 560 },
        enemies: [],
        surfaces: [
            // new Entity(150, 550, 40, 40),
            new Entity(350, 550, 40, 40),
            new Entity(150, 550, 40, 40),
            new Entity(500, 580, 40, 20, {
                animPath: {
                    speed: 2,
                    paths: [{x: 500, y: 400}]
                }
            }),
            new Entity(400, 510, 90, 20, {
                animPath: {
                    speed: 3,
                    paths: [{x: 100, y: 510}]
                }
            }),
        ],
        scores: [
            new Score(250, 480),
            new Score(450, 480),
            new Score(775, 575)
        ],
        platforms: [
            new Entity(250, 590, 40, 10, {name: 'jump', color: 'gold'}),
            // new Entity(0, 598, 800, 2, {name: 'speed', color: '#ff5800'}),
        ]
    },

    {
        player: { x: 50, y: 560 },
        enemies: [],
        surfaces: [
            new Entity(200, 550, 60, 20),
            new Entity(370, 510, 60, 20),
            new Entity(540, 470, 60, 20),
        ],
        scores: [
            new Score(220, 470),
            new Score(420, 420),
            new Score(620, 370),
        ],
        platforms: []
    },

    {
        player: { x: 0, y: 560 },
        enemies: [],
        surfaces: [
            new Entity(225, 520, 40, 80),
            new Entity(185, 560, 40, 40),
            new Entity(265, 560, 40, 40),
            new Entity(320, 470, 180, 40),
            new Entity(225, 415, 180, 10),
            new Entity(180, 370, 40, 20),
        ],
        scores: [
            new Score(100, 550),
            new Score(775, 575),
            new Score(440, 380),
            new Score(190, 330),
        ],
        platforms: []
    },

    {
        player: { x: 0, y: 560 },
        enemies: [
            new Entity(150, 580, 50, 20),
            new Entity(350, 580, 325, 20),
            new Entity(675, 0, 40, 415),
        ],
        surfaces: [
            new Entity(675, 500, 40, 100),
            new Entity(715, 570, 20, 30),
            new Entity(405, 530, 20, 20),
            new Entity(355, 550, 20, 20),
            new Entity(570, 530, 20, 20),
        ],
        scores: [
            new Score(775, 575),
            new Score(165, 500),
            new Score(280, 430),
            new Score(570, 410),
        ],
        platforms: []
    },
    
    {
        player: { x: 20, y: 40 },
        enemies: [
            new Entity(0, 560, 800, 40),
            new Entity(285, 25, 20, 40, {
                animPath: {
                    speed: 4,
                    paths: [{ x: 285, y: 210 }]
                }
            }),
            new Entity(500, 210, 20, 40, {
                animPath: {
                    speed: 4,
                    paths: [{ x: 500, y: 25 }]
                }
            }),
            new Entity(240, 270, 40, 20, {
                animPath: {
                    speed: 4,
                    paths: [{ x: 470, y: 270 }]
                }
            }),
        ],
        surfaces: [
            new Entity(20, 80, 100, 20),

            new Entity(50, 270, 40, 10),
            new Entity(175, 170, 40, 10),
            new Entity(115, 215, 40, 10),
            new Entity(115, 290, 40, 10),

            new Entity(300, 150, 40, 20),
            new Entity(400, 150, 40, 20),
            new Entity(500, 150, 40, 20),
            new Entity(640, 260, 40, 20),

            new Entity(175, 300, 400, 20),
        ],
        scores: [
            new Score(650, 200),
            new Score(60, 200),
            new Score(510, 120),
            new Score(360, 270),
        ],
        platforms: []
    },
]


export default LEVELS