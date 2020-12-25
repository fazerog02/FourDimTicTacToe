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

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function isPositionOnArea(position){
    const x_check = position[0] >= 0 && position[0] < AREA_WIDTH;
    const y_check = position[1] >= 0 && position[1] < AREA_WIDTH;
    const z_check = position[2] >= 0 && position[2] < AREA_WIDTH;
    const w_check = position[3] >= 0 && position[3] < AREA_WIDTH;
    return x_check && y_check && z_check && w_check;
}

function addPositionValue(position, add_value, ope){
    position = position.slice();
    for(let i = 0; i < 4; i++){
        position[i] += ope * add_value[i];
    }
    return position;
}

function positionToIndex(position){
    position = position.slice()
    position[0] += 2;
    position[1] += 2;
    position[2] += 2;
    position[3] += 2;
    return position;
}

function isIncludes(ary_includes_ary, target_ary){
    let correct_count = 0;
    if(ary_includes_ary.length <= 0) return false;
    for(let i = 0; i < ary_includes_ary.length; i++){
        correct_count = 0;
        for(let j = 0; j < ary_includes_ary[i].length; j++){
            if(ary_includes_ary[i][j] === target_ary[j]) correct_count++;
        }
        if(correct_count === target_ary.length) return true;
    }
    return false;
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
        this.current_player = getRandomIntInclusive(0, 1);
        this.player_names = [player0_name, player1_name];
        this.start_time = start_time;
        this.timer_interval = timer_interval;
    }

    checkCanSetStone(position){
        position = positionToIndex(position);
        return this.area.value[position[0]][position[1]][position[2]][position[3]] === null;
    }

    setStone(position){
        position = positionToIndex(position);
        this.area.value[position[0]][position[1]][position[2]][position[3]] = this.current_player;
    }

    getNotCurrentPlayer(){
        return this.current_player === 0 ? 1 : 0;
    }

    changeCurrentPlayer(){
        this.current_player = this.current_player === 0 ? 1 : 0;
    }

    checkLine(position, add_value){
        position = position.slice();
        const position_origin = position.slice();
        let correct_count = 1;
        const ope_list = [1, -1];
        for(let i = 0; i < 2; i++){
            position = position_origin;
            while(isPositionOnArea(addPositionValue(position, add_value, ope_list[i]))){
                position = addPositionValue(position, add_value, ope_list[i]);
                if(this.area.value[position[0]][position[1]][position[2]][position[3]] === this.current_player || this.area.value[position[0]][position[1]][position[2]][position[3]] === 2){
                    correct_count++;
                }else{
                    break;
                }
            }
        }
        return correct_count === AREA_WIDTH;
    }

    checkGameEnd(position){
        position = positionToIndex(position);
        const add_value_elements = [1, 0, -1];
        const add_values = [];
        for(let i = 0; i < 3; i++){
            for(let j = 0; j < 3; j++){
                for(let k = 0; k < 3; k++){
                    for(let l = 0; l < 3; l++){
                        let x = add_value_elements[i];
                        let y = add_value_elements[j];
                        let z = add_value_elements[k];
                        let w = add_value_elements[l];
                        if(
                            !(x === 0 && y === 0 && z === 0 && w === 0) &&
                            !isIncludes(add_values, [-1*x, -1*y, -1*z, -1*w])
                        ) add_values.push([x, y, z, w]);
                    }
                }
            }
        }

        for(let i = 0; i < add_values.length; i++){
            if(this.checkLine(position, add_values[i])) return true;
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
    if(game.area.value[2][2][2][2] !== 2){
        game.area.value[2][2][2][2] = 2;
        setHistory(0, [0, 0, 0, 0]);
        setHistory(1, [0, 0, 0, 0]);
    }

    const init_div = document.getElementById("init_div");
    document.body.removeChild(init_div);

    const player0_label = document.getElementById("player0_label");
    const player1_label = document.getElementById("player1_label");
    player0_label.innerText = game.player_names[0];
    player1_label.innerText = game.player_names[1];

    const game_div = document.getElementById("game_div");
    game_div.style.opacity = "1";

    initTurn();
}

function endGame(){
    clearInterval(game.timer_interval);

    const game_div = document.getElementById("game_div");
    const controller_div = document.getElementById("controller_div");
    game_div.removeChild(controller_div);

    const player_label = document.getElementById(`player${game.current_player}_label`);
    player_label.innerHTML= `${game.player_names[game.current_player]} win!`;
}

function setHistory(current_player, position){
    const player_ol = document.getElementById(`player${current_player}_history_ol`);
    let new_li = document.createElement("li");
    new_li.innerHTML = `(<span class='${"color" + position[0].toString()}'>${position[0]}</span>, <span class='${"color" + position[1].toString()}'>${position[1]}</span>, <span class='${"color" + position[2].toString()}'>${position[2]}</span>, <span class='${"color" + position[3].toString()}'>${position[3]}</span>)`;
    player_ol.appendChild(new_li);
}

function initTurn(){
    const turn_player_label = document.getElementById(`player${game.current_player}_label`);
    const not_turn_player_label = document.getElementById(`player${game.getNotCurrentPlayer()}_label`);
    turn_player_label.style.zIndex = "100";
    turn_player_label.style.transform = "scale(1.2, 1.2) skew(15deg, 0)";
    not_turn_player_label.style.zIndex = "10";
    not_turn_player_label.style.transform = "skew(15deg, 0)";
}

function getPositionFromController(){
    const x = document.getElementById("x");
    const y = document.getElementById("y");
    const z = document.getElementById("z");
    const w = document.getElementById("w");

    let pos_x, pos_y, pos_z, pos_w;
    for(let i = 0; i < x.children.length; i++){
        let input_element = x.children[i].children[0];
        if(input_element.checked === true) pos_x = parseInt(input_element.value);
    }
    for(let i = 0; i < y.children.length; i++){
        let input_element = y.children[i].children[0];
        if(input_element.checked === true) pos_y = parseInt(input_element.value);
    }
    for(let i = 0; i < z.children.length; i++){
        let input_element = z.children[i].children[0];
        if(input_element.checked === true) pos_z = parseInt(input_element.value);
    }
    for(let i = 0; i < w.children.length; i++){
        let input_element = w.children[i].children[0];
        if(input_element.checked === true) pos_w = parseInt(input_element.value);
    }

    return [pos_x, pos_y, pos_z, pos_w];
}

function playTurn(){
    const error_text = document.getElementById("error_text");
    error_text.style.opacity = "0";

    const position = getPositionFromController();

    if(game.checkCanSetStone(position)){
        game.setStone(position);
    }else{
        error_text.style.opacity = "1";
        return;
    }

    setHistory(game.current_player, position);

    if(game.checkGameEnd(position)){
        endGame();
    }else{
        game.changeCurrentPlayer();
        initTurn();
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
            let position_text = player_li_list[i].innerText;
            position_text = position_text.replace("(", "").replace(")", "");
            let position =position_text .split(", ");
            export_json["histories"][`player${j}`].push(position);
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

        let is_game_end = false;
        for(let j = 0; j < 2; j++){
            for(let i = 0; i < histories[`player${j}`].length; i++){
                let x = parseInt(histories[`player${j}`][i][0]);
                let y = parseInt(histories[`player${j}`][i][1]);
                let z = parseInt(histories[`player${j}`][i][2]);
                let w = parseInt(histories[`player${j}`][i][3]);
                let position = [x, y, z, w];

                game.current_player = j;
                game.setStone(position);
                console.log(game.checkGameEnd(position));
                if(game.checkGameEnd(position)) is_game_end = true;

                setHistory(game.current_player, position);
            }
        }

        game.current_player = current_player;
        game.area.value[2][2][2][2] = 2;
        startGame();
        if(is_game_end) endGame();
    })
}