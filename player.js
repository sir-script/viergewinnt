// server.js
var fs = require( 'fs' );

function readFile( url, res ) {
    fs.readFile(
        __dirname + url,
        function( err, data ) {
            if( err ) {
                res.writeHead( 500 );
                return res.end( 'Error loading' + url );
            }

            res.writeHead( 200 );
            res.end( data );
        }
    );
}

function handler( req, res ) {
    // Hardcode *all* HTTP requests to this server to serve up index.html
    switch( req.url ) {
        case '/view/introduction.txt':
            readFile( "/view/introduction.txt", res );
            break;
        case '/vendor/kinetic.js':
            readFile( "/vendor/kinetic.js", res );
            break;
        case '/js/coin.js':
            readFile( "/js/coin.js", res );
            break;
        case '/js/canvasObj.js':
            readFile( "/js/canvasObj.js", res );
            break;
        case '/view/gamegui.html':
            readFile( "/view/gamegui.html", res );
            break;
        case '/fonts/Sansation/Sansation_Regular.ttf':
            readFile( "/fonts/Sansation/Sansation_Regular.ttf", res );
            break;
        case '/view/wait.html':
            readFile( "/view/wait.html", res );
            break;
        case '/css/style.css':
            readFile( "/css/style.css", res );
            break;
        case '/js/events.js':
            readFile( "/js/events.js", res );
            break;
        case '/vendor/jquery.js':
            readFile( "/vendor/jquery.js", res );
            break;
        case '/js/field.js':
            readFile( "/js/field.js", res );
            break;
        default:
            readFile( "/index.html", res );
    }
}

var app = require( 'http' ).createServer( handler ),
    io = require( 'socket.io' ).listen( app );

// Start an HTTP server on port 8080
// app.listen(80);

// #alternative Port...
app.listen( 33563 );

/*Server to Server UDP Protocoll*/


// After any socket connects, SEND it a custom 'news' event
//const PORT = 32442;
var dgram = require( 'dgram' );
var server = dgram.createSocket( 'udp4' );

var PORT = 32442,
    HOST = '255.255.255.255',
    version = "2",
    clienttype = 1;

var handleClients = require( './js/handleClients.js' );
var clients = new handleClients();

var stage,
    turn,
    data,
    clientname,
    connected,
    show_game_request,
    enemy,
    my_turn,
    last_turn;

var intervals = ["broadcast_interval", "client_interval", "stage2Interval",
    "stage2AnswerInterval", "stage3AnswerInterval", "stage4AnswerInterval", "winInterval"];

var timeouts = ["wait4user", "wait4enemyconfirmed", "stage4Timeout"];

init();

function init() {

    stage = 1;
    turn = -1;
    connected = false;
    show_game_request = true;
    enemy = {};
    my_turn = false;
    last_turn = undefined;
    data =
    {
        "version":    version,
        "clienttype": clienttype,
        "stage":      stage,
        "clientname": clientname
    };
}

io.set( 'log level', 1 );

io.sockets.on( 'connection', function( socket ) {

    socket.on( 'username', function( username ) {
        server.bind( PORT );
        clientname = username;
        data =
        {
            "version":    version,
            "clienttype": clienttype,
            "stage":      stage,
            "clientname": clientname.replace( /(<([^>]+)>)/ig, "" )
        };

        sendBroadcastMessage();

        updateClientList( socket );

        //message from browser (which enemy you have chosen from the list)
        socket.on( 'chooseEnemy', function( msg ) {
            enemy =
            {
                "port":    msg.port,
                "address": msg.address
            };

            data.stage = 2;
            my_turn = true;

            clearAllIntervals();
            clearAllTimeouts();

            clearBroadcast();

            setSendInterval( "stage2Interval", 2000 );

            /*waiting for player connect*/
            socket.emit( 'wait4player', true );

            setNewTimeout( socket, "wait4user", 10000 );
        } );

        //listen on message from others
        server.on( "message", function( msg, rinfo ) {
            try {
                var returndata = JSON.parse( msg );
            } catch( e ) {
                console.log( "Cannot interpret this json package" );
                return;
            }

            if( returndata.clientname != undefined ) {
                returndata.clientname = escape( returndata.clientname );
            }
            console.log( "message received" );
            console.log( "clientname: " + returndata.clientname );
            console.log( "stage: " + returndata.stage );
            console.log( "connected: " + connected );
            console.log( "my_turn: " + my_turn );

            if( returndata.clientname == clientname )   //eventuell mit ip lösen!
            {
                return;
            }

            switch( returndata.stage ) {
                case 1:
                    if( !clients.inTheList( rinfo ) ) {
                        clients.addNewClientOnTheList( returndata, rinfo );
                    }
                    break;
                case 2:
                    clearAllTimeouts();
                    clearBroadcast();

                    if( show_game_request == false ) {
                        console.log( "BREAK" );
                        break;
                    }
                    else {
                        if( returndata.clientname == undefined ) {
                            socket.emit( 'gamestart', true );
                            clearSendInterval( "stage2Interval" );
                            clearWaitTimeout( "wait4user" );

                            connected = true;

                            data.stage = 3;
                            data.clientname = undefined;

                            setSendInterval( "stage3AnswerInterval", 2000 );
                            setNewTimeout( socket, "stage3Timeout", 10000 );

                        }
                        else {
                            enemy =
                            {
                                "port":    rinfo.port,
                                "address": rinfo.address
                            };
                            if( connected == false ) {
                                show_game_request = false;
                                socket.emit( 'wantplay', returndata );
                            }
                        }
                        break;
                    }

                case 3:
                    clearAllTimeouts();
                    clearBroadcast();

                    console.log( "Stage3" );
                    if( my_turn == false && connected == false ) {
                        clearAllTimeouts();
                        clearAllIntervals();
                        connected = true;
                        data.stage = 3;
                        setSendInterval( "stage3AnswerInterval", 2000 );

                        setNewTimeout( socket, "stage3Timeout", 10000 );
                    }
                    if( my_turn == true ) {
                        connected = true;
                        clearAllTimeouts();
                        clearAllIntervals();
                    }

                    break;
                case 4:
                    clearBroadcast();

                    console.log( "Stage4" );
                    console.log( "returndata.turn: " + returndata.turn );
                    console.log( "new_turn: " + turn );
                    console.log( "my_turn: " + my_turn );

                    if( my_turn == false && returndata.turn != turn ) {
                        if( last_turn == undefined ) {
                            turn = returndata.turn + 1;
                            clearAllTimeouts();
                            clearAllIntervals();
                            last_turn = returndata;
                            socket.emit( 'insertCoin', last_turn.column - 1 );
                            my_turn = true;
                        }
                    }

                    break;
                /*case 5:
                 reset(socket);
                 break;*/
                default:
                    break;
            }
        } );

        server.on( "listening", function() {
            var address = server.address();
            console.log( "server listening " + address.address + ":" + address.port );
        } );

        socket.on( 'GameAccepted', function( msg ) {

            clearBroadcast();
            data.stage = 2;
            data.clientname = undefined;

            //console.log(enemy);
            socket.emit( 'gamestart', true );

            setSendInterval( "stage2AnswerInterval", 2000 );
            setNewTimeout( socket, "wait4enemyconfirmed", 10000 );
        } );

        socket.on( 'check_myturn', function( column ) {
            if( my_turn == true ) {
                socket.emit( 'insertCoin', column );
                data.stage = 4;
                if( turn == -1 ) {
                    turn++;
                }
                data.turn = turn;
                data.column = column + 1;
                last_turn = undefined;
                my_turn = false;
                console.log( data );
                setSendInterval( "stage4AnswerInterval", 2000 );
                setNewTimeout( socket, "stage4Timeout", 30000 );
            }
        } );

        socket.on( 'win', function( msg ) {
            /*data.stage=5;
             setSendInterval("winInterval",2000);*/
            reset( socket );
        } );
    } );
} );

function clearAllIntervals() {
    for( var interval in intervals ) {
        clearInterval( intervals[interval] )
    }
}
function reset( socket ) {
    clearAllTimeouts();
    clearAllIntervals();
    init();
    sendBroadcastMessage();
    updateClientList( socket );

    socket.emit( 'displayList', true );
}
function setSendInterval( name, duration ) {
    var msg = new Buffer( JSON.stringify( data ) );

    server.send( msg, 0, msg.length, enemy.port, enemy.address );
    intervals[name] = setInterval( function() {
        server.send( msg, 0, msg.length, enemy.port, enemy.address );
    }, duration );

}
function clearAllTimeouts() {
    for( var timeout in timeouts ) {
        clearTimeout( timeouts[timeout] );
    }

}
function setNewTimeout( socket, name, duration ) {
    timeouts[name] = setTimeout( function() {
        reset( socket );
    }, duration );
}
function clearWaitTimeout( name ) {
    clearTimeout( timeouts[name] );
}
function clearSendInterval( name ) {
    clearInterval( intervals[name] );
}
function clearBroadcast() {
    server.setBroadcast( false );
    clearInterval( intervals["broadcast_interval"] );
    clearInterval( intervals["client_interval"] );
}

function sendBroadcastMessage() {
    server.setBroadcast( true );

    intervals["broadcast_interval"] = setInterval( function() {
        var message = new Buffer( JSON.stringify( data ) );
        server.send( message, 0, message.length, PORT, HOST );
    }, 2000 );
}
function updateClientList( socket ) {
    intervals["client_interval"] = setInterval( function() {
        clients.printAllClients();
        clients.checkClientsOnExpires();
        socket.emit( 'displayList', clients.getAllClients() );
    }, 2000 );
}