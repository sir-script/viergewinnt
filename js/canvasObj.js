function canvasObj( width, height, socket, your_turn ) {
    //init settings

    this.width = width;
    this.height = height;
    this.your_turn = your_turn;
    this.content = "";
    this.field;

    this.gameFieldLayer;
    this.ctxField;
    this.coinsStage;
    this.coinsLayer;
    this.clickEvents;
    this.radius = 40;
    this.column = "";
    this.row = "";
    this.coinPreview = "";

    this.highest_layer = 0;
    this.player_one_color = "orange";
    this.player_two_color = "green";

    this.init();
    this.createArray();
    this.createField();
    this.initEvents();
    //this.first = true;

    this.last_column = 0;

    this.socket = socket;
};
canvasObj.prototype = {
    init:              function() {
        this.gameFieldLayer = document.getElementById( "gameFieldLayer" );//this is the layer in front of the coinsLayer
        this.ctxField = gameFieldLayer.getContext( "2d" );

        /*this.coinsLayer = document.getElementById("coinsLayer");
         this.ctxCoins = coinsLayer.getContext("2d");*/
        this.coinsStage = new Kinetic.Stage( "container", 700, 700 );
        this.coinsLayer = new Kinetic.Layer();

    },
    createArray:       function() {
        var i;
        this.field = new Array( this.width );
        for( i = 0; i < this.field.length; i += 1 ) {
            this.field[i] = new Array( this.height );
        }
    },
    roundCornersField: function( ctx, x, y, width, height, radius, fill, stroke ) {
        if( stroke === "undefined" ) {
            stroke = false;
        }
        if( stroke ) {
            ctx.stroke();
        }
        if( radius === "undefined" ) {
            radius = 16;
        }
        if( fill === "undefined" ) {
            ctx.fillStyle = fill;
        }
        ctx.beginPath();
        ctx.moveTo( x + radius, y );
        ctx.lineTo( x + width - radius, y );
        ctx.quadraticCurveTo( x + width, y, x + width, y + radius );
        ctx.lineTo( x + width, y + height - radius );
        ctx.quadraticCurveTo( x + width, y + height, x + width - radius, y + height );
        ctx.lineTo( x + radius, y + height );
        ctx.quadraticCurveTo( x, y + height, x, y + height - radius );
        ctx.lineTo( x, y + radius );
        ctx.quadraticCurveTo( x, y, x + radius, y );
        ctx.closePath();

        ctx.fillStyle = fill;
        ctx.fill();
    },
    createField:       function() {

        var my_gradient = this.ctxField.createLinearGradient( 0, 0, 700, 700 );
        var i, j, x, y;
        my_gradient.addColorStop( 0, "blue" );
        my_gradient.addColorStop( 1, "black" );
        this.roundCornersField( this.ctxField, 0, 100, 700, 600, 16, my_gradient );

        //clearing circles
        this.ctxField.fillStyle = "#FF1C0A";
        for( y = 100; y < 700; y = y + 100 ) {
            for( x = 0; x < 700; x = x + 100 ) {
                this.clearCircles( this.ctxField, x + 50, y + 50 );
            }
        }

        //filling array also
        for( j = 0; j < this.height; j += 1 ) {
            for( i = 0; i < this.width; i += 1 ) {
                //default value of a field
                this.field[j][i] = this.content;
            }
        }
    },
    initEvents:        function() {

        var thisElem = this;

        //mousemoveEvent
        $( this.gameFieldLayer ).mousemove( function( e ) {
            thisElem.CoinColumnPreview( e );
        } );

        //when clicked on canvas
        this.gameFieldLayer.addEventListener( "click", this.clickEvents.bind( this ), false );

    },
    getColumn:         function( e ) {
        var x;
        if( e.pageX != undefined ) {
            x = e.pageX;
        }
        else {
            x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        }
        x -= $( this.gameFieldLayer ).offset().left;
        this.column = (Math.floor( x / 100 ));
    },
    getRow:            function( e ) {
        var y;
        if( e.pageY != undefined ) {
            y = e.pageY;
        }
        else {
            y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        y -= $( this.gameFieldLayer ).offset().top;
        this.row = (Math.floor( y / 100 ));
    },
    columnToPosition:  function( column ) {
        return ((column * 100) + 50);
    },
    rowToPosition:     function( row ) {
        return ((row * 100) + 150);
    },
    updateCoinColumn:  function() {
        if( this.coinpreview != this.column ) {
            this.last_column = this.column;
            this.clearCircles( this.ctxField, this.columnToPosition( this.coinpreview ), 50 );
            this.coinpreview = this.column;
            if( this.your_turn == true ) {

                this.drawCircle( this.columnToPosition( this.column ), this.rowToPosition( -1 ), this.radius );
            }
        }

    },
    CoinColumnPreview: function( e ) {
        this.getColumn( e );
        this.updateCoinColumn();

    },

    clickEvents:        function( e ) {
        if( window.hasStopped == true ) {
            if( this.field[0][this.column] != "" ) {
                //alert("field full");
                window.PopUp.showWinMessage( "field full" );
            }
            else {
                this.socket.emit( 'check_myturn', this.column );
                this.getColumn( e );
            }
        }
    },
    clearCircles:       function( ctx, x, y ) {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc( x, y, this.radius + 1, 0, 2 * Math.PI, false );
        ctx.fill();
        ctx.restore();
    },
    drawCircle:         function( xPos, yPos, radius ) {

        var my_gradient = this.ctxField.createLinearGradient( this.columnToPosition( this.column ), 100, (this.columnToPosition( this.column ) + this.radius), 100 );
        if( this.your_turn ) {
            this.content = this.player_one_color;
        }
        else {
            this.content = this.player_two_color;
        }
        my_gradient.addColorStop( 0, this.content );
        my_gradient.addColorStop( 1, "black" );
        this.ctxField.fillStyle = my_gradient;

        this.ctxField.beginPath();
        this.ctxField.arc( xPos, yPos, radius, 0, Math.PI * 2, false );
        this.ctxField.closePath();
        this.ctxField.fill();
    },
    insertCoin:         function( column ) {
        var i, j;
        if( isNaN( column ) ) {
            alert( "NaN" );
            return;
        }
        var full = true;
        for( i = 0; i < this.width; i += 1 ) {
            if( this.field[0][column] == "" ) {
                full = false;
            }
        }
        if( full ) {
            window.PopUp.showWinMessage( "field full" );
        }
        if( this.field[0][column] != "" ) {
            //alert("field full");
            //socket.emit("field_full",true);
            //window.PopUp.showWinMessage("field full");
            return;
        }
        this.column = column;

        if( this.your_turn == true ) {
            this.clearCircles( this.ctxField, this.columnToPosition( this.coinpreview ), 50 );
            this.coinpreview = this.column;
        }

        //canvasElem.drawCircle(canvasElem.columnToPosition(canvasElem.column), canvasElem.rowToPosition(-1), canvasElem.radius);

        for( j = this.height - 1; j >= 0; j -= 1 ) {
            if( this.field[j][column] == "" ) {
                if( this.your_turn ) {
                    this.content = this.player_one_color;
                }
                else {
                    this.content = this.player_two_color;
                }
                this.field[j][column] = this.content;

                this.row = j;
                //this.drawCircle(this.columnToPosition(column), this.rowToPosition(j), this.radius);
                this.coinAnimation();

                //this.drawCircle(this.columnToPosition(column), this.rowToPosition(j), this.radius);
                if( (this.height - 1 - j) > this.highest_layer ) {
                    this.highest_layer = (this.height - 1 - j);
                }

                break;
            }
        }

        for( j = 0; j < this.height; j += 1 ) {
            for( i = 0; i < this.width; i += 1 ) {
                this.hasWon( j, i );
            }
        }
        this.your_turn = !this.your_turn;
    },
    hasWon:             function( y, x ) {

        if( this.field[y][x] == "" ) {
            return;
        }

        var field_content = this.field[y][x];
        //alert(field_content);
        if( this.checkRow( y, x, field_content ) ) {
            //draw the 4 winning stones big again
            var i;
            for( i = x; i < x + 4; i++ ) {
                console.log( "gewonnene Steine: ", i, " ", y );
                this.drawCircle( this.columnToPosition( i ), this.rowToPosition( y ), this.radius + 8 );

                this.ctxField.beginPath();
                this.ctxField.lineWidth = 20;
                this.ctxField.moveTo( this.columnToPosition( i ) - 50, this.rowToPosition( y ) );
                this.ctxField.lineTo( this.columnToPosition( i ) + 50, this.rowToPosition( y ) );
                this.ctxField.strokeStyle = "red";
                this.ctxField.stroke();

            }

            window.PopUp.showWinMessage( "won" );
        }

        if( this.checkColumn( y, x, field_content ) ) {
            //draw the 4 winning stones big again
            var i;
            for( i = y - 3; i <= y; i++ ) {
                console.log( "gewonnene Steine: ", x, " ", i );
                this.drawCircle( this.columnToPosition( x ), this.rowToPosition( i ), this.radius + 8 );
                this.ctxField.beginPath();
                this.ctxField.lineWidth = 20;
                this.ctxField.moveTo( this.columnToPosition( x ), this.rowToPosition( i ) - 50 );
                this.ctxField.lineTo( this.columnToPosition( x ), this.rowToPosition( i ) + 50 );
                this.ctxField.strokeStyle = "red";
                this.ctxField.stroke();

            }

            window.PopUp.showWinMessage( "won" );
        }

        if( this.checkRightDiagonal( y, x, field_content ) ) {
            //draw the 4 winning stones big again
            /*y=y-3;
             while(y<=)){
             console.log("gewonnene Steine: ", x, " ", i);
             this.drawCircle(this.columnToPosition(x), this.rowToPosition(i), this.radius+8);
             }*/
            var i,
                j = y,
                k = x;

            for( i = 1; i <= 4; i += 1 ) {
                this.drawCircle( this.columnToPosition( k ), this.rowToPosition( j ), this.radius + 8 );

                this.ctxField.beginPath();
                this.ctxField.lineWidth = 20;
                this.ctxField.moveTo( this.columnToPosition( k ) - 50, this.rowToPosition( j ) + 50 );
                this.ctxField.lineTo( this.columnToPosition( k ) + 50, this.rowToPosition( j ) - 50 );
                this.ctxField.strokeStyle = "red";
                this.ctxField.stroke();

                j -= 1;
                k += 1;

            }

            window.PopUp.showWinMessage( "won" );
        }

        if( this.checkLeftDiagonal( y, x, field_content ) ) {
            var i,
                j = y,
                k = x;

            for( i = 1; i <= 4; i += 1 ) {
                this.drawCircle( this.columnToPosition( k ), this.rowToPosition( j ), this.radius + 8 );

                this.ctxField.beginPath();
                this.ctxField.lineWidth = 20;
                this.ctxField.moveTo( this.columnToPosition( k ) + 50, this.rowToPosition( j ) + 50 );
                this.ctxField.lineTo( this.columnToPosition( k ) - 50, this.rowToPosition( j ) - 50 );
                this.ctxField.strokeStyle = "red";
                this.ctxField.stroke();

                j -= 1;
                k -= 1;

            }

            window.PopUp.showWinMessage( "won" );
        }
    },
    checkRow:           function( y, x, field_content ) {
        var i;
        if( x > (this.breite - 4) ) {
            return false;
        }

        for( i = x; i <= (x + 3); i += 1 ) {
            //alert(field[x][i]);
            if( this.field[y][i] != field_content ) {
                return false;
            }
        }
        return true;
    },
    checkColumn:        function( y, x, field_content ) {
        var i;
        if( y < 3 ) {
            return false;
        }

        if( (this.height - 1 - y) + 3 > this.highest_layer ) {
            return false;
        }
        for( i = y; i >= (y - 3); i -= 1 ) {
            if( this.field[i][x] != field_content ) {
                return false;
            }
        }
        return true;
    },
    checkRightDiagonal: function( y, x, field_content ) {
        var i;
        if( (x > (this.breite - 4)) || (y < 3) ) {
            return false;
        }
        for( i = x; i <= (x + 3); i += 1 ) {
            if( this.field[y - (i - x)][i] != field_content ) {
                return false;
            }
        }
        return true;
    },
    checkLeftDiagonal:  function( y, x, field_content ) {
        var i;
        if( (x < (this.breite - 4)) || (y < 3) ) {
            return false;
        }
        for( i = x; i >= (x - 3); i -= 1 ) {
            if( this.field[y - (x - i)][i] != field_content ) {
                return false;
            }
        }
        return true;
    },
    coinAnimation:      function() {
        // add custom properties
        var thisElem = this;

        if( thisElem.your_turn ) {
            var yourCoin = new Kinetic.Shape( function() {
                var ctx = this.getContext();
                ctx.beginPath();
                ctx.arc( 0, 0, thisElem.radius, 0, 2 * Math.PI, false );
                var my_gradient = ctx.createLinearGradient( 0, 0, (0 + thisElem.radius), (0 + thisElem.radius) );
                my_gradient.addColorStop( 0, thisElem.player_one_color );
                my_gradient.addColorStop( 1, "black" );
                ctx.fillStyle = my_gradient;
                ctx.fill();
            } );

            yourCoin.vx = 0;
            yourCoin.vy = 0;
            yourCoin.radius = this.radius;

            yourCoin.setPosition( this.columnToPosition( this.column ), this.rowToPosition( -1 ) );

            this.coinsLayer.add( yourCoin );

            this.coinsStage.add( this.coinsLayer );

            var date = new Date();
            var time = date.getTime();

            animate( time, yourCoin, thisElem );
        }
        else {
            var myCoin = new Kinetic.Shape( function() {
                var ctx = this.getContext();
                ctx.beginPath();
                ctx.arc( 0, 0, thisElem.radius, 0, 2 * Math.PI, false );
                var my_gradient = ctx.createLinearGradient( 0, 0, (0 + thisElem.radius), (0 + thisElem.radius) );
                my_gradient.addColorStop( 0, thisElem.player_two_color );
                my_gradient.addColorStop( 1, "black" );
                ctx.fillStyle = my_gradient;
                ctx.fill();
            } );

            myCoin.vx = 0;
            myCoin.vy = 0;
            myCoin.radius = this.radius;

            myCoin.setPosition( this.columnToPosition( this.column ), this.rowToPosition( -1 ) );

            this.coinsLayer.add( myCoin );

            this.coinsStage.add( this.coinsLayer );

            var date = new Date();
            var time = date.getTime();

            animate( time, myCoin, thisElem );
        }
    }
};