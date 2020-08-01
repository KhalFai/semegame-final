/*
Project notes:
  -remove comments, limit bullet count, make really basic game stuff (death puts you to 0 0 etc.)
  -in game.js draw various floor textures on fixed points
  -redraw sprites to resemble a victorian london rooftop, upon which smoke demons are being fought by victorian era lads
*/
// Dependencies.
var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

app.set('port', 5000);
app.use('/static', express.static(__dirname + '/static'));

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(5000, function() {
  console.log('Starting server on port 5000');
});
//VARIABLES
var points=0;

class Player {
  constructor() {
    //ANIMATION STATE
    //DEFAULT VALUES
    this.x = 32*4;
    this.y = 32*2;
    //INVENTORY
    this.gun = new Gun();
  }

  move_left(speed){this.x-=speed};
  move_right(speed){this.x+=speed};
  move_up(speed){this.y-=speed};
  move_down(speed){this.y+=speed};

  collision(entity) {
  if (this.x < entity.x + 32 && this.x + 32 > entity.x && this.y < entity.y+32 && this.y + 32 > entity.y) {
    if (entity.constructor.name == "Wall") {
      if (this.y > entity.y) this.y+=10;
      if (this.y < entity.y) this.y-=10;
      if (this.x < entity.x) this.x-=10;
      if (this.x > entity.x) this.x+=10;
    }
    if (entity.constructor.name == "Enemy") {
      points=0;
      this.x = 32*4;
      this.y = 32*2;
      entity.x = entity.spawnx;
      entity.y = entity.spawny;
    }
  }
  }

}

class Bullet {
  constructor(){
    this.x = 0;
    this.y = 0;
    this.dissapate = 20;
  }

  collision(entity) {
  if (this.x < entity.x + 32 && this.x + 32 > entity.x && this.y < entity.y+32 && this.y + 32 > entity.y){
      if (entity.constructor.name == "Enemy") {
        entity.health-=5;
        this.x=undefined;
        this.y=undefined;
      }
  }
  }
}

class Gun {
  constructor(){
    this.x = 0;
    this.y = 0;
    this.equipped = true;
  }
  behavior(equippedplayer){
    if (this.equipped == true) {
      this.x = equippedplayer.x;
      this.y = equippedplayer.y;
    }
  }
  fire(direction,shootplayer,enemytable,maxenemy){
    let currentbullet = new Bullet();
    currentbullet.x = shootplayer.x;
    currentbullet.y = shootplayer.y;
    let i=currentbullet.dissapate;

    let interval = setInterval(function(){
        if (direction == "left") currentbullet.x-=10;
        if (direction == "right") currentbullet.x+=10;
        if (direction == "up") currentbullet.y-=10;
        if (direction == "down") currentbullet.y+=10;
        for (let j=0;j<maxenemy;j++) {
        currentbullet.collision(enemy[j]);
        }
        io.sockets.emit("bullets",currentbullet);
        i--;
        if (i == 0) clearInterval(interval);
        }, 1000/60)
    }
  }

class Enemy {
  constructor(){
    this.spawnx = 0;
    this.spawny = 0;
    this.x=this.spawnx;
    this.y=this.spawny;
    this.health = 15;
    this.alive = true;
  }
  collision(entity) {
  if (this.x < entity.x + 32 && this.x + 32 > entity.x && this.y < entity.y+32 && this.y + 32 > entity.y) {
  };
}
  behavior(player_target){
    for (let i=0;i<socketcounter;i++) {
    if (this.x < sendplayer[i].x + 960 && this.x + 960 > sendplayer[i].x && this.y < sendplayer[i].y+960 && this.y + 960 > sendplayer[i].y) player_target = sendplayer[i];
  }
    if (this.y > player_target.y) this.y-=1;
    if (this.y < player_target.y) this.y+=1;
    if (this.x < player_target.x) this.x+=1;
    if (this.x > player_target.x) this.x-=1;
    if (this.health <= 0) {
      let randdir;
      randdir = (Math.floor(Math.random() * 4) + 1);
      if (randdir == 1){
        this.x = player_target.x+(Math.floor(Math.random() * 230) + 180);
        this.y = player_target.y+(Math.floor(Math.random() * 230) + 180);
      }//left
      if (randdir == 2){
        this.x = player_target.x+(Math.floor(Math.random() * 230) + 180);
        this.y = player_target.y-(Math.floor(Math.random() * 230) + 180);
      }//right
      if (randdir == 3){
        this.x = player_target.x-(Math.floor(Math.random() * 230) + 180);
        this.y = player_target.y+(Math.floor(Math.random() * 230) + 180);
      }//up
      if (randdir == 4){
        this.x = player_target.x-(Math.floor(Math.random() * 230) + 180);
        this.y = player_target.y-(Math.floor(Math.random() * 230) + 180);
      }//down
      points+=1;
      this.health=15;
    }
  }
}
//bool that kills enemy, figure it out 
class Wall {
  constructor(){
  this.x = 0;
  this.y = 0;
  } 
}

//SERVER CODE
var socketcounter = 0;

var maxplayer = 1;
var player = [];
var sendplayer = [];

var maxenemy = 5;
var enemy = [];

enemy[0] = new Enemy();
enemy[0].spawnx=32*29;
enemy[0].spawny=32*2;
enemy[0].x=32*29;
enemy[0].y=32*2;

enemy[1] = new Enemy();
enemy[1].spawnx=32*3;
enemy[1].spawny=32*13;
enemy[1].x=32*3;
enemy[1].y=32*13;

enemy[2] = new Enemy();
enemy[2].spawnx=32*10;
enemy[2].spawny=32*21;
enemy[2].x=32*21;
enemy[2].y=32*3;

enemy[3] = new Enemy();
enemy[3].spawnx=32*23;
enemy[3].spawny=32*29;
enemy[3].x=32*27;
enemy[3].y=32*14;

enemy[4] = new Enemy();
enemy[4].spawnx=32*11;
enemy[4].spawny=32*23;
enemy[4].x=32*11;
enemy[4].y=32*23;

//MAP DATA, check mapplan.png


var maxwall = 960;
var wall = [];

//var mapstring = "###############################---#------------------------##----#####------#------------#-#--------#------------####--#-#---------#---------#-------#-#---------#-----------------##----------#-----------------##----------#-----------------##----------#-------------#---##----------#-----------------##-----------#----------------###-----------#--#----##------####-----------##-------------##--######--------------------##----------------------------##-----------SS---------------##-----------SS---------------##----------------------------##------------------#---------##-----------------#---#------##--------------------#-#-----##-------------------#---#----##--------------#---------#---##-------------#-----------#--##----------------#---------#-##---------------#-----------###--------------#-------------##---------------#------------##----------------#-----------##-----------------#----------###############################";
//var mapstring = "-----------------------------------------------------------------######-----------------------#------#-----------####-------#------#----------#----#------#------#----------#----#------#------#----------#----#------------------------------------------------------------------------------------------------------###------------------------------####----##-------------------------------------------------------------------------------------------------------------SS----------------------------SS------------------------------------------------------------------------------#-------------------#----------------#-----------#-#--------------------------#---#-------#----------------------#------------------------------#---#---------#------#---------#------------------#-----------##-----#---------#-------------#----------------#------------#-#---------------#-----------#--------#---------#----------#--#---------------############";
var mapstring = "#########---------------------#-------#----------------#----#-------#---------------------##-----##--------------------------------------#-----------------------------------------------------------------#--------------------------------------------------------------------------------#------------------------------------------------------------------------------------------#--------------------------------------------------------------------#----------------#--------------------------------------------------------------------------------------------------#--------------------#-------------------------------------------------------#------------------#----------------------------------#-------------------#-------------------------------------------#----------------------------------------#----------------------#--------------------------------------------#-----";
for (let i=0;i<maxwall;i++){
  wall[i] = new Wall();
  if (mapstring.charAt(i) == "#") {
  wall[i].x =(i%30)*32;
  wall[i].y =Math.floor((i/30))*32;
  } else {
  wall[i].x = 0;
  wall[i].y = 0;
  }
}

io.on('connection', function(socket) {
  //GENERATE PLAYERS
  socket.on('new player', function() {
    player[socket.id] = new Player();
    sendplayer[socketcounter] = player[socket.id];
    socketcounter++;
    io.sockets.emit("maxplayer",socketcounter);
    socket.emit("walls",wall);
  });
  //RECIEVE INPUT
  socket.on('input',function(input){
    if (input.uparrow == true) {
      player[socket.id].move_up(5);
    }
    if (input.leftarrow == true) {
      player[socket.id].move_left(5);
    }
    if (input.rightarrow == true) {
      player[socket.id].move_right(5);
    }
    if (input.downarrow == true) {
      player[socket.id].move_down(5);
    }
    if (input.shootright == true) {
      player[socket.id].gun.fire("right",player[socket.id],enemy,maxenemy);
    }
    if (input.shootleft == true) {
      player[socket.id].gun.fire("left",player[socket.id],enemy,maxenemy);
    }
    if (input.shootup == true) {
      player[socket.id].gun.fire("up",player[socket.id],enemy,maxenemy);
    }
    if (input.shootdown == true) {
      player[socket.id].gun.fire("down",player[socket.id],enemy,maxenemy);
    }
  }
  )
  setInterval(function(){
    socket.emit("camera", player[socket.id]);
    io.sockets.emit("players",sendplayer);
    socket.emit("points",points);
    io.sockets.emit("enemies",enemy);
    for (let i=0;i<socketcounter;i++) {
      sendplayer[i].gun.behavior(sendplayer[i]);
      for(let j=0;j<maxwall;j++)sendplayer[i].collision(wall[j]);
      for(let h=0;h<maxenemy;h++)sendplayer[i].collision(enemy[h]);
    }
    for (let j=0;j<maxenemy;j++) {
    enemy[j].behavior(sendplayer);
  }
  },1000/60)
});