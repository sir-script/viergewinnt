Michael Rainer & Matthias Prieth presents 4GEWINNT (Foursquare)

Our first NodeJS network implementation for the game Foursquare (deu. VierGewinnt).
This game can only be played via Local Area Network and not over the internet.

For convenience, we have included the NodeJS portable version and also the 
two node modules are already included in the node_modules folder. 
Altough, normally, you should not check the node_modules folder into git, 
but in this little project we found it useful 
to avoid additional steps of installation (for novice users).


The game can be started, under Windows,  with the following instructions.
Both of the player must 
---------------------------------------------------------------------------
HOW TO(WINDOWS):

- open GameStart.exe. 

- The server will be started and the browser should be open the
	right target url.
  
- On the first page, please enter your player name and commit it.  

- Now a list should be displayed ("Playerlist") and you should see the 
other player, who has connected via LAN.

- enjoy!

---------------------------------------------------------------------------
ALTERNATIVE:

- open node.cmd and press "strg+c" twice or open cmd and change into the project ordner.


- start the server with the command "node player.js"

- Our software communicates with the browser on port 33563. Therefore please enter the
	following url into the browser: ""http://localhost:33563/""
Unser Program kommuniziert mit dem Browser momentan über den Port 33563, 
  da Port 80 oft bereits durch andere Programme belegt ist. Deshalb im 
  Browser "http://localhost:33563/" eingeben.
  
- On the first page, please enter your player name and commit it.  

- Now a list should be displayed ("Playerlist") and you should see the 
other player, who has connected via LAN.

- enjoy!
---------------------------------------------------------------------------