/*jslint node: true */
//"use strict";
/**
* This is the description for my class.
* @module HandleClients
* @class HandleClients
* @namespace HandleClients
* @constructor
*/

function handleClients(PORT, HOST) {
    //init settings
	this.available_players = [];

	this.timestamp;
	this.next_timestamp;
	this.current_timestamp;

	this.in_the_list = false;
}
handleClients.prototype = {
	/**
	* Print all Clients out in the console
	* @method printAllClients
	*/
    printAllClients: function () {
        var i;
		console.log("==============Allclients=========");
		for (i = 0; i < this.available_players.length; i += 1) {
			//console.log(this.available_players[i]);
			console.log(this.available_players[i].clientname);
		}
    },
	/**
	* Returns a list containing all Client-Informations
	* @method getAllClients
	* @return {Array} Array of all Clients
	*/
	getAllClients: function () {
		var list = [], i;

		for (i = 0; i < this.available_players.length; i += 1) {
			list[i] = this.available_players[i];
		}
		return list;
	},
	/**
	* This method updates the client list.
	* @method getAllClients
	* @return {Array} Array of all Clients
	*/
	checkClientsOnExpires: function () {
		var i, name;
		for (i = 0; i < this.available_players.length; i += 1) {
			this.next_timestamp = this.available_players[i].expires;

			this.current_timestamp = new Date().getTime();
			if (this.current_timestamp > this.next_timestamp) {
				name = this.available_players[i].clientname;
				this.available_players.splice(i, 1);
				console.log(name + " leaves the room!");
			}
		}
	},
	/**
	* Checks if the passed client is just in the list.
	* If so, than set new Expires Date for the passed client.
	* @method inTheList
	* @param {Object} client-data
	* @return {Boolean} in_the_list
	*/
	inTheList: function (rinfo) {
		var i;
		this.in_the_list = false;

		for (i = 0; i < this.available_players.length; i += 1) {

			if (this.available_players[i].address == rinfo.address) {
				this.in_the_list = true;
				this.available_players[i].expires = new Date().getTime() + 10000;

				break;
			}
		}
		return this.in_the_list;
	},
	/**
	* Adds a New Client on the List.
	* @method addNewClientOnTheList
	* @param {Object} client-data
	*/
	addNewClientOnTheList: function (data,rinfo) {
		//var data=JSON.parse(msg);
		if (rinfo.address) {
			this.available_players[this.available_players.length] = {
				"address": rinfo.address,
				"port": rinfo.port,
				"expires": (new Date().getTime() + 10000),
				"version": data.version,
				"clienttype": data.clienttype,
				"stage": data.stage,
				"clientname": data.clientname
			};
		}
	}
}
// export the class
module.exports = handleClients;