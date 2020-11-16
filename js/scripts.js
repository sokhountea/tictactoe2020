var selectedDim = 0;
var disabled = false; //boolean for click event for overlay
var disabledCell = false;
var restarting = false; //boolean for if restarting whole game

var gameOptions, selectElement, dubSelectDimBox, dupList, dupOpt;
gameOptions = document.getElementsByClassName("gameOptions");

var started = false;
var currPlayer = 0;
var numMovesTotal = 0;
var winCombos = new Array();
var movesByX = new Array();
var movesByO = new Array();
var table = document.getElementById("table");

/* custom prompt */
function customPrompt() {
  /* function that takes in 3 parameters:
  dialog is the text shown in the box,
  func is the function to run when clicking OK,
  id is the given ID to change its inner HTML */
  this.render = function (dialog, id) {
    if (!disabled) {
      $("#dialogOverlay").show();
      $("#dialogBox").show();
      $("#dialogBody").html(dialog + '<br><input id="n">');
      $("#dialogFoot").html(
        "<button onclick=\"Prompt.ok('" + id +
        '\')">OK</button> <button onclick="Prompt.cancel()">Cancel</button>'
      );
    }
  }; /* hide the dialog if click cancel */
  this.cancel = function () {
    $("#dialogOverlay").hide();
    $("#dialogBox").hide();
  }; /* save name and hide the dialog if click OK */
  this.ok = function (id) {
    var n = $("#n").val();
    if (n.length > 15) $(id).addClass("nameTooBig");
    else $(id).removeClass("nameTooBig");
    $(id).html(n);
    $("#dialogOverlay").hide();
    $("#dialogBox").hide();
  };
} var Prompt = new customPrompt();

/* custom alert */
var node = document.createElement("DIV");
node.setAttribute("class", "fa fa-exclamation-circle");
function customAlert() {
  this.render = function (dialog) {
    $("#dialogOverlay").show();
    $("#dialogBox").show();
    $("#dialogTop").append(node);
    $("#dialogBody").html(dialog);
    $("#dialogFoot").html('<button onclick="Alert.close()">Close</button>');
  }; /* hide the dialog if click close */
  this.close = function () {
    $("#dialogOverlay").hide();
    $("#dialogBox").hide();
  };
} var Alert = new customAlert();

for (var i = 0; i < gameOptions.length; i++) {
  selectElement = gameOptions[i].getElementsByTagName("select")[0];
  /* create a <div> node for each item in the list that will act as the selected item */
  dubSelectDimBox = document.createElement("DIV");
  dubSelectDimBox.setAttribute("class", "selectedOpt");
  dubSelectDimBox.innerHTML =
    selectElement.options[selectElement.selectedIndex].innerHTML;
  gameOptions[i].appendChild(dubSelectDimBox);
  /* create a <div> node that will contain the option list */
  dupList = document.createElement("DIV");
  /* multiple classes seperated by a space */
  dupList.setAttribute("class", "selectOpts selectHide");
  for (var j = 1; j < selectElement.length; j++) {
    /* create a <div> node that will act as an option item */
    dupOpt = document.createElement("DIV");
    dupOpt.innerHTML = selectElement.options[j].innerHTML;
    dupOpt.addEventListener("click", function (e) {
      /* when an item is clicked, update the original select box, and the selected item: */
      var i, select, selected;
      select = this.parentNode.parentNode.getElementsByTagName("select")[0];
      selected = this.parentNode.previousSibling;
      for (i = 0; i < select.length; i++) {
        if (select.options[i].innerHTML == this.innerHTML) {
          selectedDim = i + 2;
          select.selectedIndex = i;
          selected.innerHTML = this.innerHTML;
          break;
        }
      }
      selected.click();
    });
    dupList.appendChild(dupOpt);
  }
  gameOptions[i].appendChild(dupList);
  dubSelectDimBox.addEventListener("click", function (e) {
    /* when the select box is clicked,
    close any other select boxes,
    and open/close the current select box */
    e.stopPropagation();
    $(this).next().toggleClass("selectHide");
  });
}
/* if user clicks anywhere outside the select box, then close all select boxes */
$(document).click(function () {
  $(".selectOpts").addClass("selectHide");
});

$("#startButton").click(start);

function start() {
  if (updateStartButton("restart") && !started) {
    whoStarts();
    setTimeout(displayEmptyBoard, 500);
    /* timeout to make sure board is created before starting the game */
    setTimeout(startGame, 5000);
  } else if (started) {
    options();
  }
}

/* change the text in the start button and returns whether the game is reading to start or not */
function updateStartButton(txt) {
  if (selectedDim < 3) {
    /* if no dimension selected, alert !!! */
    Alert.render("No dimension chosen!<br>");
    return false;
  } else {
    $("#startButton").html(txt);
  }
  if (!started && !restarting) {
    /* when game starts, can't change the dimension anymore */
    $(".selectedOpt").first().css("pointer-events", "none");
    return true;
  } else if (restarting) {
    $(".selectedOpt").first().css("pointer-events", "auto");
    restarting = false;
    return false;
  }
}

function displayEmptyBoard() {
  var idCounter = 1;
  /* reset scores */
  $("#score-X").html(0);
  $("#score-O").html(0);
  /* reset moves */
  movesByX = new Array();
  movesByO = new Array();
  numMovesTotal = 0;

  if (!started) {
    /* create a board with the selected dimension */
    for (var i = 0; i < selectedDim; i++) {
      var tr = table.insertRow();
      for (var j = 0; j < selectedDim; j++) {
        var td = tr.insertCell(j);
        $(td).css({
          "width": 500 / selectedDim + "px",
          "height": 500 / selectedDim + "px",
          "font-size": 300 / selectedDim + "px"
        });
        $(td).attr('id', idCounter++);
        $(td).html(" ");
      }
    }
  } else {
    /* restart whole game */
    $('#table').find('td').html(" ");
  }
}

/* determines who starts with coin toss, if 0 = player X, if 1 = player O */
function whoStarts() {
  var randomNum = document.getElementById("randomNum");
  if (!started) {
    disabled = true;
    $("#mainTxt").html("determining which player starts");
    $("#rule").html("if 0, " + $("#name-X").text() + " starts. if 1, " + $("#name-O").text() + " starts.");
    randomNum.innerHTML = 0;
    $("#overlay").attr("class", "visible");

    var max = Math.floor(Math.random() * (100 - 50) + 50);
    sleep(200 + (max * 60) / 3).then(() => {
      typeWriter("mainTxt", "...", 0, (max * 60) / 3, "add", 0);
    });

    sleep(200).then(() => {
      typeWriter("randomNum", "1", 0, 60, "sub", max);
    });

    sleep(800 + max * 60).then(() => {
      $("#firstPlayer").attr("class", "visible");
      if (randomNum.innerHTML.localeCompare("0") == 0) {
        $("#firstPlayer").html($("#name-X").text() + " starts!");
        currPlayer = 1;
      } else {
        $("#firstPlayer").html($("#name-O").text() + " starts!");
        currPlayer = -1;
      }
      $("#overlay").css({ pointerEvents: "auto" })
      changeHover();
      disabled = false;
    });

    /* remove overlay by clicking anywhere on the screen*/
    $("#overlay").click(function () {
      sleep(150).then(() => {
        if (!disabled) {
          $("#overlay").attr("class", "hidden");
          $("#firstPlayer").attr("class", "hidden");
          $("#overlay").children().html(" ");
        }
      });
    });
  }
}

/* function to sleep */
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/* type letters one by one */
function typeWriter(id, text, i, speed, mode, max) {
  if (i < text.length && mode.localeCompare("add") == 0) {
    /* adding text */
    document.getElementById(id).innerHTML += text.charAt(i);
    i++;
    setTimeout(typeWriter, speed, id, text, i, speed, mode, max);
  } else if (i < max && mode.localeCompare("sub") == 0) {
    /* substitute text */
    if (document.getElementById(id).innerHTML.localeCompare("0") == 0) {
      document.getElementById(id).innerHTML = text;
      i++;
      setTimeout(typeWriter, speed, id, "0", i, speed, mode, max);
    } else {
      document.getElementById(id).innerHTML = text;
      i++;
      setTimeout(typeWriter, speed, id, "1", i, speed, mode, max);
    }
  }
}

/* load answers depending on the selected dimension */
function loadAnswers() {
  if (selectedDim == 3) {
    winCombos = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
      [1, 5, 9],
      [3, 5, 7]
    ];
  } else if (selectedDim == 4) {
    winCombos = [
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10, 11, 12],
      [13, 14, 15, 16],
      [1, 5, 9, 13],
      [2, 6, 10, 14],
      [3, 7, 11, 15],
      [4, 8, 12, 16],
      [1, 6, 11, 16],
      [4, 7, 10, 13]
    ];
  } else if (selectedDim == 5) {
    winCombos = [
      [1, 2, 3, 4, 5],
      [6, 7, 8, 9, 10],
      [11, 12, 13, 14, 15],
      [16, 17, 18, 19, 20],
      [21, 22, 23, 24, 25],
      [1, 6, 11, 16, 21],
      [2, 7, 12, 17, 22],
      [3, 8, 13, 18, 23],
      [4, 9, 14, 19, 24],
      [5, 10, 15, 20, 25],
      [1, 7, 13, 19, 25],
      [5, 9, 13, 17, 21]
    ];
  }
}

function startGame() {
  loadAnswers();
  started = true;
  $('#table').find('td').click(handler);
}

/* changes cell's hover depending on whose turn */
function changeHover() {
  const tds = document.querySelectorAll("td");
  var color;
  if (currPlayer == 1) {
    color = "#ffe0ac";
  } else {
    color = "#ffacb7";
  }
  tds.forEach((td) => {
    td.style.setProperty("--td-background-color", color);
  });
}

/* handles the function that executes when clicking on one of the cells*/
function handler() {
  sleep(50).then(() => {
    /* if cell is empty && if num of total moves doesnt exceed the num of possible moves */
    if ($(this).text() == " " && numMovesTotal < selectedDim * selectedDim && !disabledCell) {
      disabledCell = true;
      if (currPlayer == 1) {
        movesByX.push(parseInt(this.id));
        movesByX.sort(function (a, b) {
          return a - b;
        });
        $(this).html("X");
      } else {
        movesByO.push(parseInt(this.id));
        movesByO.sort(function (a, b) {
          return a - b;
        });
        $(this).html("O");
      }
      /* check whether the last move resulted in a win */
      if (checkForWin() && numMovesTotal > selectedDim) {
        if (currPlayer == 1) {
          document.getElementById("score-X").innerHTML++;
          overlayMsg($("#name-X").text() + " won!");
        } else {
          document.getElementById("score-O").innerHTML++;
          overlayMsg($("#name-O").text() + " won!");
        }
        setTimeout(restartARound, 1050);
      } else {
        currPlayer = -currPlayer;
        numMovesTotal++;
        changeHover();
      }
    }
    /* stop round if reached maximum number of total moves*/
    if (numMovesTotal == selectedDim * selectedDim) {
      overlayMsg("it's a tie!");
      sleep(1050).then(() => {
        restartARound();
      });
    }
    sleep(700).then(() => {
      disabledCell = false;
    });
  });
}

/* displays an overlay with a message */
function overlayMsg(txt) {
  sleep(600).then(() => {
    $("#overlay").attr("class", "visible");
  });
  $("#randomNum").html(txt);
}

function restartWholeGame() {
  /* restarts the whole game and let select a new dimension */
  this.yes = function () {
    disabled = false;
    started = false;
    restarting = true;
    updateStartButton("let's start!");
    $("#changeDim").attr("class", "hidden");
    $("#overlay").attr("class", "hidden");
  };
  this.no = function () {
    /* restarts the whole game with the same dimension */
    disabled = false;
    started = false;
    start();
    $("#changeDim").attr("class", "hidden");
  };
} var RestartGame = new restartWholeGame();

/* restart a single round */
function restartARound() {
  movesByX = new Array();
  movesByO = new Array();
  numMovesTotal = 0;
  /* clear the table */
  $('#table').find('td').html(" ");
}

/* checks if the playing member won and returns if detected win or not */
function checkForWin() {
  var win = false;
  var moves = new Array();

  if (currPlayer == 1) moves = movesByX;
  else if (currPlayer == -1) moves = movesByO;

  var i, n, count;
  if (moves.length >= selectedDim) {
    OUTER_LOOP: for (i = 0; i < winCombos.length; i++) {
      var set = winCombos[i];
      count = 0;
      n = 0;
      while (n < moves.length) {
        if (set.includes(moves[n])) {
          count++;
        }
        n++;
        if (count == selectedDim) {
          win = true;
          break OUTER_LOOP;
        }
      }
    }
  }
  return win;
}

function options() {
  sleep(500).then(() => {
    $("#overlay").attr("class", "visible");
  });
  $("#restart-round").html("restart round");
  $("#restart-round").css({ "cursor": "pointer" });
  $("#restart-game").html("restart game");
  $("#restart-game").css({ "cursor": "pointer" });
  $("#restart-round").click(restartARound);
  $("#restart-game").click(function () {
    /* reset scores */
    $("#score-X").html("0");
    $("#score-O").html("0");
    /* removing whole board */
    sleep(1000).then(() => {
      table.textContent = "";
    });
    $("#restart-round").html("");
    $("#restart-game").html("");
    disabled = true;
    $("#changeDim").html(
      'change dimension?<br><div onclick="RestartGame.yes()" style="cursor:pointer;"><em>yes</em></div> <div onclick="RestartGame.no()" style="cursor:pointer;"><em>no</em></div>'
    );
    $("#changeDim").attr("class", "visible");
  });
}