logout_link = document.getElementById("logout_link");
search_bar = document.getElementById("search_bar");
username_span = document.getElementById("displayed_username");
results_div = document.getElementById("results");
search_button = document.getElementById("search_button")
create_button = document.getElementById("create_button")

logout_link.onclick = navigateToLoginPage;
search_button.onclick = searchPosts;
create_button.onclick = () => {window.location = "editPost.html"}
param_map = getParamMap(location.search);

let user;
getUsername();

result_template = document.getElementById("result");





function navigateToLoginPage(){
  document.cookie = "token=null";
  let target = "login.html?from=search";
  if (param_map.get("type") != undefined)
    target = target+"&type="+param_map.get("type");
  if (param_map.get("search") != undefined)
    target = target+"&search="+param_map.get("search");

  window.location = target;
}

function getUsername(){
  fetch("http://127.0.0.1:7070/user", {
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
        fetchPosts();
      });
    } else {
      return response.text().then(text => {
        navigateToLoginPage();
      });
    }
  });    
}


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetchPosts(){
  let path = "http://127.0.0.1:7070/search/recent";

  if (param_map.get("search") == undefined || param_map.get("search") == "recent"){
    path = "http://127.0.0.1:7070/search/recent"
  }else if (param_map.get("type") == "title"){
    path = "http://127.0.0.1:7070/search/title/"+param_map.get("search");
  }else if (param_map.get("search") == "myposts"){
    path = "http://127.0.0.1:7070/search/user/"+user.id;
  }else {
    path = "http://127.0.0.1:7070/search/topic/"+param_map.get("search");
  }

  let response = await fetch(path).then(response => response.json()).then(response => {return response});
  for (const r of response){
      buildSearchList(r.post_title, r.date, r.topic, r.username, r.view_count, r.post_id)
  }
  result_template.setAttribute("style", "display:none")
}

function buildSearchList(title, date, topic, username, views,id){
  clone = result_template.cloneNode(true);
  clone.querySelector("#title").innerText = title;
  clone.querySelector("#date").innerText = new Date(date).toDateString();
  clone.querySelector("#topic").innerText = topic;
  clone.querySelector("#username").innerText = username;
  clone.querySelector("#views").innerText = views;
  clone.querySelector("#title").href ="view.html?id="+id;
  results_div.appendChild(clone);
}

function searchPosts(){
  if (search_bar.value.length > 0){
    if (search_bar.value.toLowerCase().replace(/\s/g, '') == "myposts"){
      window.location = "index.html?search=myposts";
    }
    else if (search_bar.value.toLowerCase() == "recent"){
      window.location = "index.html?search=recent";
    }
    else if (search_bar.value.toLowerCase().substr(0,3) == "-t " && search_bar.value.length > 3){
      window.location = "index.html?type=title&search=" + search_bar.value.toLowerCase().substr(3).replace(/\s/g, '_')
    }
    else{
      window.location = "index.html?search="+search_bar.value.toLowerCase().replace(/\s/g, '_')
    }
  }
  else{
    window.location = "index.html"
  }
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