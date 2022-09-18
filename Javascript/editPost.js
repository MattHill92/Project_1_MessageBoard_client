logout_link = document.getElementById("logout_link");
search_bar = document.getElementById("search_bar");
username_span = document.getElementById("displayed_username");
search_button = document.getElementById("search_button");

post_title = document.getElementById("post_title");
post_topic = document.getElementById("post_topic");
post_body = document.getElementById("post_body");
submit_button = document.getElementById("submit_button");

param_map = getParamMap(location.search);

submit_button.onclick = submitPost;

let user;
getUsername();
loadEditFromParams();











function loadEditFromParams(){
    if(param_map.get("title") != undefined){
        post_title.value = param_map.get("title").replaceAll('_', ' ');
    }
    if(param_map.get("topic") != undefined){
        post_topic.value = param_map.get("topic").replaceAll('_', ' ');
    }
    if(param_map.get("body") != undefined){
        post_body.innerText = param_map.get("body").replaceAll('_', ' ');
    }
}



function submitPost(){
    let inputPost = {
        id: -1,
        title: post_title.value,
        body: post_body.value,
        date: 1662361200000,
        view_count: 0,
        topic: post_topic.value,
        username: user.username
    }
    if (param_map.get("id") != undefined){
        console.log("button clicked");
        fetch("http://20.168.105.126:7070/post/"+param_map.get("id"), {
            method:'PUT',
            mode:'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body:JSON.stringify(inputPost)
        }).then(window.location = "view.html?id="+param_map.get("id"))
    }else{
        console.log("button clicked");
        fetch("http://20.168.105.126:7070/post", {
            method:'POST',
            mode:'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            body:JSON.stringify(inputPost)
        }).then(() => {
            fetch("http://20.168.105.126:7070/search/user/"+user.id).then(response => response.json()).then(response => window.location = "view.html?id="+response[0].post_id);
        })
    }
}



function getUsername(){
    fetch("http://20.168.105.126:7070/user", {
      headers: {
        'token':getCookie("token")
      }
    })
    .then(response => {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json().then(data => {
          user = data;
          console.log(user.username);
          username_span.innerText = data.username;
        });
      } else {
        return response.text().then(text => {
          navigateToLoginPage();
        });
      }
    });    
}

function navigateToLoginPage(){
    document.cookie = "token=null";
    let target = "login.html?from=edit";

  
    window.location = target;
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