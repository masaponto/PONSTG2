
enchant();

window.onload = function () {

    game = new Game(320, 320);
    game.fps = 24;

    game.score = 0;
    game.touched = false;

    game.preload('chara.png', 'enemy.png', 'explotion.png');

    game.onload = function () {
        player = new Player(game.width/2 - 16, game.height - 40);
	enemies = new Array();
	scoreLabel = new ScoreLabel(8, 8);

        game.rootScene.backgroundColor = 'lightblue';

        game.rootScene.addEventListener('enterframe', function () {

            if(game.frame % 15 == 0) {
		var x = rand(320 - 32);
                var enemy = new Enemy(x, 0, 3);
                enemy.key = game.frame;
                enemies[game.frame] = enemy;
            }
            scoreLabel.score = game.score;
        });

        game.rootScene.addChild(scoreLabel);
    };
    game.start();
};


function rand(n) {
    return Math.floor(Math.random() * (n+1));
}

var Player = enchant.Class.create(enchant.Sprite, {

    initialize: function (x, y) {

        enchant.Sprite.call(this, 32, 32);

        this.image = game.assets['chara.png'];
        this.x = x;
        this.y = y;
        this.frame = 0;

        game.rootScene.addEventListener('touchstart', function (e) {
            player.x = e.x - player.width/2;
	    player.y = e.y - player.height;
	    game.touched = true;
        });

	game.rootScene.addEventListener('touchmove', function (e) {
            player.x = e.x - player.width/2;
	    player.y = e.y - player.height;
        });

	game.rootScene.addEventListener('touchend', function (e) {
            player.x = e.x - player.width/2;
	    player.y = e.y - player.height;
            game.touched = false;
        });


        this.addEventListener('enterframe', function () {
            if(game.touched && game.frame % 8 == 0) {
                var s = new PlayerShoot(this.x, this.y);
            }
        });

        game.rootScene.addChild(this);
    }
});

var Enemy = enchant.Class.create(enchant.Sprite, {

    initialize: function (x, y, moveSpeed) {

	enchant.Sprite.call(this, 32, 32);

	this.image = game.assets['enemy.png'];
        this.x = x;
        this.y = y;
        this.moveSpeed = moveSpeed;

        this.addEventListener('enterframe', function () {

            this.move();
            this.frame = this.age % 3;

	    this.playerX = player.x;
	    this.playerY = player.y;

	    if(this.y > 320 || this.x > 320 || this.x < 0 || this.y < 0) {
                this.remove();
            } else if(this.age % 20 == 0) {
                var s = new EnemyShoot(this.x, this.y, this.playerX, this.playerY);
            }

	    if(player.within(this, 8)) {
                explo = new Explotion(this.x, this.y);
		//game.end(game.score, "SCORE: " + game.score)
		changeToGameOverScene();
	    }

	});

	game.rootScene.addChild(this);

    },

    move: function () {
	this.y += this.moveSpeed;
    },

    remove: function () {
        game.rootScene.removeChild(this);
        delete enemies[this.key];
    }

});


var Shoot = enchant.Class.create(enchant.Sprite, {

    initialize: function (x, y, direction, color) {

        enchant.Sprite.call(this, 32, 32);

	var surf = new Surface(32, 32);
	surf.context.beginPath();
	surf.context.arc(16, 16, 4, 0, Math.PI*2, false);

	if(color == 1) {
	    surf.context.fillStyle = 'rgba(192, 0, 10, 0.8)';
	} else {
	    surf.context.fillStyle = 'rgba(0, 0, 0, 1)';
	}

	surf.context.fill();

	this.image = surf;
        this.x = x;
        this.y = y;
        this.frame = 1;
        this.direction = direction;
        this.moveSpeed = 8;

	this.addEventListener('enterframe', function () {

	    this.x += this.moveSpeed * Math.cos(this.direction);
            this.y += this.moveSpeed * Math.sin(this.direction);

	    if(this.y > 320 || this.x > 320 || this.x < 0 || this.y < 0 ) {
                this.remove();
            }

        });

	game.rootScene.addChild(this);

    },

    remove: function () {
        game.rootScene.removeChild(this);
        delete this;
    }

});


var PlayerShoot = enchant.Class.create(Shoot, {
    initialize: function (x, y) {

	Shoot.call(this, x, y, Math.PI * 3/2, 2);

	this.addEventListener('enterframe', function () {
	    for (var i in enemies) {
		if(enemies[i].intersect(this)) {
                    explo = new Explotion(enemies[i].x, enemies[i].y);
		    this.remove();
                    enemies[i].remove();
                    game.score += 1;
                }
	    }
	});
    }
});


var EnemyShoot = enchant.Class.create(Shoot, {
    initialize: function (x, y, playerX, playerY) {

	Shoot.call(this, x, y, Math.atan2(playerY - y, playerX - x), 1);

	this.addEventListener('enterframe', function () {
	    if(player.within(this, 8)) {
                explo = new Explotion(player.x, player.y);
		changeToGameOverScene();
	    }
        });
    }
});


var Explotion = enchant.Class.create(enchant.Sprite, {
    initialize : function (x, y) {

	enchant.Sprite.call(this, 120, 120);

	this.image = game.assets['explotion.png'];
        this.x = x - this.width/2 + 16;
        this.y = y - this.height/2;

	this.addEventListener('enterframe', function () {
            if(this.age % 2 == 0) {
                this.frame += 1;
            }
	    if(this.frame == 10) {
		this.remove();
	    }
        });

	game.rootScene.addChild(this);
    }
});

var changeToGameOverScene = function() {

    var scene = new Scene();
    scene.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    game.replaceScene(scene);

    var gameOverSprite = new Sprite(189,97);
    gameOverSprite.image = game.assets['end.png'];
    gameOverSprite.moveTo((scene.width - gameOverSprite.width)/2, (scene.height - gameOverSprite.height)/2);
    scene.addChild( gameOverSprite);

    var tweetButton = new Button("Tweet", "blue");
    tweetButton.moveTo( scene.width / 2 - 30, (scene.height - gameOverSprite.height)/2 + 120);
    tweetButton.addEventListener(enchant.Event.TOUCH_START, function(){
        var EUC = encodeURIComponent;
        var twitter_url = "http://twitter.com/?status=";
        var message = "PLAYED PON-SHOOTING!\nSCORE:" + game.score + " #PON_SHOOTING2";
        location.href = twitter_url+ EUC(message);
    });
    scene.addChild(tweetButton);

}
