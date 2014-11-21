/*jslint node: true */
//"use strict";
function fieldObj(width, height, socket) {
    //init settings
    this.width = width;
    this.height = height;
    this.your_turn = false;
    this.content = "";
    this.field;
    this.highest_layer = 0;
	this.player_one_color = "green";
	this.player_two_color = "orange";

    this.createArray();
    this.createField();
    this.initEvents();
	
	this.socket=socket;
};
fieldObj.prototype = {
    createArray: function () {
		var i;
        this.field = new Array(this.width);
        for (i = 0; i < this.field.length; i += 1){
            this.field[i] = new Array(this.height);
		}
    },
    createField: function () {
        $("body").append("<section id='field'><table border='1px' border-collapse='collapse'>");
		var i, j;
        for (j = 0; j < this.height; j += 1) {
            $("table:first").append("<tr>");
            for (i = 0; i < this.width; i += 1) {
                $("table tr:nth-child(" + (j + 1) + ")").append("<td></td>");

                //default value of a field
                this.field[j][i] = this.content;
            }
            $("table:first").append("</tr>");
        }
        $("body").append("</table></section>");
		$("table tr td").css({"background-color":"white"});
    },
    fillField: function () {
        var i, j;
		for (j = 0; j < this.height; j += 1) {
            for (i = 0; i < this.width; i += 1){
                $("table tr:nth-child(" + (j + 1) + ") td:nth-child(" + (i + 1) + ")")[0].innerHTML = "O";
			}
        }
    },
    insertCoin:function (spalte) {
        var i, j;
		if (isNaN(spalte)) {
            alert("NaN");
            return;
        }
        if (this.field[0][spalte] != "") {
            //alert("field full");
			//socket.emit("field_full",true);
            return;
        }
		
        for (j = this.height - 1; j >= 0; j -= 1) {
            if (this.field[j][spalte] == "") {
                if (this.your_turn) {
                    this.content = this.player_one_color;
				}
                else {
                    this.content = this.player_two_color;
                }
				this.field[j][spalte] = this.content;
                $("table tr:nth-child(" + (j + 1) + ") td:nth-child(" + (spalte + 1) + ")").css({"background-color":this.content});

                if ((this.height - 1 - j) > this.highest_layer){
                    this.highest_layer = (this.height - 1 - j);
				}

                this.your_turn = !this.your_turn;
                break;
            }
        }


        for (j = 0; j < this.height; j += 1) {
            for (i = 0; i < this.width; i += 1) {
                this.hasWon(j, i);
            }
        }
    },
    hasWon:function (y, x) {
        //alert("hallo");
        /*for(var j=height-1;j>=0;j--){



         }*/

        if (this.field[y][x] == "")
            return;

        var field_content = this.field[y][x];
        //alert(field_content);
        if (this.checkRow(y, x, field_content)) {
            alert("Gewonnen in Zeile");
            this.socket.emit('win', true);
        }

        if (this.checkColumn(y, x, field_content)) {
            alert("Gewonnen in Spalte");
            this.socket.emit('win', true);
        }

        if (this.checkRightDiagonal(y, x, field_content)) {
            alert("Gewonnen Rechts Diagonnnnal");
            this.socket.emit('win', true);
        }

        if (this.checkLeftDiagonal(y, x, field_content)) {
            alert("Gewonnen Links Diagonal");
            this.socket.emit('win', true);
        }
    },
    checkRow:function (y, x, field_content) {
        var i;
		if (x > (this.breite-4)) {
            return false;
		}
		
        for (i = x; i <= (x + 3); i += 1) {
            //alert(field[x][i]);
            if (this.field[y][i] != field_content){
                return false;
			}
        }
        return true;
    },
    checkColumn:function (y, x, field_content) {
        var i;
		if (y < 3){
            return false;
		}

        if ((this.height - 1 - y) + 3 > this.highest_layer) {
            return false;
		}
        for (i = y; i >= (y - 3); i -= 1) {
            if (this.field[i][x] != field_content){
                return false;
			}
        }
        return true;
    },
    checkRightDiagonal:function (y, x, field_content) {
        var i;
		if ((x > (this.breite-4)) || (y < 3)){
            return false;
		}
        for (i = x; i <= (x + 3); i += 1) {
            if (this.field[y - (i - x)][i] != field_content) {
                return false;
			}
        }
        return true;
    },
    checkLeftDiagonal: function (y, x, field_content) {
        var i;
		if ((x < (this.breite-4)) || (y < 3)) {
            return false;
		}
        for (i = x; i >= (x - 3); i -= 1) {
            if (this.field[y - (x - i)][i] != field_content){
                return false;
			}
        }
        return true;
    },
    initEvents:function () {
        var thisElem = this;
        /*$("input[type='button']").click(function () {
            var index = $(this).index();
            thisElem.insertCoin(index);
        });*/

		//insert coin event
		$("table tr td").click(function(e){
			var spalte=$(this).index();
			if (thisElem.field[0][spalte] != "") {
				alert("field full");
				thisElem.socket.emit("field_full",true);
            }else{
				thisElem.socket.emit('check_myturn',spalte);
			}	
		});
		//mouseover action on a field 
		$("table td").mouseover(function(e){
			var spalte=$(this).index();
			$("table tr td:nth-child("+(spalte+1)+")").css({"border-left":"2px red solid","border-right":"2px red solid","opacity":0.6
			});
		});
		//mouseout action on a field
		$("table td").mouseout(function(e){
			var spalte=$(this).index();
			$("table tr td:nth-child("+(spalte+1)+")").css({"border":"none","opacity":1});
		});
    }

};