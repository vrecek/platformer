import Entity from '../Entity.js';
// HAS TO BE AT LEAST ONE "SURFACE" ENTITY IN EACH LEVEL
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
            // new Entity(450, 450, 20, 20),
            // new Entity(775, 575, 20, 20),
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
    // // LEVEL 3
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
];
export default LEVELS;
