
confirm_div = document.getElementById("confirm");
register_button = document.getElementById("register");
login_button = document.getElementById("login");
new_account_link = document.getElementById("new_account");
back_link = document.getElementById("back");

username_input = document.getElementById("username_input");
password_input = document.getElementById("password_input");
confirm_input = document.getElementById("confirm_input");

error_message = document.getElementById("message");

new_account_link.onclick = showRegisterControls;
back_link.onclick = hideRegisterControls;

login_button.onclick = attemptLogin;
register_button.onclick = attemptRegister;


param_map = getParamMap(location.search);




function showRegisterControls(){
    login_button.classList.add("hide");
    new_account_link.classList.add("hide");
    confirm_div.classList.remove("hide");
    register_button.classList.remove("hide");
    back_link.classList.remove("hide");
    return false;
}

function hideRegisterControls(){
    login_button.classList.remove("hide");
    new_account_link.classList.remove("hide");
    confirm_div.classList.add("hide");
    register_button.classList.add("hide");
    back_link.classList.add("hide");
    return false;
}

async function attemptLogin(){
    let inputUser = {
        id:-1,
        username:username_input.value,
        password:password_input.value,
        salt:"*****"
    }
    console.log("button clicked");
    fetch("http://20.168.105.126:7070/login", {
        method:'POST',
        mode:'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
        body:JSON.stringify(inputUser)
    })
    .then(response => response.text())
    .then(response => {
        if (response.length > 0){
            document.cookie = "token="+response
            returnToPage();
        } else {
            error_message.innerText = "login failed";
            error_message.classList.remove("invisible")
        }
    })
}

async function attemptRegister(){
    if (password_input.value != confirm_input.value){
        error_message.classList.remove("invisible")
        error_message.innerText = "passwords do not match"
        return;
    }
    let inputUser = {
        id:-1,
        username:username_input.value,
        password:password_input.value,
        salt:"*****"
    }
    console.log("button clicked");
    fetch("http://20.168.105.126:7070/register", {
        method:'POST',
        mode:'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
        body:JSON.stringify(inputUser)
    })
    .then(response => response.text())
    .then(response => {
        if (response == "username taken"){
            error_message.innerText = "username taken";
            error_message.classList.remove("invisible")
        } else {
            document.cookie = "token="+response
            returnToPage();
        }
    })
}


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }


  function getParamMap(params){
    map = new Map();
    arr = params.substr(1).split("&");
    arr.forEach(element => {
      sp = element.split("=");
      map.set(sp[0], sp[1]);
    })
    return map;
  }

function returnToPage(){
    if (param_map.get("from") == "search"){
        let target = "index.html?from=search";
        if (param_map.get("type") != undefined)
            target = target+"&type="+param_map.get("type");
        if (param_map.get("search") != undefined)
            target = target+"&search="+param_map.get("search");
        window.location = target;
    }
    else if (param_map.get("from") == "view"){
        window.location = "view.html?id="+ param_map.get("id");
    }
    else {
        window.location = "index.html";
    }
}