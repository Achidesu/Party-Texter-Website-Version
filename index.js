function print() {
    let Strategy_name = document.getElementById('Strategy-Name').value;
    console.log(Strategy_name);
    gen_text();
}

function gen_text() {
    let Strategy_name = document.getElementById('Strategy-Name').value;
    let Strategy_link = document.getElementById('Strategy-Link').value;
    let Strategy_name_final = "Hosting " + Strategy_name;
    let Strategy_link_final = "Strategy Link : **" + Strategy_link + "**";
    let Player_1, Player_2, Player_3, Player_4;

    // will create function for this

    if (Strategy_name == "") {
        window.alert("Please fill the Strategy Name");
        return false;
    }

    if (Strategy_link == "") {
        window.alert("Please fill the Strategy link");
        return false;
    }


    if (document.getElementById('Player-1').checked == true) {
        Player_1 = "Player 1 : Closed :red_circle:";
    }
    else if (document.getElementById('Player-1').checked == false) {
        Player_1 = "Player 1 : Open :green_circle:";
    }

    if (document.getElementById('Player-2').checked == true) {
        Player_2 = "Player 2 : Closed :red_circle:";
    }
    else if (document.getElementById('Player-2').checked == false) {
        Player_2 = "Player 2 : Open :green_circle:";
    }

    if (document.getElementById('Player-3').checked == true) {
        Player_3 = "Player 3 : Closed :red_circle:";
    }
    else if (document.getElementById('Player-3').checked == false) {
        Player_3 = "Player 3 : Open :green_circle:";
    }

    if (document.getElementById('Player-4').checked == true) {
        Player_4 = "Player 4 : Closed :red_circle:";
    }
    else if (document.getElementById('Player-4').checked == false) {
        Player_4 = "Player 4 : Open :green_circle:";
    }

    let final = Strategy_name_final + "\n" + Strategy_link_final + "\n" + Player_1 + "\n" + Player_2 + "\n" + Player_3 + "\n" + Player_4;
    document.getElementById('output-1').innerHTML = final.replace(/\n/g, "<br>");
}