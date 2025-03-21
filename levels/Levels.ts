import Entity from '../ts/entities/Entity.js'
import { Level } from '../interfaces/GameTypes'
import Item from '../ts/entities/Item.js'
import Platform from '../ts/entities/Platform.js'
import Score from '../ts/entities/Score.js'
import Enemy from '../ts/entities/Enemy.js'
import WeaponItem from '../ts/entities/WeaponItem.js'
import Ammo from '../ts/entities/Ammo.js'
import Exit from '../ts/Exit.js'


const LEVELS: Level[] = [
    {
        player: { x: 0, y: 560 },
        exit: [new Exit(700, 530)],
        ammo: [
            new Ammo(520, 570)
        ],
        weapons: [
            new WeaponItem(450, 540, 'smg')
        ],
        enemies: [
            new Enemy(650, 560, 40, 40, {
                shoot: true,
                // animPath: {
                //     speed: 5,
                //     paths: [[650, 360], [350, 360], [650, 360]]
                // },
                act_defaults: {
                    direction: 'left',
                    //weapon: new WeaponItem(0, 0, 'rocketlauncher', true).getWeaponStats(),
                }
            }),
        ],
        surfaces: [
            // new Entity(150, 550, 40, 40),
            // new Entity(350, 550, 40, 40),
            // new Entity(150, 550, 40, 40),
            // new Entity(500, 580, 80, 20, {
            //     animPath: {
            //         speed: 2,
            //         paths: [{x: 500, y: 400}]
            //     }
            // }),
            // new Entity(400, 510, 90, 20, {
            //     animPath: {
            //         speed: 3,
            //         paths: [[100, 510]]
            //     }
            // }),
        ],
        scores: [
            new Score(250, 480),
            new Score(450, 480),
            // new Score(775, 575)
        ],
        platforms: [
            new Platform(500, 595, 200, 'speed'),
            new Platform(250, 590, 40, 'jump'),
        ],
        items: [
            new Item(150, 550, 'jump'),
            new Item(200, 550, 'attackdmg'),
            new Item(250, 550, 'invincibility'),
            new Item(300, 550, 'jumpboost'),
            new Item(350, 550, 'attackspeed'),
            new Item(400, 550, 'speed'),
        ]
    },

    // {
    //     player: { x: 50, y: 560 },
    //     enemies: [],
    //     surfaces: [
    //         new Entity(200, 550, 60, 20),
    //         new Entity(370, 510, 60, 20),
    //         new Entity(540, 470, 60, 20),
    //     ],
    //     scores: [
    //         new Score(220, 470),
    //         new Score(420, 420),
    //         new Score(620, 370),
    //     ],
    //     platforms: []
    // },

    // {
    //     player: { x: 0, y: 560 },
    //     enemies: [],
    //     surfaces: [
    //         new Entity(225, 520, 40, 80),
    //         new Entity(185, 560, 40, 40),
    //         new Entity(265, 560, 40, 40),
    //         new Entity(320, 470, 180, 40),
    //         new Entity(225, 415, 180, 10),
    //         new Entity(180, 370, 40, 20),
    //     ],
    //     scores: [
    //         new Score(100, 550),
    //         new Score(775, 575),
    //         new Score(440, 380),
    //         new Score(190, 330),
    //     ],
    //     platforms: []
    // },

    // {
    //     player: { x: 0, y: 560 },
    //     enemies: [
    //         new Entity(150, 580, 50, 20),
    //         new Entity(350, 580, 325, 20),
    //         new Entity(675, 0, 40, 415),
    //     ],
    //     surfaces: [
    //         new Entity(675, 500, 40, 100),
    //         new Entity(715, 570, 20, 30),
    //         new Entity(405, 530, 20, 20),
    //         new Entity(355, 550, 20, 20),
    //         new Entity(570, 530, 20, 20),
    //     ],
    //     scores: [
    //         new Score(775, 575),
    //         new Score(165, 500),
    //         new Score(280, 430),
    //         new Score(570, 410),
    //     ],
    //     platforms: []
    // },
    
    {
        player: { x: 20, y: 40 },
        weapons: [],
        exit: [new Exit(700, 550)],
        ammo: [],
        enemies: [
            new Enemy(0, 560, 800, 40),
            new Enemy(285, 25, 20, 40, {
                animPath: {
                    speed: 4,
                    paths: [[285,210]]
                }
            }),
            new Enemy(500, 210, 20, 40, {
                animPath: {
                    speed: 4,
                    paths: [[500, 25]]
                }
            }),
            new Enemy(240, 270, 40, 20, {
                animPath: {
                    speed: 4, 
                    interval_wait: 500,
                    paths: [[470,260]]
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
            // new Score(510, 120),
            // new Score(360, 270),
        ],
        platforms: [],
        items: []
    },
]


export default LEVELS