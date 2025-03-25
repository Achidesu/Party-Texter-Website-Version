const Submit = document.getElementById('Submit');
const Clear = document.getElementById('Clear');
const Copy = document.getElementById('Copy');

let Player_1, Player_2, Player_3, Player_4;
let Player_status = [9];
let Player = {};

Submit.onclick = function print() {
        gen_text();
    }

Clear.onclick = function clear() {
    document.getElementById('Strategy-Name').value = "";
    document.getElementById('Strategy-Link').value = "";
    document.getElementById('Requirements').value = "";
    document.getElementById('output-1').innerHTML = "";
    for (let i = 1; i <= 4; i++) {
        let playercheckbox_id = document.getElementById('Player-'+i);
        playercheckbox_id.checked = false;
    }
    console.log("[Debug] : Cleared!");
}

Copy.onclick = function copy() {
    let text = document.getElementById('output-1').innerText;
    navigator.clipboard.writeText(text).then(function() {
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        console.error('Async: Could not copy text: ', err);
    });
    window.alert("Text has been copied!");
    console.log("[Debug] : Copied!");
}

function gen_text() {
    let Strategy_name = document.getElementById('Strategy-Name').value;
    let Strategy_link = document.getElementById('Strategy-Link').value;
    let Hosting_Requirements = document.getElementById('Requirements').value;
    let Strategy_name_final = `Hosting ${Strategy_name}`;
    let Strategy_link_final = `Strategy Link : **${Strategy_link}**`;
    let Hosting_Requirements_final = `Requirements : ${Hosting_Requirements}`;
    
    if (Hosting_Requirements == "") {
        Hosting_Requirements_final = ``;
    }

    if (Strategy_name == "") {
        window.alert("Please fill the Strategy Name");
        console.log("[Debug] : Strategy Name is empty!");
        console.log("[Debug] : Text generation failed!");
        return false;
    }

    if (Strategy_link == "") {
        window.alert("Please fill the Strategy link");
        console.log("[Debug] : Strategy Link is empty!");
        console.log("[Debug] : Text generation failed!");
        return false;
    }

    check_player();

    for (let i=0; i<=Player_status.length; i++) {
        if (Player_status[i] == 1) {
            Player["Player_" + (i)] = `Player ${i} : Closed :red_circle:`;
        }
        else if (Player_status[i] == 0) {
            Player["Player_" + (i)] = `Player ${i} : Open :green_circle:`;
        }
    }

    let final = Strategy_name_final + "\n" + Strategy_link_final + "\n" + Player.Player_1 + "\n" + Player.Player_2 + "\n" + Player.Player_3 + "\n" + Player.Player_4 + "\n" + Hosting_Requirements_final;
    document.getElementById('output-1').innerHTML = final.replace(/\n/g, "<br>");
}

function check_player(){
    Player_status = [9];
    for (let i = 1; i <= 4; i++) {
        let playercheckbox_id = document.getElementById('Player-'+i);
        
        if (playercheckbox_id.checked == true) {
            console.log(`Player ${i} is ready!`);
            Player_status.push(1);
        }
        else if (playercheckbox_id.checked == false) {
            console.log(`Player ${i} is NOT ready!`);
            Player_status.push(0);
        }
    }

    console.log(Player_status);

}

