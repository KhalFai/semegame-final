var socket = io();
var c = document.getElementById('canvas');
c.width = 2000;
c.height = 1000;
var ctx = c.getContext('2d');

//aux variables
var pointdata=0;

var mapdata;
var playerdata;
var enemydata;

var CameraX;
var CameraY;

var maxplayer;
var maxwall;
var maxenemy;
//input + key registers
class Input {
  constructor(){
    this.uparrow = false;
    this.downarrow = false;
    this.leftarrow = false;
    this.rightarrow = false;
    this.shootleft = false;
    this.shootright = false;
    this.shootup = false;
    this.shootdown = false;
  }
}

var input = new Input();

//image libraries for players, guns, bullets, enemies and walls, implement skins to make it seem like a feature and not a lazy copout
var playerImage = new Image();
playerImage.src = "/static/player.png";

var enemyImage = new Image();
enemyImage.src = "/static/enemy.png";

var bulletImage = new Image();
bulletImage.src = "/static/bullet.png";

var gunImage = new Image();
gunImage.src = "/static/gun.png";

var wallImage = new Image();
wallImage.src = "/static/wall.png";


//make cool new pngs, use a gif library for animated sprites, wrap those into inputs


document.addEventListener("keydown", function () {
  if (event.keyCode == 87) {input.uparrow = true;}
  if (event.keyCode == 83) {input.downarrow = true;}
  if (event.keyCode == 68) {input.rightarrow = true;}
  if (event.keyCode == 65) {input.leftarrow = true;}
})

document.addEventListener("keyup", function () {
  if (event.keyCode == 87) input.uparrow = false;
  if (event.keyCode == 83) input.downarrow = false;
  if (event.keyCode == 68) input.rightarrow = false;
  if (event.keyCode == 65) input.leftarrow = false;
})

document.addEventListener("keypress", function () {
  if (event.keyCode == 73+32) input.shootup = true;
  if (event.keyCode == 74+32) input.shootleft = true;
  if (event.keyCode == 76+32) input.shootright = true;
  if (event.keyCode == 75+32) input.shootdown = true;
})

socket.emit('new player');

socket.on('walls',function(wall){
  mapdata = wall;
})

//camera
socket.on('camera',function(camera){
  if (camera != undefined) {
  CameraX = -camera.x;
  CameraY = -camera.y;
  CameraX= Number(CameraX) + Number(c.width/2);
  CameraY= Number(CameraY) + Number(c.height/2);
  }
})

socket.on('maxplayer',function(mp){
  maxplayer = mp;
})

//draw enemies and players
socket.on('players',function(player){
  playerdata = player;
})

socket.on('enemies',function(enemy){
  enemydata = enemy;
})

socket.on("points",function(points){
  pointdata = points;
})

socket.on('bullets',function(bullet){
  ctx.save();
  ctx.translate(CameraX,CameraY); 
  ctx.drawImage(bulletImage, bullet.x, bullet.y);
  ctx.restore();
})

setInterval(function() {
  socket.emit('input', input);
  input.shootdown = false;
  input.shootup = false;
  input.shootleft = false;
  input.shootright = false;

  ctx.clearRect(0, 0, c.width, c.height);
  ctx.save();
  ctx.translate(CameraX,CameraY); 
  if (mapdata != undefined) {
  for (let k=0;k<960;k++) { //3=maxwall in server.js
    ctx.drawImage(wallImage,mapdata[k].x,mapdata[k].y);
  }
  }
  if (playerdata != undefined) {
  for (let i=0;i<maxplayer;i++) { //3=maxplayer in server.js
    ctx.drawImage(playerImage,playerdata[i].x,playerdata[i].y);
    ctx.drawImage(gunImage,playerdata[i].gun.x,playerdata[i].gun.y);
    ctx.fillStyle = "orange";
    ctx.font = "30px Consolas";
    if (pointdata != undefined) {
    ctx.fillText(pointdata, playerdata[i].x+5, playerdata[i].y-15);
    }
  }
  }

  if (enemydata != undefined){
  for (let j=0;j<5;j++) { //3=maxenemy in server.js
    ctx.drawImage(enemyImage,enemydata[j].x,enemydata[j].y);
  }
  }
  ctx.restore();
}, 1000 / 60);

//create objects to store image variables, independent of the server data, draw those at recieved coordinates
