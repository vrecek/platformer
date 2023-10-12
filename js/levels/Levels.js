import Entity from '../Entity.js';
const LEVELS = [
    // LEVEL 1
    {
        player: {
            x: 0,
            y: 560
        },
        enemies: [],
        surfaces: [
            new Entity(150, 530, 40, 40),
            new Entity(350, 530, 40, 40),
        ],
        scores: [
            new Entity(250, 450, 20, 20),
            new Entity(450, 450, 20, 20),
            new Entity(775, 575, 20, 20),
        ]
    },
    // LEVEL 2
    {
        player: {
            x: 0,
            y: 560
        },
        enemies: [],
        surfaces: [
            new Entity(225, 500, 40, 100),
            new Entity(185, 560, 40, 40),
            new Entity(265, 560, 40, 40),
            new Entity(320, 420, 180, 40),
            new Entity(225, 335, 180, 40),
            new Entity(180, 260, 40, 40),
        ],
        scores: [
            new Entity(100, 550, 20, 20),
            new Entity(775, 575, 20, 20),
            new Entity(440, 380, 20, 20),
            new Entity(190, 220, 20, 20),
        ]
    },
    // LEVEL 3
    {
        player: {
            x: 0,
            y: 560
        },
        enemies: [
            new Entity(150, 560, 80, 40),
            new Entity(350, 580, 325, 20),
            new Entity(675, 0, 40, 415),
        ],
        surfaces: [
            new Entity(675, 500, 40, 100),
            new Entity(715, 570, 20, 30),
            new Entity(405, 530, 20, 20),
            new Entity(570, 530, 20, 20),
        ],
        scores: [
            new Entity(775, 575, 20, 20),
            new Entity(180, 500, 20, 20),
            new Entity(280, 400, 20, 20),
            new Entity(570, 370, 20, 20),
        ]
    },
    // LEVEL 4
    {
        player: {
            x: 20,
            y: 40
        },
        enemies: [
            new Entity(0, 560, 800, 40),
            new Entity(285, 25, 20, 40, {
                speed: 4,
                paths: [
                    { x: 285, y: 200 },
                ]
            }),
            new Entity(500, 200, 20, 40, {
                speed: 4,
                paths: [
                    { x: 500, y: 25 },
                ]
            }),
            new Entity(240, 270, 40, 20, {
                speed: 3,
                paths: [
                    { x: 470, y: 270 },
                ]
            }),
        ],
        surfaces: [
            new Entity(20, 80, 100, 20),
            new Entity(50, 230, 40, 20),
            new Entity(175, 150, 40, 20),
            new Entity(400, 150, 40, 20),
            new Entity(600, 220, 40, 20),
            new Entity(175, 300, 400, 20),
        ],
        scores: [
            new Entity(610, 190, 20, 20),
            new Entity(60, 200, 20, 20),
            new Entity(410, 120, 20, 20),
            new Entity(360, 270, 20, 20),
        ]
    },
];
export default LEVELS;
