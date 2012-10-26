var chess_board = [['black_rook', 'black_knight', 'black_bishop', 'black_queen', 'black_king', 'black_bishop', 'black_knight', 'black_rook'],
                    ['black_pawn', 'black_pawn', 'black_pawn', 'black_pawn', 'black_pawn', 'black_pawn', 'black_pawn', 'black_pawn'],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    ['white_pawn', 'white_pawn', 'white_pawn', 'white_pawn', 'white_pawn', 'white_pawn', 'white_pawn', 'white_pawn'],
                    ['white_rook', 'white_knight', 'white_bishop', 'white_queen', 'white_king', 'white_bishop', 'white_knight', 'white_rook']];

var myChess = $.connection.myChess;
$.connection.hub.start();

Array.prototype.unique = function () {
    var uniques = [];
    $.each(this, function (key, val) {
        if ($.inArray(val, uniques) === -1)
            uniques.push(val);
    });
    return uniques;
}

function foreach(arr, callback) {
    for (var i = 0; i < arr.length; i++) {
        callback(arr[i]);
    }
}
function createChessboard() {
    createTable();
    $('#chess-board').html(plain_borad.str);
}

function chessboradString() {
    this.str = "<table class='chess-board'>";
}
var plain_borad = new chessboradString();

function createTable(arr) {
    for (var i = 0; i < chess_board.length; i++) {
        createRow(chess_board[i], i);
    }
}
function createRow(arr, index) {
    plain_borad.str += "<tr>";
    for (j = 0; j < arr.length; j++) {
        createColumn(arr[j], index, j );
    }
    plain_borad.str += "</tr>";
}

function createColumn(val, index, position) {
    plain_borad.str += val != 0 ? getColumn(val, index, position) : getEmptyColumn(index, position);
}
function getEmptyColumn(index, position) {
    return "<td id='" + genId(index, position) + "' title = '" + genId(index, position) + "'></td>";
}
function getPiece(val) {
    return "<img src='../Content/pieces/" + val + ".gif' />";
}
function getColumn(val, index, position) {
    return "<td id='" + genId(index, position) + "' title = '" + genId(index, position) + "'><a id='" + val + "' class='"+ val.split('_')[0] +"'>" + getPiece(val) + "</a></td>";  /// <reference path="../Content/pieces/black_bishop.gif" />
}
function genId(index, position) {
    return index + '' + position;
}
myChess.refreshBoard = function () {
    $(' .chess-board tr td')
        .css("background", "#fff")
        .css("background", "-moz-linear-gradient(top, #fff, #eee)")
        .css("background", "-webkit-gradient(linear,0 0, 0 100%, from(#fff), to(#eee))")
        .css("box-shadow", "inset 0 0 0 1px #fff")
        .css("-moz-box-shadow", "inset 0 0 0 1px #fff")
        .css("-webkit-box-shadow", "inset 0 0 0 1px #fff");

    $(' .chess-board tr:nth-child(odd) td:nth-child(even) , .chess-board tr:nth-child(even) td:nth-child(odd)')
        .css("background", " #ccc")
        .css("background", "-moz-linear-gradient(top, #ccc, #eee)")
        .css("background", "-webkit-gradient(linear,0 0, 0 100%, from(#ccc), to(#eee))")
        .css("box-shadow", "inset 0 0 10px rgba(0,0,0,.4)")
        .css("-moz-box-shadow", "inset 0 0 10px rgba(0,0,0,.4)")
        .css("-webkit-box-shadow", "inset 0 0 10px rgba(0,0,0,.4)");

    return this;

}

        