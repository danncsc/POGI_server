var player = require('./player.js').player;
var AIplayer = require('./AIcalc.js').AIBRAIN;
var bullet = require('./bullets.js').bullet;
var base = require('./base.js').base;
var team = require('./team.js').team;

var playerDeleteQuene = [];
var bulletDeleteQuene= [];
var baseDeleteQuene= [];
var teamDeleteQuene= [];

exports.game = function(){
    this.timeStamp = 0;
    this.gameStatus = 'wait';
    
    this.players = {};
    this.bullets = [];
    this.aiplayplay = [];
    
    this.forceToMove = false;
    
    this.bases = [
        new base(0 ,{x: 1500, y: 1500},500),
        new base(1 ,{x: -1500, y: -1500},500),
        new base(2 ,{x: 1500, y: -1500},500),
        new base(3 ,{x: -1500, y: 1500},500),
        
        new base(-1 ,{x: 700, y: 500},150),
        new base(-1 ,{x: -700, y: -500},150),
        new base(-1 ,{x: -700, y: 500},150),
        new base(-1 ,{x: 700, y: -500},150),
    ];
    
    this.teams = [
        new team('P',0,'#e62d2d'),
        new team('O',1,'#ffce00'),
        new team('G',2,'#48f71e'),
        new team('I',3,'#1ebaff'),
        new team('柴',4,'#000')
    ];
    
    this.getTeams = function(){
        return this.teams;
    }
    
    this.joinTeam = function(data){
        var avalibleTeams = [];
        var minNumPlayers = Infinity;
        for(i in this.teams){ //找到所有最少人數隊伍
            var thisTeam = this.teams[i];
            if(i!=4){
                var num = thisTeam.ids.length;
                if(num<=minNumPlayers) {
                    if(num<minNumPlayers){
                        avalibleTeams=[];
                        minNumPlayers=num;
                    }
                    avalibleTeams[avalibleTeams.length]=i;
                }
            }
        }
        
        var teamId = avalibleTeams[Math.floor(Math.random()*avalibleTeams.length)];
        
        var spawn = {x:0,y:0};
        
        this.teams[teamId].join(data);
        
        for(i in this.bases){
            if(this.bases[i].team==teamId){
                spawn.x=this.bases[i].position.x+Math.random()*10-5;
                spawn.y=this.bases[i].position.y+Math.random()*10-5;
            }
        }
        if(data.AI===true){
            this.players[data.id] = 
                new player(data.id, teamId, spawn,true);
        }else{
            this.players[data.id] = 
                new player(data.id, teamId, spawn,false);
        }
        return teamId;
    }
    
    this.update = function(){
        
        
        for(i in this.players){
            for(j in this.players) if(i!=j)this.players[i].collide(this.players[j]);
            for(j in this.bullets) this.players[i].collide(this.bullets[j]);
            for(j in this.bases) if(this.players[i].team != this.bases[j].team )this.players[i].collide(this.bases[j]);
            
            
        }
        
        for(i in this.bases){
            if(this.bases[i].size>1000){
                this.bases[i].size = 500;
                this.addBase(this.bases[i].team,{
                    x: this.bases[i].position.x + (Math.random()*100-50)*3,
                    y: this.bases[i].position.y + (Math.random()*100-50)*3
                },500);
            }
            
            this.bases[i].update();
            for(j in this.bases) if(i!=j) this.bases[i].collide(this.bases[j]);
            for(j in this.bullets) this.bases[i].collide(this.bullets[j]);
            this.bases[i].clearTargets();
            for(j in this.players) if(this.bases[i].team!=this.players[j].team) this.bases[i].findTarget(this.players[j]);
            for(j in this.bases) if(i!=j) if(this.bases[i].findTarget(this.bases[j]));
            var shoot = this.bases[i].shoot();
            if(shoot.shoot) {
                if(this.bases[i].team==4) this.addBullet(shoot.team, shoot.position, shoot.velocity, 50, 20);
                else this.addBullet(shoot.team, shoot.position, shoot.velocity, 200, 20);
            }
            
            if(this.bases[i].team!=-1){
                this.addFood(this.bases[i], this.bases[i].food());
            }
            if(this.bases[i].life<0) {
                delete this.bases[i];
                basesDeleteQuene.push(i);
                continue;
            }
        }
        
        for(i in this.players){
            this.players[i].update();
        }
        
        for(i in this.bullets) {
            
            for(j in this.bullets) {
                if(i!=j){
                    this.bullets[i].collide(this.bullets[j]);
                }
            }
            for(j in this.players) {
                if(this.bullets[i].team!=this.players[j].team){
                    this.bullets[i].collide(this.players[j]);
                }
            }
            for(j in this.bases) this.bullets[i].collide(this.bases[j]);
            this.bullets[i].update();
            if(this.bullets[i].life<0) {
                delete this.bullets[i];
                bulletDeleteQuene.push(i);
                continue;
            }
        }
        
        
        
        
        
        return false;
    }
    
    this.addBullet = function (team, position, velocity, life, size) {
        var newBullet = new bullet(team, position, velocity, life, size);
        this.bullets[newBullet.id] = newBullet;
    }
    
    this.addBase = function (team, position, size) {
        var newBase = new base(team, position, size);
        this.bases[newBase.id] = newBase;
    }
    
    this.addFood = function (object, amount){
        if(amount>0){
            var position = object.position;
            var size = object.size*0.5+100;
            var angle = Math.random()*Math.PI*2;
            for(var i=0;i<amount;i++){
                this.addBullet(-1,{
                    x: position.x + Math.cos(angle)*size,
                    y: position.y + Math.sin(angle)*size
                }, {x: 0, y: 0}, 150, 1);
                angle += Math.PI*2/amount;
            }
        }
    }
    
    this.reset = function(){
        this.forceToMove = true;
        
        this.bullets = [];
        this.timeStamp = 0;
        this.bullets = [];
        this.aiplayplay = [];
        this.bases = [
            new base(0 ,{x: 1500, y: 1500},500),
            new base(1 ,{x: -1500, y: -1500},500),
            new base(2 ,{x: 1500, y: -1500},500),
            new base(3 ,{x: -1500, y: 1500},500),

            new base(-1 ,{x: 700, y: 500},150),
            new base(-1 ,{x: -700, y: -500},150),
            new base(-1 ,{x: -700, y: 500},150),
            new base(-1 ,{x: 700, y: -500},150),
        ];
        this.teams = [];
        this.teams = [
            new team('P',0,'#e62d2d'),
            new team('O',1,'#ffce00'),
            new team('G',2,'#48f71e'),
            new team('I',3,'#1ebaff'),
            new team('柴',4,'#000')
        ];
        
        for(i in this.players){
            var me = this.players[i];
            var avalibleTeams = [];
            var minNumPlayers = Infinity;
            for(i in this.teams){ //找到所有最少人數隊伍
                var thisTeam = this.teams[i];
                if(i!=4){
                    var num = thisTeam.ids.length;
                    if(num<=minNumPlayers) {
                        if(num<minNumPlayers){
                            avalibleTeams=[];
                            minNumPlayers=num;
                        }
                        avalibleTeams[avalibleTeams.length]=i;
                    }
                }
            }
            var teamId = avalibleTeams[Math.floor(Math.random()*avalibleTeams.length)];
            var spawn = {x:0,y:0};
            for(i in this.bases){
                if(this.bases[i].team==teamId){
                    spawn.x=this.bases[i].position.x+Math.random()*10-5;
                    spawn.y=this.bases[i].position.y+Math.random()*10-5;
                }
            }
            this.teams[me.team].join(i);
            me.respawn(teamId, spawn);
        }
    }
    
    this.simData = function(){
        var simPlayers = {};
        var simBullets = {};
        var simBases = {};
        var simTeams = {};
        for(i in this.players) simPlayers[i] = this.players[i].simData();
        for(i in this.bullets) simBullets[i] = this.bullets[i].simData();
        for(i in this.bases) simBases[i] = this.bases[i].simData();
        for(i in this.teams) simTeams[i] = this.teams[i].simData();
        var playerDelete = playerDeleteQuene;
        var bulletDelete = bulletDeleteQuene;
        var baseDelete = baseDeleteQuene;
        var teamDelete = teamDeleteQuene;
        playerDeleteQuene = [];
        bulletDeleteQuene= [];
        baseDeleteQuene= [];
        teamDeleteQuene= [];
        return {
            players: simPlayers,
            bullets: simBullets,
            bases: simBases,
            teams: simTeams,
            dplayers: playerDelete,
            dbullets: bulletDelete,
            dbases: baseDelete,
            dteams: teamDelete,
        };
    }
    
    this.AImove = function(){
        for(i in this.players){
            if(this.players[i]!=undefined&&this.players[i].AI){
                if(this.aiplayplay[i]==undefined){
                    this.aiplayplay[i] = new (require('./AIcalc.js').AIBRAIN)();
                }
                var aimen = new player('default',-1,{x:0,y:0},true);
                aimen = this.players[i];
                var gamesnap = this;
                var aisays = this.aiplayplay[i].calc(aimen,this);
                aimen.move(aisays);
                if(aimen!=undefined&&aimen.numBullets>0&&aisays.shoot!=false){
                    if(aimen.size>500) this.addBullet(aimen.team, aisays.shoot.from, aisays.shoot.speed, 100, 100);
                    else this.addBullet(aimen.team, aisays.shoot.from, aisays.shoot.speed, 100, 20);
                    aimen.numBullets--;
                }
                delete aimen;
            }
        }
    }
    return false;
}