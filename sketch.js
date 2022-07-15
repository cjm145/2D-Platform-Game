/*

The Game Project - Farmer Goes Harvesting

Done by Chua Jia Ming

*/

var floorPos_y;
var floorPos_x;

var gameChar_x;
var gameChar_y;
var gameChar_width;

var isLeft;
var isRight
var isFalling;
var isPlummeting;

var canyons;
var collecyables;

var mountains;
var clouds;

var trees;
var treepos_x;
var trunkHeight;
var trunkWidth;

var scrollPos;
var gameChar_world_x;

var checkPoint;
var platforms;

var lives;
var gamePoints;

var enemies;
let c1,c2; 

var img;

var jumpSound;
var gameoverSound;
var endgameSound;

function preload()
{
    //load image
    img = loadImage("farmbarn.png");
    
    soundFormats('mp3','wav');
    
    //load your sounds here
    jumpSound = loadSound('assets/jump.mp3');
    gameoverSound = loadSound('assets/gameover.wav')
    endgameSound = loadSound('assets/gamecompleted.wav')
    jumpSound.setVolume(0.1);
    gameoverSound.setVolume(0.3);
    endgameSound.setVolume(0.3);
}


function setup()
{
    createCanvas(1024, 576);
    floorPos_y = height * 3/4;
    floorPos_x = width/2;
    
    checkPoint = {x_pos:2730, isReached:false};
    
    c1 = color(40,138,255);       //Top gradient of the sky
    c2 = color(255,255,225);      //Bottom gradient of the sky

    lives=3;
    gamePoints = 0;
    startGame();
}

function draw()
{
    ///////////DRAWING CODE//////////
    
    //fill the sky blue with gradient
        for(let y=0; y<height; y++){
        n = map(y,0,height,0,1);
        let newc = lerpColor(c1,c2,n);
        stroke(newc);
        line(0,y,width, y);
  }
    drawGamePoints();
    
    //draw the mountains
    drawMountains();

    //draw farm ground
    noStroke();
    fill(163,143,62);
    rect(0, floorPos_y, width, height - floorPos_y);

    //Game side scroll
    push();
    translate(scrollPos,0);
    
    //display image
    image(img,2600,145,250,300);

    //draw the canyon
    fill(0,0,0);
    drawCanyons();
    
    //draw checkpoint
    renderCheckPoint();
    
    //draw the clouds
    drawClouds();
    
    //draw the trees
    drawTrees();

    //draw the collectable
    checkAndDrawCollectables();

    //draw enemies
    for(var i=0;i<enemies.length;i++){
        enemies[i].draw();
    }
    
    //draw platform
    for(var i=0;i<platforms.length;i++){
        platforms[i].draw();
    }

    pop();

    //the game character

    //check if game character is falling off into the canyon
    checkGameCharIsFallingOffIntoCanyon();
    //check if game character reach the game end point
    checkCheckPoint();

    if(isLeft && isFalling)
    {
        // add your jumping-left code
        drawJumpingLeft();
    }
    else if(isRight && isFalling)
    {
        // add your jumping-right code    
        drawJumpingRight();
    }
    else if(isLeft)
    {
        // add your walking left code
        drawWalkingLeft();
    }
    else if(isRight)
    {
        // add your walking right code
        drawWalkingRight();
    }
    else if(isFalling || isPlummeting)
    {
        // add your jumping facing forwards code
        drawJumpingFacingForwards();
    }
    else
    {
        // add your standing front facing code
        drawStandingFrontFacing();
    }


    ///////////INTERACTION CODE//////////
    //Put conditional statements to move the game character below here
    if(isPlummeting==true)
    {
        gameChar_y += 5;
    }else{
        if(gameChar_y < floorPos_y)
           {
               isContact = false;
               for(var i=0;i<platforms.length;i++)
               {
                   isContact = platforms[i].checkContact(gameChar_world_x,gameChar_y);
                   if(isContact)
                   {
                       isFalling = false;
                       break;
                   }
               }
               if(!isContact)
               {
                   isFalling = true;
                   gameChar_y += 3.5;
               }
           }
        else
            {
                isFalling = false;
            }
        if(isLeft==true){
            if(gameChar_x > width * 0.2)
            {
                gameChar_x -= 5;
            }
            else
            {
                scrollPos += 5;
            }
        }
        else if(isRight==true){
            if(gameChar_x < width * 0.8)
            {
                gameChar_x += 5;
            }
            else
            {
                scrollPos -= 5; // negative for moving against the background
            }
        }
    }


    // Update real position of gameChar for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;

    checkPlayerDie();
    drawLifeTokens();
}

function drawLifeTokens(){
    for(var i=0;i<lives;i++){
        textSize(35);
        text("💖",50*i, 50);   //draw graphical lives count in the game
    }

}

function checkPlayerDie(){

    var playerDie = false;
    if(gameChar_y>height){
        lives--;
        playerDie = true;
    }
    else{
        //check if in contact with enemies
        for(var i=0;i<enemies.length;i++){
            var isContact = enemies[i].checkContact(gameChar_world_x,gameChar_y);
            if(isContact){
                playerDie=true;
                lives--;
                break;
            }
        }
    }
    
    if(playerDie && lives > 0)
    {
        startGame();
        gamePoints = 0;     //Gamepoints reset
    }
    
    else if(lives==0){
        fill(255);
        textSize(50);
        text("Game over",width/2-150,300);
        gameoverSound.play();
        noLoop();
    }
}

function startGame(){

    //gameChar_x = width/2;
    gameChar_x = 20;
    gameChar_y = floorPos_y;
    gameChar_width = 50;

    isLeft = false;
    isRight = false;
    isPlummeting = false;
    isFalling = false;


    scrollPos = 0;

    // Variable to store the real position of the gameChar in the game
    // world. Needed for collision detection.
    gameChar_world_x = gameChar_x - scrollPos;

    treepos_x = [150,340,650,850,1300,1400,2060,2400];
    trunkHeight = 40;
    trunkWidth = 28;

    clouds = [
        {pos_x: 95,pos_y: 100},
        {pos_x: 440,pos_y: 70},
        {pos_x: 800,pos_y: 120},
        {pos_x: 1400,pos_y: 70},
        {pos_x: 1800,pos_y: 50},
    ];

    canyons = [{x_pos: 190, width: 110},
               {x_pos: 500, width: 105},
               {x_pos: 1000, width: 120},
               {x_pos: -300, width: 250},
               {x_pos: 1650, width: 200}];

    collectables = [{x_pos: 100, y_pos:floorPos_y, size: 40, isFound: false},
                    {x_pos: 400, y_pos:floorPos_y, size: 40, isFound: false},
                    {x_pos: 750, y_pos:floorPos_y, size: 40, isFound: false},
                    {x_pos: 1470, y_pos:floorPos_y, size: 40, isFound: false},
                    {x_pos: 1950, y_pos:floorPos_y, size: 40, isFound: false}];
    
    platforms=[];
    platforms.push(createPlatform(1690,floorPos_y-70,85));
    
    enemies = [];
    enemies.push(new Enemy(400,floorPos_y-10,100)),
    enemies.push(new Enemy(680,floorPos_y-10,200)),
    enemies.push(new Enemy(1280,floorPos_y-10,200));

}

function createPlatform(x,y,length){
    var p = {
        x:x,
        y:y,
        length:length,
        draw: function(){
            strokeWeight(2);
            stroke(20);
            fill(70,50,19);
            rect(this.x,this.y,this.length,15);
        },
        checkContact: function(gc_x, gc_y){
            if(gc_x>this.x && gc_x< this.x + this.length){
                //console.log("inline with platform");
                var d = this.y - gc_y;
                if(d>=0 && d<1){
                    return true;
                }
            }
            return false;
        }
    }
    return p;
}

function drawGamePoints(){
    text("Score:"+gamePoints,800,50);
}

function renderCheckPoint(){
    
    if(checkPoint.isReached){
        fill(163,143,62);
        fill(255);
        textSize(55);
        text("Game Finished",2250,250);
        endgameSound.play();
        noLoop();
    }
    fill(255);
    rect(checkPoint.x_pos,floorPos_y-120,1,120);
}

function checkCheckPoint(){
    
    if(checkPoint.isReached==false){
        var d = dist(gameChar_world_x,gameChar_y,checkPoint.x_pos,floorPos_y);
        if(d<10){
            checkPoint.isReached=true;
        }
    }
}

function checkGameCharIsFallingOffIntoCanyon(){
    for(var i=0;i<canyons.length;i++){
        var canyon = canyons[i];
        if((gameChar_world_x>canyon.x_pos-8+gameChar_width/2 && gameChar_y== floorPos_y) 
           &&
           (gameChar_world_x<canyon.x_pos+12+canyon.width-gameChar_width/2
            && gameChar_y== floorPos_y))
        {
            isPlummeting=true;
        }
    }
}

function drawClouds(){
    for(var i=0;i<clouds.length;i++)
    {
        fill(255,255,255);
        ellipse(clouds[i].pos_x,clouds[i].pos_y,80,60);
        ellipse(clouds[i].pos_x+40,clouds[i].pos_y+30,80,60);
        ellipse(clouds[i].pos_x-60,clouds[i].pos_y,80,60);
        ellipse(clouds[i].pos_x-20,clouds[i].pos_y+30,80,60);
    }
}

function drawTrees(){
    for(var i=0;i<treepos_x.length;i++)
        {
        fill(139,69,30);
        rect(treepos_x[i],392,trunkWidth,trunkHeight);
    
        fill(60,155,30);
        triangle(treepos_x[i],280,treepos_x[i]-20,400,treepos_x[i]+50,400);
        triangle(treepos_x[i],220,treepos_x[i]-20,365,treepos_x[i]+50,365);
        }
}

function drawMountains(){
    noStroke();
    fill(128,128,0,150);
    arc(floorPos_x-300,floorPos_y+25,500,480,PI,0);
    fill(34,139,34);
    arc(floorPos_x-100,floorPos_y+65,500,400,PI,0);
    fill(0,100,0);
    arc(floorPos_x+300,floorPos_y+60,560,440,PI,0);
}

function drawCanyons(){
    for(var i=0;i<canyons.length;i++){
        fill(70,50,19);
        rect(canyons[i].x_pos,floorPos_y,canyons[i].width,height-floorPos_y);
        fill(39,26,12);
        rect(canyons[i].x_pos,floorPos_y+50,canyons[i].width,height-floorPos_y);
        fill(20,13,6);
        rect(canyons[i].x_pos,floorPos_y+95,canyons[i].width,height-floorPos_y);
    }
}

function checkAndDrawCollectables(){
    for(var i=0;i<collectables.length;i++){
        var collectable = collectables[i];
        if(dist(gameChar_world_x,gameChar_y,collectable.x_pos,collectable.y_pos)<20)
        {
            if(collectable.isFound==false){
                gamePoints += 100;
                collectable.isFound=true;
            }
        }

        if(collectable.isFound==false){
            fill(197,179,88);
            rect(collectable.x_pos,collectable.y_pos-30,30,30);
            fill(184,134,11);
            rect(collectable.x_pos+2,collectable.y_pos-28,26,26);
        }
    }
}

function drawJumpingLeft()
{
    //shoes
    fill(139,69,19);
    ellipse(gameChar_x-12,gameChar_y-4,13,5);
    ellipse(gameChar_x+9,gameChar_y-4,13,5);
    
    //right hand 
    fill(222,184,135);
    ellipse(gameChar_x-10,gameChar_y-30,12,10);
    
    //body
    fill(0,0,255);
    rect(gameChar_x-10,gameChar_y-40,20,20);
    
    //left hand
    fill(222,184,135);
    ellipse(gameChar_x+5,gameChar_y-35,12,10);
    
    //head
    fill(222,184,135);
    ellipse(gameChar_x,gameChar_y-50,20,20);
    fill(255,255,255);
    ellipse(gameChar_x-5,gameChar_y-49,3,4);
    ellipse(gameChar_x+2,gameChar_y-49,3,4);
    fill(0,0,0);
    ellipse(gameChar_x-4,gameChar_y-49,2,2);
    ellipse(gameChar_x+1,gameChar_y-49,2,2);
    rect(gameChar_x-3,gameChar_y-44,4,1);
        
    //hat
    stroke(1);
    fill(139,69,19);
    rect(gameChar_x-15,gameChar_y-56,30,4);
    quad(gameChar_x-5,gameChar_y-65,gameChar_x+5,gameChar_y-65,gameChar_x+9,gameChar_y-54,gameChar_x-9,gameChar_y-54);
    
    
    //right leg
    fill(0,0,0);
    quad(gameChar_x+2,gameChar_y-19,gameChar_x+10,gameChar_y-19,gameChar_x+14,gameChar_y-6,gameChar_x+6,gameChar_y-6);
    
    //left leg
    fill(0,0,0);
    quad(gameChar_x-2,gameChar_y-19,gameChar_x-10,gameChar_y-19,gameChar_x-13,gameChar_y-6,gameChar_x-5,gameChar_y-6);
}

function drawJumpingRight()
{
    //shoes
    fill(139,69,19);
    ellipse(gameChar_x-8,gameChar_y-4,13,5);
    ellipse(gameChar_x+12,gameChar_y-4,13,5);
    
    //left hand
    fill(222,184,135);
    ellipse(gameChar_x+9,gameChar_y-30,12,10);
    
    //body
    fill(0,0,255);
    rect(gameChar_x-10,gameChar_y-40,20,20);
    
    //right hand 
    fill(222,184,135);
    ellipse(gameChar_x-6,gameChar_y-35,12,10);
    
    //head
    fill(222,184,135);
    ellipse(gameChar_x,gameChar_y-50,20,20);
    fill(255,255,255);
    ellipse(gameChar_x-3,gameChar_y-49,3,4);
    ellipse(gameChar_x+5,gameChar_y-49,3,4);
    fill(0,0,0);
    ellipse(gameChar_x-2,gameChar_y-49,2,2);
    ellipse(gameChar_x+4,gameChar_y-49,2,2);
    rect(gameChar_x-2,gameChar_y-44,4,1);
    
    //hat
    stroke(1);
    fill(139,69,19);
    rect(gameChar_x-15,gameChar_y-56,30,4);
    quad(gameChar_x-5,gameChar_y-65,gameChar_x+5,gameChar_y-65,gameChar_x+9,gameChar_y-54,gameChar_x-9,gameChar_y-54 );
    
    //right leg
    fill(0,0,0);
    quad(gameChar_x+2,gameChar_y-19,gameChar_x+10,gameChar_y-19,gameChar_x+14,gameChar_y-6,gameChar_x+6,gameChar_y-6);
    
    //left leg
    fill(0,0,0);
    quad(gameChar_x-2,gameChar_y-19,gameChar_x-10,gameChar_y-19,gameChar_x-13,gameChar_y-6,gameChar_x-5,gameChar_y-6);   
    
    }

function drawWalkingLeft()
{
    //shoes
    fill(139,69,19);
    ellipse(gameChar_x-12,gameChar_y-1,13,5);
    ellipse(gameChar_x+9,gameChar_y-1,13,5);
    
    //body
    fill(0,0,255);
    rect(gameChar_x-10,gameChar_y-40,20,20);
    
    //right hand 
    fill(222,184,135);
    ellipse(gameChar_x-10,gameChar_y-35,12,10);
    
    //left hand
    fill(222,184,135);
    ellipse(gameChar_x+5,gameChar_y-35,12,10);
    
    //head
    fill(222,184,135);
    ellipse(gameChar_x,gameChar_y-50,20,20);
    fill(255,255,255);
    ellipse(gameChar_x-6,gameChar_y-49,3,4);
    ellipse(gameChar_x+3,gameChar_y-49,3,4);
    fill(0,0,0);
    ellipse(gameChar_x-5,gameChar_y-49,2,2);
    ellipse(gameChar_x+2,gameChar_y-49,2,2);
    rect(gameChar_x-3,gameChar_y-44,4,1);
        
    //hat
    stroke(1);
    fill(139,69,19);
    rect(gameChar_x-15,gameChar_y-56,30,4);
    quad(gameChar_x-5,gameChar_y-65,gameChar_x+5,gameChar_y-65,gameChar_x+9,gameChar_y-54,gameChar_x-9,gameChar_y-54);
    
    
    //right leg
    fill(0,0,0);
    quad(gameChar_x+2,gameChar_y-20,gameChar_x+10,gameChar_y-20,gameChar_x+14,gameChar_y-3,gameChar_x+6,gameChar_y-3);
    
    //left leg
    fill(0,0,0);
    quad(gameChar_x-2,gameChar_y-20,gameChar_x-10,gameChar_y-20,gameChar_x-13,gameChar_y-3,gameChar_x-5,gameChar_y-3);
}

function drawWalkingRight()
{
    //shoes
    fill(139,69,19);
    ellipse(gameChar_x-8,gameChar_y-1,13,5);
    ellipse(gameChar_x+12,gameChar_y-1,13,5);
    
    //body
    fill(0,0,255);
    rect(gameChar_x-10,gameChar_y-40,20,20);
    
    //right hand 
    fill(222,184,135);
    ellipse(gameChar_x-6,gameChar_y-35,12,10);
    
    //left hand
    fill(222,184,135);
    ellipse(gameChar_x+9,gameChar_y-35,12,10);
    
    //head
    fill(222,184,135);
    ellipse(gameChar_x,gameChar_y-50,20,20);
    fill(255,255,255);
    ellipse(gameChar_x-3,gameChar_y-49,3,4);
    ellipse(gameChar_x+5,gameChar_y-49,3,4);
    fill(0,0,0);
    ellipse(gameChar_x-2,gameChar_y-49,2,2);
    ellipse(gameChar_x+4,gameChar_y-49,2,2);
    rect(gameChar_x-2,gameChar_y-44,4,1);
    
    //hat
    stroke(1);
    fill(139,69,19);
    rect(gameChar_x-15,gameChar_y-56,30,4);
    quad(gameChar_x-5,gameChar_y-65,gameChar_x+5,gameChar_y-65,gameChar_x+9,gameChar_y-54,gameChar_x-9,gameChar_y-54 );
    
    //right leg
    fill(0,0,0);
    quad(gameChar_x+2,gameChar_y-20,gameChar_x+10,gameChar_y-20,gameChar_x+14,gameChar_y-3,gameChar_x+6,gameChar_y-3);
    
    //left leg
    fill(0,0,0);
    quad(gameChar_x-2,gameChar_y-20,gameChar_x-10,gameChar_y-20,gameChar_x-13,gameChar_y-3,gameChar_x-5,gameChar_y-3);
}

function drawStandingFrontFacing()
{
    //Shoes
    fill(139,69,19);
    ellipse(gameChar_x-9,gameChar_y-1,13,5);
    ellipse(gameChar_x+9,gameChar_y-1,13,5);
    
    //Body
    fill(0,0,255);
    rect(gameChar_x-10,gameChar_y-40,20,20);
    
    //right hand
    fill(222,184,135);
    ellipse(gameChar_x-15,gameChar_y-35,12,10);
    
    //left hand
    fill(222,184,135);
    ellipse(gameChar_x+15,gameChar_y-35,12,10);

    //Head
    fill(222,184,135);
    ellipse(gameChar_x,gameChar_y-50,20,20);
    fill(255,255,255);
    ellipse(gameChar_x-3,gameChar_y-49,3,4);
    ellipse(gameChar_x+3,gameChar_y-49,3,4);
    fill(0,0,0);
    ellipse(gameChar_x-2.5,gameChar_y-49,2,2);
    ellipse(gameChar_x+2.5,gameChar_y-49,2,2);
    rect(gameChar_x-2,gameChar_y-43,4,1);
    
    
    //hat
    stroke(1);
    fill(139,69,19);
    rect(gameChar_x-15,gameChar_y-56,30,4);
    quad(gameChar_x-5,gameChar_y-64,gameChar_x+5,gameChar_y-64,gameChar_x+9,gameChar_y-53,gameChar_x-9,gameChar_y-53);
    
    //left leg
    fill(0,0,0);
    rect(gameChar_x+2,gameChar_y-20,8,17);
    //right leg
    fill(0,0,0);
    rect(gameChar_x-10,gameChar_y-20,8,17);
}

function drawJumpingFacingForwards()
{
    //Shoes
    fill(139,69,19);
    ellipse(gameChar_x-9,gameChar_y-10,13,7);
    ellipse(gameChar_x+9,gameChar_y-10,13,7);
    
    //Body
    fill(0,0,255);
    rect(gameChar_x-10,gameChar_y-45,20,20);
    
    //right hand
    fill(222,184,135);
    ellipse(gameChar_x-11,gameChar_y-40,12,10);
    //left hand    
    fill(222,184,135);
    ellipse(gameChar_x+11,gameChar_y-40,12,10);
    
    //Head
    fill(222,184,135);
    ellipse(gameChar_x,gameChar_y-55,20,20);
    fill(255,255,255);
    ellipse(gameChar_x-3,gameChar_y-54,3,4);
    ellipse(gameChar_x+3,gameChar_y-54,3,4);
    fill(0,0,0);
    ellipse(gameChar_x-2.5,gameChar_y-54,2,2);
    ellipse(gameChar_x+2.5,gameChar_y-54,2,2);
    rect(gameChar_x-2,gameChar_y-49,4,1);
    
    //hat
    stroke(1);
    fill(139,69,19);
    rect(gameChar_x-15,gameChar_y-61,30,4);
    quad(gameChar_x-5,gameChar_y-68,gameChar_x+5,gameChar_y-68,gameChar_x+9,gameChar_y-57,gameChar_x-9,gameChar_y-57);
    
    //left leg
    fill(0,0,0);
    rect(gameChar_x+2,gameChar_y-24,8,15);
    //right leg
    fill(0,0,0);
    rect(gameChar_x-10,gameChar_y-24,8,15); 
}


function keyPressed()
{
    // if statements to control the animation of the character when
    // keys are pressed.

    if(isPlummeting){ //if isPlummeting then just return and do not react to any other keys
        return;
    }

    //open up the console to see how these work
    console.log("keyPressed: " + key);
    console.log("keyPressed: " + keyCode);

    if(keyCode == 37){
        console.log("left arrow");
        isLeft = true;
    }
    else if(keyCode == 39){
        console.log("right arrow");
        isRight = true;
    }

    else if(keyCode == 32){
        if(isFalling == false && gameChar_y == floorPos_y)
        {
            gameChar_y -= 98;
            jumpSound.play();

        }
    }
    if(isContact == true)
        if(keyCode == 32)
        {
            gameChar_y -= 98;
            jumpSound.play();
        }
}

function keyReleased()
{
    // if statements to control the animation of the character when
    // keys are released.

    console.log("keyReleased: " + key);
    console.log("keyReleased: " + keyCode);


    if(keyCode == 37){
        console.log("left arrow");
        isLeft = false;
    }else if(keyCode == 39){
        console.log("right arrow");
        isRight = false;
    }
}


function Enemy(x,y,range){

    this.x = x;
    this.y = y;
    this.range = range;

    this.currentX = x;
    this.inc = 1;

    //Adjust the side movement and restriction of enemies
    this.update = function(){
        this.currentX += this.inc;
        if(this.currentX > this.x + this.range){
            this.inc = -1;
        }
        else if(this.currentX < this.x){
            this.inc = 1;
        }
    }

    //Draw enemies
    this.draw = function(){
        this.update();
        fill(0,0,255);
        ellipse(this.currentX+3,this.y-10,30,25);
        triangle(this.currentX+30,this.y-4,this.currentX+25,this.y-12,this.currentX+12,this.y-2);
        fill(255,255,255);
        ellipse(this.currentX,this.y-14,8,10);
        fill(0,0,0);
        ellipse(this.currentX-2,this.y-13,5,5);
        fill(255,165,0);
        triangle(this.currentX-8,this.y-2,this.currentX-10,this.y-10,this.currentX-20,this.y-4);
        stroke(0);
        line(this.currentX+1,this.y+2,this.currentX-5,this.y+8);
        line(this.currentX+1,this.y,this.currentX,this.y+8);
        line(this.currentX+1,this.y+2,this.currentX+5,this.y+8);
        noStroke();
    }

    //To check if game character hit enemies
    this.checkContact = function(gc_x,gc_y){
        var d = dist(gc_x,gc_y,this.currentX,this.y);
        if(d<20){
            return true;
        }
        return false;
    }
}
