const AREA_WIDTH = 5;
let game;

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

function isDimsOnArea(dims){
    const dim0_check = dims[0] >= 0 && dims[0] < AREA_WIDTH;
    const dim1_check = dims[1] >= 0 && dims[1] < AREA_WIDTH;
    const dim2_check = dims[2] >= 0 && dims[2] < AREA_WIDTH;
    const dim3_check = dims[3] >= 0 && dims[3] < AREA_WIDTH;
    return dim0_check && dim1_check && dim2_check && dim3_check;
}

function addDimsValue(dims, add_value, ope){
    for(let i = 0; i < AREA_WIDTH; i++){
        dims[i] += ope * add_value[i];
    }
    return dims;
}

function dimsToIndex(dims){
    dims = dims.slice()
    dims[0] += 2;
    dims[1] += 2;
    dims[2] += 2;
    dims[3] += 2;
    return dims;
}

class Area{
    constructor(){
        this.value = this.getInitializedArea();
    }

    getInitializedArea(){
        let area = [];
        for(let i = 0; i < AREA_WIDTH; i++){
            area.push([]);
            for(let j = 0; j < AREA_WIDTH; j++) {
                area[i].push([]);
                for(let k = 0; k < AREA_WIDTH; k++){
                    area[i][j].push([]);
                    for(let l = 0; l < AREA_WIDTH; l++){
                        area[i][j][k].push(null);
                    }
                }
            }
        }
        return area;
    }
}

class Game{
    constructor(player0_name, player1_name, start_time, timer_interval){
        this.area = new Area();
        this.current_player = Math.random() % 2 === 0 ? 0 : 1;
        this.player_names = [player0_name, player1_name];
        this.start_time = start_time;
        this.timer_interval = timer_interval;
    }

    checkCanSetStone(dims){
        dims = dimsToIndex(dims);
        return this.area.value[dims[0]][dims[1]][dims[2]][dims[3]] === null;
    }

    setStone(dims){
        dims = dimsToIndex(dims);
        this.area.value[dims[0]][dims[1]][dims[2]][dims[3]] = this.current_player;
    }

    changeCurrentPlayer(){
        this.current_player = this.current_player === 0 ? 1 : 0;
    }

    checkLine(dims, add_value){
        const ope_list = [1, -1];
        for(let i = 0; i < 2; i++){
            while(isDimsOnArea(addDimsValue(dims, add_value))){
                dims = addDimsValue(dims, add_value, ope_list[i]);
                if(this.area.value[dims[0]][dims[1]][dims[2]][dims[3]] !== this.current_player && this.area.value[dims[0]][dims[1]][dims[2]][dims[3]] !== 2) return false;
            }
        }
        return true;
    }

    checkGameEnd(dims){
        dims = dimsToIndex(dims);
        const add_values = [
            [1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [1, 1, 0, 0], [-1, 1, 0, 0],
            [1, 1, 1, 0], [-1, 1, 1, 0], [1, -1, 1, 0], [-1, -1, 1, 0],

        ];

        for(let i = 0; i < add_values.length; i++){
            if(this.checkLine(add_values[i])) return true;
        }

        return false;
    }
}

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
    if(game.area.value[0][0][0][0] !== 2){
        game.area.value[0][0][0][0] = 2;
        setHistory(0, [0, 0, 0, 0]);
        setHistory(1, [0, 0, 0, 0]);
    }

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

function setHistory(current_player, dims){
    const player_ol = document.getElementById(`player${current_player}_history_ol`);
    let new_li = document.createElement("li");
    new_li.innerHTML = `(<span class='${"color" + dims[0].toString()}'>${dims[0]}</span>, <span class='${"color" + dims[1].toString()}'>${dims[1]}</span>, <span class='${"color" + dims[2].toString()}'>${dims[2]}</span>, <span class='${"color" + dims[3].toString()}'>${dims[3]}</span>)`;
    player_ol.appendChild(new_li);
}

function initTurn(){
    const turn_label = document.getElementById("turn_player_label");
    turn_label.innerText = game.player_names[game.current_player];
}

function playTurn(){
    const error_text = document.getElementById("error_text");
    error_text.style.opacity = "0";

    const dim0 = parseInt(document.getElementById("dim0").value);
    const dim1 = parseInt(document.getElementById("dim1").value);
    const dim2 = parseInt(document.getElementById("dim2").value);
    const dim3 = parseInt(document.getElementById("dim3").value);
    const dims = [dim0, dim1, dim2, dim3];

    if(game.checkCanSetStone(dims)){
        game.setStone(dims);
    }else{
        error_text.style.opacity = "1";
        return;
    }

    setHistory(game.current_player, dims);

    if(game.checkGameEnd(dims)){
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
    for(let j = 0; j < 2; j++){
        let player_li_list = document.getElementById(`player${j}_history_ol`).children;
        for(let i = 0; i < player_li_list.length; i++){
            let dims_text = player_li_list[i].innerText;
            dims_text = dims_text.replace("(", "").replace(")", "");
            let dims =dims_text .split(", ");
            export_json["histories"][`player${j}`].push(dims);
        }
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

        for(let j = 0; j < 2; j++){
            for(let i = 0; i < histories[`player${j}`].length; i++){
                let dim0 = histories[`player${j}`][i][0];
                let dim1 = histories[`player${j}`][i][1];
                let dim2 = histories[`player${j}`][i][2];
                let dim3 = histories[`player${j}`][i][3];
                let dims = [dim0, dim1, dim2, dim3];

                game.current_player = j;
                game.setStone(dims);

                setHistory(game.current_player, dims);
            }
        }

        game.current_player = current_player;
        startGame();
    })
}