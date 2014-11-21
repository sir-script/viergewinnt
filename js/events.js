function init() {
    var FourWins = {
        WIDTH:  7,
        HEIGHT: 6,

        field: undefined,

        socket: io.connect( 'http://localhost:33563' )
    }
    var PlayerNames = {};
    var GUI = {

        displayed_screens:   {
            "startscreen": true,
            "playerlist":  false,
            "wait":        false,
            "field":       false
        },
        initEvents:          function() {
            $( "body" ).animate( {opacity: 1}, 2000 );
            $( "#startscreen h1" ).after( "<p id='introduction'></p>" );
            $( "#startscreen p#introduction" ).load( "../view/introduction.txt" );

            $( "section#startscreen form#userform" ).on( 'submit', function( e ) {
                var myname = $( "#username" ).val();
                PlayerNames.me = myname;
                FourWins.socket.emit( 'username', myname );
                GUI.remove_screens();
                e.preventDefault();
            } );
            $( "section#startscreen form#userform input" ).on( 'click', function( e ) {
                $( this ).val( "" ).removeAttr( "placeholder" );
            } );
        }(),
        remove_screens:      function() {
            var screen;
            //$("section").remove();
            for( screen in GUI.displayed_screens ) {
                if( screen ) {
                    $( "#" + screen + "" ).remove();
                }
                screen = false;
            }
        },
        appendList:          function( data ) {
            GUI.remove_screens();

            $( "body" ).append( "<section id='playerList'><h1>Player Liste</h1><div id='liste'></div></section>" );
            for( var j = 0; j < data.length; j++ ) {
                $( "#playerList>div#liste" ).append( "</br><span>" + data[j].clientname + "</span>" );
            }
            GUI.displayed_screens.playerList = true;
        },
        chooseEnemyFromList: function( data ) {
            $( '#playerList div#liste span' ).on( 'click', function( event ) {
                var idx = $( 'span' ).index( this );
                PlayerNames.enemy = data[idx].clientname;
                data[idx].stage = 2;
                console.log( data[idx] );
                FourWins.socket.emit( 'chooseEnemy', data[idx] );
            } );
        },
        loadGame:            function() {
            FourWins.field = undefined;
            GUI.remove_screens();
            GUI.displayed_screens.field = true;
            $( "body" ).load( "/view/gamegui.html", function() {
                FourWins.field = new canvasObj( FourWins.WIDTH, FourWins.HEIGHT, FourWins.socket, window.PopUp.your_turn );
                window.PopUp.updatePlayersTurnPopUp();
                window.PopUp.loadPlayersTurnPopUp();
            } );
        }
    }

    window.PopUp = {
        your_turn: true,

        loadPlayersTurnPopUp:   function() {
            PopUp.player_names = {
                "me":    {
                    "name":     PlayerNames.me,
                    "node":     $( "div.spieler1 h3" ),
                    "img_node": $( "div.spieler1 .playerimg" ),
                    "color":    "orange"
                },
                "enemy": {
                    "name":     PlayerNames.enemy,
                    "node":     $( "div.spieler2 h3" ),
                    "img_node": $( "div.spieler2 .playerimg" ),
                    "color":    "green"
                }
            };
            set_players = function() {
                //player_names["me"]["node"].html(player_names["me"]["name"]);
                window.PopUp.player_names.me.node.html( PopUp.player_names.me.name );
                window.PopUp.player_names.me.img_node.css( "background-color", window.PopUp.player_names.me.color );

                window.PopUp.player_names.enemy.node.html( PopUp.player_names.enemy.name );
                window.PopUp.player_names.enemy.img_node.css( "background-color", window.PopUp.player_names.enemy.color );
            }();

            /*$("a#show_turn").click(function(e){
             e.preventDefault();

             $("div#players_turn").animate({"opacity":0},300, function(){
             PopUp.checkCurrentPlayer();
             });

             //$("div.overlay").css("display","block");
             $("div#players_turn").animate({"opacity":1},1000);

             //$("div.overlay").animate({"opacity":0.7},1000);
             });*/

        },
        showWinMessage:         function( type ) {
            var message;
            if( type == "won" ) {

                message = "Keiner";
                if( FourWins.field.your_turn ) {
                    message = PlayerNames.me;
                }
                else {
                    message = PlayerNames.enemy;
                }
                $( "div#ergebnis span.player" ).text( message );

            }
            else if( type == "field full" ) {
                $( "div#ergebnis>*:not(.draw)" ).css( "display", "none" );
                $( "div#ergebnis .draw)" ).css( "display", "block" );

                $( "div#ergebnis .draw" ).text( "Unentschieden" );
            }

            $( "div#ergebnis" ).css( "display", "block" );
            setTimeout( function() {
                $( "div#ergebnis" ).animate( {"opacity": 1}, 1000 );
            }, 2500 );

            setTimeout( function() {
                $( "div#ergebnis" ).animate( {"opacity": 0}, 300 );
                //alert("Gewonnen");

                FourWins.socket.emit( 'win', true );
                FourWins.field = undefined;

            }, 7500 );

        },
        updatePlayersTurnPopUp: function() {
            $( "div#players_turn" ).animate( {"opacity": 0}, 300, function() {
                window.PopUp.checkCurrentPlayer();
            } );

            //$("div.overlay").css("display","block");
            $( "div#players_turn" ).animate( {"opacity": 1}, 1000 );

            //$("div.overlay").animate({"opacity":0.7},1000);
        },
        /*swapTurn: function(){
         PopUp.your_turn=!PopUp.your_turn;
         },*/
        checkCurrentPlayer:     function() {
            if( FourWins.field.your_turn ) {
                window.PopUp.player_names.enemy.node.removeClass( "current" );
                window.PopUp.player_names.me.node.addClass( "current" );
            }
            else {
                window.PopUp.player_names.me.node.removeClass( "current" );
                window.PopUp.player_names.enemy.node.addClass( "current" );
            }
        }
    }

    FourWins.socket.on( 'displayList', function( data ) {
        //FourWins.field=undefined;
        GUI.appendList( data );
        //user choose enemy from list
        GUI.chooseEnemyFromList( data );
    } );
    FourWins.socket.on( 'wantplay', function( returndata ) {
        if( confirm( "Do you want to play with " + returndata.clientname + "?" ) ) {
            window.PopUp.your_turn = false;
            PlayerNames.enemy = returndata.clientname;
            FourWins.socket.emit( 'GameAccepted', returndata );
        }
    } );
    FourWins.socket.on( 'wait4player', function( msg ) {
        window.PopUp.your_turn = true;
        GUI.remove_screens();

        $( "body" ).load( "/view/wait.html" );
        GUI.displayed_screens.wait = true;

        //FourWins.field=undefined;
    } );
    FourWins.socket.on( 'showList', function( msg ) {
        //$("body>*").remove();
        GUI.remove_screens();
        //FourWins.field=undefined;

        //$("body>div#liste").show();
    } );
    FourWins.socket.on( 'gamestart', function( msg ) {

        if( FourWins.field == undefined ) {
            GUI.loadGame();
            //FourWins.field = new canvasObj(FourWins.WIDTH,FourWins.HEIGHT,FourWins.socket);
            //FourWins.field=new fieldObj(FourWins.WIDTH,FourWins.HEIGHT,FourWins.socket);

        }
    } );
    /*socket.on('clearField', function(msg){
     $("body>*").remove();
     field=undefined;
     });*/
    FourWins.socket.on( 'insertCoin', function( column ) {
        FourWins.field.insertCoin( column );
        window.PopUp.updatePlayersTurnPopUp();
    } );

}