function chessElement(obj) {
    this.self = obj;
    this.identity = function () { return this.self.attr('id').split('_')[0]; }
    this.type = function () { return this.self.attr('id').split('_')[1]; }
    this.container = function () { return this.self.parent(); }
    this.draggable = function () {
        this.self.draggable({ revert: true });
    }
    this.name = function () { return this.self.attr('id'); }
    this.steps = new Array();
    this.move = function () {
        var element = this;
        this.draggable();
        $('td').each(function () {
            $(this).droppable({ disabled: true });
        });
        print('steps : ' +this.steps.join(','));
        $.each(this.steps, function (key, value) {
            $('#' + getStepId(value)).attr('style', 'background-color:yellow').droppable({
                drop: function (ev, ui) {
                    element.container().find('a').removeAttr('style');
                    var e = { Name: element.name(), HtmlString: element.container().html(), FromStep: parseInt(element.container().attr('id')), ToStep: value };
                    myChess.sync(JSON.stringify(e));
                },
                disabled: false
            });
        });
    }
    this.click = function () {
        var isAllowed = false;
        if (myChess.isMyMove()) {
            if (myChess.myType != this.identity())
                return false;
            myChess.refreshBoard();
            isAllowed = (this.type() == 'king') || !isCheckToMe(this);
            if (isAllowed) {
                this.steps = this.type() == 'king' ? $.merge(filterMySteps(this, getAllSteps(this, true)), getCastlingStepsForKing()) : filterMySteps(this, getAllSteps(this, true));
                this.move();
            }

        }
    }
}

function getCastlingStepsForKing() {
    var steps = new Array();
    if (myChess.myType == 'black') {
        if (isCastlingFromLeft() && $('#05').html() == '' && $('#06').html() == '') { steps = $.merge(steps, [5, 6]); }
        if (isCastlingFromRight() && $('#01').html() == '' && $('#02').html() == '' && $('#03').html() == '') { steps = $.merge(steps, [1, 2, 3]);}
    }
    else {
        if (isCastlingFromRight() && $('#75').html() == '' && $('#76').html() == '') { steps = $.merge(steps, [75, 76]);}
        if (isCastlingFromLeft() && $('#71').html() == '' && $('#72').html() == '' && $('#73').html() == '') {steps = $.merge(steps, [71, 72, 73]);}
    }
    //print(' castling steps : '+steps.join(','));
    return steps;
}

myChess.initializeCastlingParameters = function () {
    this.isKingMoved = false;
    this.leftRookMoved = false;
    this.rightRookMoved = false;
}
function setCastlingParameter(e) {
    myChess.isKingMoved = e.type() == 'king';
    if (e.type() == 'rook') {
        if (myChess.myType() == 'black') {
            myChess.leftRookMoved = parseInt(e.container().attr('id')) % 10 != 0;
            myChess.rightRookMoved = parseInt(e.container().attr('id')) % 10 == 0;
        }
        else {
            myChess.leftRookMoved = parseInt(e.container().attr('id')) % 10 == 0;
            myChess.rightRookMoved = parseInt(e.container().attr('id')) % 10 != 0;
        }
    }
}
function isCastlingFromLeft() {
    return !myChess.isKingMoved && !myChess.leftRookMoved;
}
function isCastlingFromRight() {
    return !myChess.isKingMoved && !myChess.rightRookMoved;
}
function filterMySteps(e, steps) {
    var nSteps = new Array(),chessboard = $.extend(true, {}, chess_board);
    if (isCheckPresent(e) && (e.type() != 'king')) {
        while (steps.length > 0) {
            var step = steps.pop();var index = step > 0 ? parseInt(step / 10) : 0, position = step > 0 ? parseInt(step % 10) : step;
            chess_board[index][position] = e.name();
            if (isCheckBreakingStep(step))
                nSteps.push(step);

            chess_board = $.extend(true, {}, chessboard);
        }
    }
    else
        nSteps = steps;

    chess_board = $.extend(true, {}, chessboard);
    return nSteps;
}

function getAllSteps(element, requireIndentityCheck) {
    switch (element.type()) {
        case 'pawn': return getAllStepsForPawn(element, requireIndentityCheck);
        case 'knight': return getAllStepsForKnight(element, requireIndentityCheck);
        case 'rook': return getAllStepsForRook(element, requireIndentityCheck);
        case 'bishop': return getAllStepsForBishop(element, requireIndentityCheck);
        case 'queen': return getAllStepsForQueen(element, requireIndentityCheck);
        case 'king': return getAllStepsForKing(element, requireIndentityCheck);
    }
}

function getIncrementForPawn(identity) {
    return identity == 'black' ? 1 : -1;
}

function canTakeNextStep(e) {
    return ((e.identity() == 'black') && (parseInt(parseInt(e.container().attr('id')) / 10) == 1)) || ((e.identity() == 'white') && (parseInt(parseInt(e.container().attr('id')) / 10) == 6));
}


function getAllStepsForPawn(element, requireIndentityCheck) {
    var fn = new fnSteps(requireIndentityCheck), multiplier = getIncrementForPawn(element.identity()), id = parseInt(element.container().attr('id'));
    fn.steps.push(requireIndentityCheck ? setPawnStep(id + (multiplier * 9), element.identity(), true) : id + (multiplier * 9));
    fn.steps.push(setPawnStep(id + (multiplier * 10), element.identity(), false));
    fn.steps.push(requireIndentityCheck ? setPawnStep(id + (multiplier * 11), element.identity(), true) : id + (multiplier * 11));
    if (canTakeNextStep(element)) {
        fn.steps.push(setPawnStep(id + (multiplier * 20), element.identity(), false));
    }
    return fn.removeNegativeSteps().steps;
}

function getAllStepsForKnight(element, requireIndentityCheck) {
    var fn = new fnSteps(requireIndentityCheck), id = parseInt(element.container().attr('id'));
    var offset = [21, -21, 19, -19, 12, -12, 8, -8], cnt = 7;
    while (cnt >= 0) { fn.steps.push(id + offset[cnt]); cnt--; }
    fn.removeNegativeSteps().removeInvalidSteps(element.identity());
    return fn.steps;
}
function getAllStepsForBishop(element, requireIndentityCheck) {
    var fn = new fnSteps(requireIndentityCheck), id = parseInt(element.container().attr('id'));
    var offset = [11, 9, -11, -9], cnt = 3;
    while (cnt >= 0) { setSteps(id, offset[cnt], fn); cnt--; }
    fn.removeNegativeSteps().removeInvalidSteps(element.identity());
    return fn.steps;
}
function getAllStepsForRook(element, requireIndentityCheck) {
    var fn = new fnSteps(requireIndentityCheck), id = parseInt(element.container().attr('id'));
    var offset = [1, 10, -1, -10], cnt = 3;
    while (cnt >= 0) { setSteps(id, offset[cnt], fn); cnt--; }
    fn.removeNegativeSteps().removeInvalidSteps(element.identity());
    return fn.steps;
}

function getAllStepsForQueen(element, requireIndentityCheck) {
    var fn = new fnSteps(requireIndentityCheck);
    fn.steps = $.merge(getAllStepsForRook(element, requireIndentityCheck), getAllStepsForBishop(element, requireIndentityCheck));
    return fn.steps.unique();
}
function getAllStepsForKing(element, requireIndentityCheck) {
    var fn = new fnSteps(requireIndentityCheck), id = parseInt(element.container().attr('id')), offset = [10, -10, 1, -1, 9, -9, 11, -11], cnt = 8;
    while (cnt >= 0) { fn.steps.push(id + offset[cnt]); cnt--; }
    fn.removeNegativeSteps().removeInvalidSteps(element.identity());
    fn.removeSteps(setInvalidKingSteps(element));
    return fn.steps;
}
function setInvalidKingSteps(element) {
    var opponentIdentity = element.identity() == 'white' ? 'black' : 'white', steps = new Array();
    if (opponentIdentity != myChess.myType) {
        $('.' + opponentIdentity).each(function () {
            steps = $.merge(steps, getAllSteps(new chessElement($(this)), false));
        });
    }
    return steps.unique();
}

function setSteps(id, offset ,fn ) {
    var step = id, index, position;
    do {
        step += offset;
        index = step > 0 ? parseInt(step / 10) : 0, position = step > 0 ? parseInt(step % 10) : step;
        fn.steps.push(step);
        if (!isValidId(index, position))
            break;
    } while (chess_board[index][position] == 0);
}
function setPawnStep(step,currType,isRangePos) {
    var index = step > 0 ? parseInt(step / 10) : 0, position = step > 0 ? parseInt(step % 10) : step;
    return isValidBoardStep(index, position) ? isRangePos ? (chess_board[index][position] != 0 ? (currType == getType(chess_board[index][position]) ? -1 : step) : -1) : (chess_board[index][position] == 0 ? step : -1) : -1;
}

function showSteps(steps) {
    $.each(steps, function (index, value) {
        $('#' + getStepId(value)).attr('style', 'background-color:yellow');
    });
}
function getStepId(step) {
    return step >= 10 ? step : '0' + step;
}
function getType(otype) {
    return otype.split('_')[0];
}
function fnSteps(requireIndentityCheck) {
    this.steps = new Array();
    this.removeNegativeSteps = function () {
        this.steps = $.grep(this.steps, function (val) { return val > 0; });
        return this;
    }
    this.requireIndentityCheck = requireIndentityCheck;
    this.removeInvalidSteps = function (currType) {
        var index, position, nSteps = new Array();
        $.each(this.steps, function (key, val) {
            index = val > 0 ? parseInt(val / 10) : 0;
            position = val > 0 ? parseInt(val % 10) : val;
            nSteps.push(requireIndentityCheck ? (isValidBoardStep(index, position) ? (chess_board[index][position] != 0 ? (currType == getType(chess_board[index][position]) ? -1 : val) : val) : -1) :
            (isValidBoardStep(index, position) ? val : -1));
        });
        this.setSteps(nSteps).removeNegativeSteps();
        return this;
    }
    this.removeSteps = function (opponentSteps) {
        var newSteps = new Array();
        $.each(this.steps, function (i, val) {
            if ($.inArray(val, opponentSteps) < 0)
                newSteps.push(val);
        });
        this.setSteps(newSteps);
        return this;
    }
    this.setSteps = function (nSteps) {
        this.steps = nSteps; return this;
    }
}
function isValidBoardStep(index, position) {
    return (index >= 0 && position >= 0 && index < 8 && position < 8);
}
function isValidId(index, position) {
    return ((index < 8) && (position < 8) && (index >= 0) && (position >= 0));
}
myChess.Sync = function (obj) {
    var e = eval('(' + obj + ')'), msg = '';
    this.refreshBoard().clearMessage();
    $('#' + getStepId(e.ToStep)).html(e.HtmlString).css('background-color', 'yellow');
    chess_board[e.ToStep > 0 ? parseInt(e.ToStep / 10) : 0][e.ToStep > 0 ? parseInt(e.ToStep % 10) : e.ToStep] = e.Name;
    chess_board[e.FromStep > 0 ? parseInt(e.FromStep / 10) : 0][e.FromStep > 0 ? parseInt(e.FromStep % 10) : e.FromStep] = 0;
    $('#' + getStepId(e.FromStep)).html('').css('background-color', 'yellow');
    $('.chess-board tr td a').click(function (e) {
        new chessElement($(this)).click(); e.stopImmediatePropagation();
    });
    msg = e.Name.split('_')[0] == this.myType ? chessMsgs.opponentMove : chessMsgs.myMove;
    $('.message').attr('isMyMove', e.Name.split('_')[0] == this.myType ? 0 : 1);
    if (this.isCheck()) {
        msg = this.isCheckmate() ? chessMsgs.checkmate : chessMsgs.check;
    }
    this.showMessage(msg);
}
myChess.isMyMove = function () {
    return parseInt($('.message').attr('isMyMove'));
}
function isCheckToMe(element) {
    //$.extend(true,{}, chess_board) => Deep Copy
    //$.extend({}, chess_board) => Shallow Copy
    var chessboard = $.extend(true, {}, chess_board), isCheck = false;
    //check present if moved
    //check can be broken if moved
    if (isCheckPresent(element)) {
        isCheck = !canCheckBeBroken(element);
    }
    chess_board = chessboard;
    return isCheck;
}
function isCheckPresent(element) {
    var elementPos = parseInt(element.container().attr('id')), steps = new Array(),
    index = elementPos > 0 ? parseInt(elementPos / 10) : 0, position = elementPos > 0 ? parseInt(elementPos % 10) : elementPos,
    kingPos = parseInt($('#' + element.identity() + '_king').parent().attr('id'));
    chess_board[index][position] = 0;
    $('.' + getOpponentIndentity()).each(function () {
        steps = $.merge(steps, getAllSteps(new chessElement($(this)), true));
    });
//    print('isCheck' + $.inArray(kingPos, steps.unique()));
//    print('king step :' + kingPos);
//    print('opp step :' + steps.unique().join(','));

    return ($.inArray(kingPos, steps.unique()) > 0);
}

function canCheckBeBroken(element) {
    var steps = new Array(), kingPos = parseInt($('#' + element.identity() + '_king').parent().attr('id'))
    $.each(getAllSteps(element, true), function (key, val) {
        var index = val > 0 ? parseInt(val / 10) : 0, position = val > 0 ? parseInt(val % 10) : val;
        chess_board[index][position] = element.name();
    });
    $('.' + getOpponentIndentity()).each(function () {
        var te = new chessElement($(this));
        if (isPresentOnBoard(te))
            steps = $.merge(steps, getAllSteps(te, true));
    });
    return $.inArray(kingPos, steps.unique()) <= 0;
}
function isCheckBreakingStep(step) {
    var steps = new Array(), kingPos = parseInt($('#' + myChess.myType + '_king').parent().attr('id'));
    
    $('.' + getOpponentIndentity()).each(function () {
        var te = new chessElement($(this));
        if (isPresentOnBoard(te))
            steps = $.merge(steps, getAllSteps(te, true));
    });
    return $.inArray(kingPos, steps.unique()) <= 0;

}
myChess.isCheck = function () {
    var kingPos = parseInt($('#' + this.myType + '_king').parent().attr('id')), steps = new Array();
    var chessboard = $.extend(true, {}, chess_board);
    $('.' + getOpponentIndentity()).each(function () {
        steps = $.merge(steps, getAllSteps(new chessElement($(this)), true));
    });
    chess_board = chessboard;
    return ($.inArray(kingPos, steps.unique()) > 0);
}
myChess.isCheckmate = function () {
    var canBreak = false, kingSteps = getAllStepsForKing(new chessElement($('#' + this.myType + '_king')), true);
    var chessboard = $.extend(true, {}, chess_board);
    if (this.isCheck()) {
        $('.' + this.myType).each(function (key, val) {
            if (canCheckBeBroken(new chessElement($(this)))) {
                canBreak = true;
            }
        });
    }
    chess_board = chessboard;
    //print(kingSteps.join(','));
    if (kingSteps.length > 0)
        canBreak = true;

    return !canBreak;
}
myChess.showMessage = function (msg) {
    $('.message').html(msg);
}
myChess.clearMessage = function () {
    $('.message').html('');
}

function getOpponentIndentity() {
    return myChess.myType == 'black' ? 'white' : 'black';
}
function isPresentOnBoard(element) {
    var id = parseInt(element.container().attr('id')),
        index = id > 0 ? parseInt(id / 10) : 0, position = id > 0 ? parseInt(id % 10) : id;
    return chess_board[index][position] == element.name();
}

function print(val) {
    console.log(val);
}

function showBoard() {
    foreach(chess_board, printBoard);
}

function printBoard(arr) {
    foreach(arr, print);
    print('\n');
}

var chessMsgs = {
    check : "You have a <b>Check</b> !",
    checkmate: "Checkmate !",
    opponentMove: "Opponent's move !",
    myMove : "Your move !"
}