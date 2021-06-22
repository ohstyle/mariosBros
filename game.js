kaboom({
    global: true,
    fullscreen: true,
    scale: 1.5,
    debug: true,
    clearColor: [0,0,0,1],
});
// load sprite sur le site igmgur.com on a pas le bon chemin pour le moment----------------------------------

// loadRoot('https://imgur.com/a/IjfCyXY/');
// loadRoot('https://imgur.com/a/IjfCyXY')
// loadRoot('<blockquote class="imgur-embed-pub" lang="en" data-id="a/IjfCyXY"  ><a href="//imgur.com/a/IjfCyXY">marioBros</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>')

// load Sprite a la dur----------------------------------------------
loadSprite('marioBros','marioBros.png')
loadSprite('blockBrique','blockBrique.png')
loadSprite('coin','coin.png')
loadSprite('evil-shroom-r','evilShroomR.png')
loadSprite('evil-shroom-l','evilShroomL.png')
loadSprite('pipe','pipe.png')
loadSprite('mushroom','mushroom.png')
loadSprite('blockSurprise','blockSurprise.png')
loadSprite('unboxed','blockNormal.png')
loadSprite('blueBlock','blueBlock.png')
loadSprite('blueBrick','blueBrick.png')
loadSprite('blueEvilMushroom','blueEvilMushroom.png')
// loadSprite('blueSteel','bluesteel.png')
loadSprite('blueSurprise','blueSurprise.png')




// variable du game--------------------------------------------------
const MOVE_SPEED = 120;
const JUMP_FORCE = 340;
const BIG_JUMP_FORCE = 550;
let CURRENT_JUMP_FORCE = JUMP_FORCE;
const ENEMY_SPEED  = 30;
let isJumping = true;
const FALL_DEATH = 400;

// la scene------------------------------------------------------------
scene("game", ({level, score}) => {
    layers(['bg','obj', 'ui'],'obj')
const maps = [
    [  
    '                                  ',
    '                                  ',
    '                                  ',
    '                                  ',
    '                                  ',
    '                                  ',
    '    ?  =-=?=                      ',
    '                                  ',
    '                 ^   ^     ()     ',
    '===========================  ==========='],
[
    '€                                €',
    '€                                €',
    '€                                €',
    '€                                €',
    '€                                €',
    '€                   x            €',
    '€      @@@@@@             x x    €',
    '€                     x x x x  ( €',
    '€             z  z  x x x x x    €',
    '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!'
                                     
]
]
// level configuration--------------------------------------------------
const levelCfg = {
    width: 20,
    height: 20,
    '=': [sprite('blockBrique'),solid()],
    '$': [sprite('coin'),'coin'],
    '?': [sprite('blockSurprise'), solid(),'coin-surprise'],
    '-': [sprite('blockSurprise'), solid(),'mushroom-surprise'],
    '}': [sprite('unboxed'), solid()],
    '(': [sprite('pipe'), solid(), scale(), 'pipe'],
    '^': [sprite('evil-shroom-r'), solid(),'dangerous',body()],
    '#': [sprite('mushroom'), solid(),'mushroom',body()],
    //les blues-------------------------------------------------
    '!': [sprite('blueBlock'), solid(), scale(0.5)],
    '€': [sprite('blueBrick'), solid(), scale(0.5)],
    'z': [sprite('blueEvilMushroom'), solid(), scale(0.5),'dangerous'],
    '@': [sprite('blueSurprise'), solid(), scale(0.5),'coin-surprise'],
    // 'x': [sprite('blueSteel'), solid(), scale(0.5)],





    
};
const gameLevel = addLevel(maps[level], levelCfg);

// le player----------------------------------------------------------
const player = add([
    sprite('marioBros'),solid(),
    pos(10,0),
    body(),
    big(),
    origin('bot')
]);
// les fonction du player quand il saute et touche avec sa tete--------------------------------------------
player.on("headbump", (obj) =>{
    if(obj.is('coin-surprise')){
        gameLevel.spawn('$', obj.gridPos.sub(0,1));
        destroy(obj);
        gameLevel.spawn('}', obj.gridPos.sub(0,0));
    }
    if(obj.is('mushroom-surprise')){
        gameLevel.spawn('#', obj.gridPos.sub(0,1));
        destroy(obj);
        gameLevel.spawn('}', obj.gridPos.sub(0,0));
    }
});
// collides// les foction du player quand il touche un mushroom et coin-----------------
player.collides('mushroom',(m) => {
    destroy(m);
    player.biggify(6);
    
})

player.collides('coin',(c) => {
    destroy(c);
    scoreLabel.value++
    scoreLabel.text = scoreLabel.value
  
})
//action collides evil-shroom

action('dangerous', (d) =>{
    d.move(-ENEMY_SPEED, 0);
    })

// collides // avec evil-shroom------------------------------------------------------------
player.collides('dangerous',(d) =>{
    if(isJumping){
        destroy(d)
    }else{
        go('lose',{score: scoreLabel.value})
    }
  
})
//player camera position-------------------------------------------------------------------
player.action(()=>{
    camPos(player.pos)
    if(player.pos.y >= FALL_DEATH ){
        go('lose',{score:scoreLabel.value})
    }
})
player.collides('pipe', () => {
    keyPress('down', () => {
        go('game', {
            level: (level + 1) % maps.length,
            score:scoreLabel.value
        })
    })
})

// mouvement du mushroom-------------------------------------------------------------------
action('mushroom',(m) =>{
    m.move(30,0);
})

// ecouter d'evenement keyboard-----------------------------------------------
keyDown('left',() => {
    player.move(-MOVE_SPEED,0)
});
keyDown('right',() => {
    player.move(MOVE_SPEED,0)
});
player.action(() =>{
    if(player.grounded()){
        isJumping = false;
    }
})
keyPress('space', () =>{
    if(player.grounded()){
        isJumping = true
        player.jump(CURRENT_JUMP_FORCE)
    }
}) 

// le score----------------------------------------------------------
const scoreLabel = add([
    text(score),
    pos(370,10),
    layer('ui'),
    {
        value: score,
    }
]);


// savoit quelle niveau nous somme -----------------------------------
add([text('level' + parseInt(level + 1)), pos(4,6) ])

scene('lose',({score}) => {
    add([text(score, 32), origin('center'), pos(width()/2, height()/2)])
})
//fin-----------------------------------------------------------------
});

// devenir grand------------------------------------------------------
function big(){
    let timer = 0;
    let isBig = false;
    return {
        update() {
            if(isBig){
                CURRENT_JUMP_FORCE = BIG_JUMP_FORCE;
                timer -= dt();
            if(timer<=0){
                this.smallify();
            }
            }
        },
        isBig(){
            return isBig;
        },
        smallify() {
            this.scale = vec2(1)
            CURRENT_JUMP_FORCE = JUMP_FORCE;
            timer = 0;
            isBig = false ;
        },
        biggify(time) {
            this.scale = vec2(2)
            timer = time;
            isBig = true ;
        }

    }

}
start("game" , {level:0, score: 0});