function getInitializedArea(){
    const area_width = 5;
    let area = [];
    for(let i = 0; i < area_width; i++){
        area.push([]);
        for(let j = 0; j < area_width; j++) {
            area[i].push([]);
            for(let k = 0; k < area_width; k++){
                area[i][j].push([]);
                for(let l = 0; l < area_width; l++){
                    area[i][j][k].push(null);
                }
            }
        }
    }
    return area;
}

class Game{
    constructor(player0_name, player1_name, start_time, timer_interval){
        this.area = getInitializedArea();
        this.current_player = Math.random() % 2 === 0 ? 0 : 1;
        this.player_names = [player0_name, player1_name];
        this.start_time = start_time;
        this.timer_interval = timer_interval;
    }

    setStone(dim0, dim1, dim2, dim3){
        dim0 = parseInt(dim0);
        dim1 = parseInt(dim1);
        dim2 = parseInt(dim2);
        dim3 = parseInt(dim3);
        this.area[dim0 + 2][dim1 + 2][dim2 + 2][dim3 + 2] = this.current_player;
    }

    changeCurrentPlayer(){
        this.current_player = this.current_player === 0 ? 1 : 0;
    }

    checkGameEnd(){

    }
}

function updateTimer(start_time){
    const timer_h = document.getElementById("timer_h");
    const timer_m = document.getElementById("timer_m");
    const timer_s = document.getElementById("timer_s");

    let diff_time = (new Date().getTime() - start_time) / 1000;
    timer_h.innerText = Math.floor(diff_time / 3600).toString().padStart(2, '0');
    diff_time %= 3600;
    timer_m.innerText = Math.floor(diff_time / 60).toString().padStart(2, '0');
    diff_time %= 60;
    timer_s.innerText = Math.floor(diff_time).toString().padStart(2, '0');
}

function isBlank(str){
    return str === "" || !str.match(/\S/g);
}

let game;
function initGame(){
    let player0_name = document.getElementById("player0_name").value;
    let player1_name = document.getElementById("player1_name").value;
    player0_name = isBlank(player0_name) ? "player1" : player0_name;
    player1_name = isBlank(player1_name) ? "player2" : player1_name;

    const start_time = new Date().getTime();
    const timer_interval = setInterval(updateTimer, 1000, start_time);

    game = new Game(player0_name, player1_name, start_time, timer_interval)

    startGame();
}

function startGame(){
    const init_div = document.getElementById("init_div");
    document.body.removeChild(init_div);

    const player0_history_label = document.getElementById("player0_history_label");
    const player1_history_label = document.getElementById("player1_history_label");
    player0_history_label.innerText = game.player_names[0];
    player1_history_label.innerText = game.player_names[1];

    const game_div = document.getElementById("game_div");
    game_div.style.opacity = "1";

    initTurn();
}

function endGame(){
    clearInterval(game.timer_interval);

    const game_div = document.getElementById("game_div");
    const controller_div = document.getElementById("controller_div");
    game_div.removeChild(controller_div);

    const turn_label = document.getElementById("turn_label");
    turn_label.innerText = `${game.player_names[game.current_player]} win!!`;
}

function initTurn(){
    const turn_label = document.getElementById("turn_player_label");
    turn_label.innerText = game.player_names[game.current_player];
}

function playTurn(){
    const dim0 = document.getElementById("dim0").value;
    const dim1 = document.getElementById("dim1").value;
    const dim2 = document.getElementById("dim2").value;
    const dim3 = document.getElementById("dim3").value;

    game.setStone(dim0, dim1, dim2, dim3);

    const player_ol = document.getElementById(`player${game.current_player}_history_ol`);
    const new_li = document.createElement("li");
    new_li.innerHTML = `(<span class='${"color" + dim0.toString()}'>${dim0}</span>, <span class='${"color" + dim1.toString()}'>${dim1}</span>, <span class='${"color" + dim2.toString()}'>${dim2}</span>, <span class='${"color" + dim3.toString()}'>${dim3}</span>)`;
    player_ol.appendChild(new_li);

    if(game.checkGameEnd()){
        endGame();
    }else{
        game.changeCurrentPlayer();
    }
}

function exportGame(){
    let export_json = {};
    export_json["histories"] = {
        "player0": [],
        "player1": []
    };
    const player0_li_list = document.getElementById("player0_history_ol").children;
    const player1_li_list = document.getElementById("player1_history_ol").children;
    for(let i = 0; i < player0_li_list.length; i++){
        let dims_text = player0_li_list[i].innerText;
        dims_text = dims_text.replace("(", "").replace(")", "");
        let dims =dims_text .split(", ");
        export_json["histories"]["player0"].push(dims);
    }
    for(let i = 0; i < player1_li_list.length; i++){
        let dims_text = player1_li_list[i].innerText;
        dims_text = dims_text.replace("(", "").replace(")", "");
        let dims =dims_text .split(", ");
        export_json["histories"]["player1"].push(dims);
    }

    export_json["current_player"] = game.current_player;
    export_json["player_names"] = game.player_names;
    export_json["spent_time"] = new Date().getTime() - game.start_time;
    const blob = new Blob([JSON.stringify(export_json)], {"type": "text/plane"});

    const export_button = document.getElementById("export_button");
    export_button.href = window.URL.createObjectURL(blob);
}

function importGame(){
    const import_json = document.getElementById("import_json");
    const json_file = import_json.files[0];
    json_file.text().then(text => {
        const imported_data = JSON.parse(text);

        const histories = imported_data["histories"];
        const current_player = imported_data["current_player"];
        const player_names = imported_data["player_names"];

        const spent_time = imported_data["spent_time"];
        const start_time = new Date().getTime() - spent_time;
        const timer_interval = setInterval(updateTimer, 1000, start_time);

        game = new Game(player_names[0], player_names[1], start_time, timer_interval);
        console.log(game.area);

        const player0_ol = document.getElementById(`player0_history_ol`);
        const player1_ol = document.getElementById(`player1_history_ol`);
        for(let i = 0; i < histories["player0"].length; i++){
            let dim0 = histories["player0"][i][0];
            let dim1 = histories["player0"][i][1];
            let dim2 = histories["player0"][i][2];
            let dim3 = histories["player0"][i][3];

            game.current_player = 0;
            game.setStone(dim0, dim1, dim2, dim3);

            let new_li = document.createElement("li");
            new_li.innerHTML = `(<span class='${"color" + dim0.toString()}'>${dim0}</span>, <span class='${"color" + dim1.toString()}'>${dim1}</span>, <span class='${"color" + dim2.toString()}'>${dim2}</span>, <span class='${"color" + dim3.toString()}'>${dim3}</span>)`;
            player0_ol.appendChild(new_li);
        }
        for(let i = 0; i < histories["player1"].length; i++){
            let dim0 = histories["player1"][i][0];
            let dim1 = histories["player1"][i][1];
            let dim2 = histories["player1"][i][2];
            let dim3 = histories["player1"][i][3];

            game.current_player = 1;
            game.setStone(dim0, dim1, dim2, dim3);

            let new_li = document.createElement("li");
            new_li.innerHTML = `(<span class='${"color" + dim0.toString()}'>${dim0}</span>, <span class='${"color" + dim1.toString()}'>${dim1}</span>, <span class='${"color" + dim2.toString()}'>${dim2}</span>, <span class='${"color" + dim3.toString()}'>${dim3}</span>)`;
            player1_ol.appendChild(new_li);
        }

        game.current_player = current_player;
        startGame();
    })
}