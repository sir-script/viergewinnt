window.requestAnimFrame = (function(callback){
	return window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback){
		window.setTimeout(callback, 1000 / 60);
	};
})();

window.hasStopped = true;
/*	
function cancel() {
	var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
	cancelAnimationFrame(animationFrame); 
	window.animationFrame=undefined;
}	
*/

function animate(lastTime, coin, canvasElem){
	if(!coin.stopAnimation){
		window.hasStopped = false;
		if(!coin.timeoutSet){
			setTimeout(function(){
				coin.stopAnimation = true;
				window.hasStopped = true;
				
				if(canvasElem.your_turn==true){
					canvasElem.clearCircles(canvasElem.ctxField, canvasElem.columnToPosition(canvasElem.coinpreview), 50);
					canvasElem.coinpreview = canvasElem.column;
					canvasElem.drawCircle(canvasElem.columnToPosition(canvasElem.column), canvasElem.rowToPosition(-1), canvasElem.radius);
				}
				//$(canvasElem.gameFieldLayer).trigger('mousemove');
				canvasElem.column=canvasElem.last_column;
				canvasElem.updateCoinColumn();
			}, 2300);
			coin.timeoutSet = true;
		}
	
		var stage = coin.getStage();
		var layer = coin.getLayer();
		var date = new Date();
		var time = date.getTime();
		var timeDiff = time - lastTime;
		
		// update
		updateCoin(timeDiff, coin, canvasElem);

		// draw
		layer.draw();
		
		// request new frame
		window.animationFrame = requestAnimFrame(function(){
			animate(time, coin, canvasElem);
		});
	}	
}

function updateCoin(timeDiff, coin, canvasElem){
	
	var row = canvasElem.row;
	var stage = coin.getStage();
	var coinX = coin.x;
	var coinY = coin.y;

	// physics variables
	var gravity = 50; // px / second^2
	var speedIncrementFromGravityEachFrame = gravity * timeDiff / 1000;
	var collisionDamper = 0.2; // 20% energy loss
	var floorFriction = 5; // px / second^2
	var floorFrictionSpeedReduction = floorFriction * timeDiff / 1000;

	// gravity
	coin.vy += speedIncrementFromGravityEachFrame;
	coinY += coin.vy;

	// ceiling condition
	if (coinY < coin.radius) {
		coinY = coin.radius;
		coin.vy *= -1;
		coin.vy *= (1 - collisionDamper);
	}
	// floor condition
	if (coinY > (stage.height - coin.radius - (660-canvasElem.rowToPosition(row)))) {
		coinY = stage.height - coin.radius  - (660-canvasElem.rowToPosition(row));
		coin.vy *= -0.5;
		coin.vy *= (1 - collisionDamper);
	}

	coin.setPosition(coinX, coinY);
}