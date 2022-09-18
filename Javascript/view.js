logout_link = document.getElementById("logout_link");
search_bar = document.getElementById("search_bar");
username_span = document.getElementById("displayed_username");
search_button = document.getElementById("search_button")

post_title = document.getElementById("post_title");
post_topic = document.getElementById("post_topic");
post_date = document.getElementById("post_date");
post_views = document.getElementById("post_views");
post_username = document.getElementById("post_username");
post_body = document.getElementById("post_body");

post_edit_button = document.getElementById("post_edit_button");
post_delete_button = document.getElementById("post_delete_button");

leave_comment_username = document.getElementById("leave_comment_username");
leave_comment_button = document.getElementById("leave_comment_button");
leave_comment_input = document.getElementById("leave_comment_input");

search_button.onclick = searchPosts;
leave_comment_button.onclick = postComment;
logout_link.onclick = navigateToLoginPage;
post_delete_button.onclick = deletePost;
post_edit_button.onclick = editPost;

param_map = getParamMap(location.search);

let user;
getUsername();


comment_template = document.getElementById("template_comment");
comment_list_div = document.getElementById("comment_list");



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
          leave_comment_username.innerText = data.username;
          fetchPost();
          fetchComments();

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
    let target = "login.html?from=view";
    if (param_map.get("id") != null)
        target = target + "&id="+param_map.get("id");
    window.location = target;
}

async function fetchPost(){
    let path = "http://20.168.105.126:7070/post/"+param_map.get("id");
    console.log(param_map);
    let r = await fetch(path).then(response => response.json()).then(response => {return response});
    buildPost(r.title, r.topic, r.body, r.date, r.view_count, r.username)
}
async function fetchComments(){
    let path = "http://20.168.105.126:7070/comments/"+param_map.get("id");
  
    let response = await fetch(path).then(response => response.json()).then(response => {return response});
    for (const r of response){
        buildCommentList(r.username, r.date, r.body, r.id)
    }
    comment_template.setAttribute("style", "display:none")
}


async function deleteComment(id){
    fetch("http://20.168.105.126:7070/comment/"+id, {
        method:'DELETE',
        mode:'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
    })
    .then(window.location.reload())
}

async function deletePost(){
    fetch("http://20.168.105.126:7070/post/"+param_map.get("id"), {
        method:'DELETE',
        mode:'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
    })
    .then(window.location = "index.html")
}

function editPost(){
    window.location = "editPost.html?title="+post_title.innerText.replace(/ /g,"_")+"&topic="+post_topic.innerText.replace(/ /g,"_")+"&body="+post_body.innerText.replace(/ /g,"_")+"&id="+param_map.get("id");
}

async function postComment(){
    if(leave_comment_input.value != ""){
      
        let inputComment = {
            id:-1,
            postId: param_map.get("id"),
            body: leave_comment_input.value,
            username:user.username,
            date: 1662361200000,
        }

        console.log("button clicked");
        fetch("http://20.168.105.126:7070/comment", {
            method:'POST',
            mode:'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
              },
            body:JSON.stringify(inputComment)
        })
        .then(window.location.reload())
    }
}


function buildPost(title, topic, body, date, views, username){
    post_title.innerText = title;
    post_topic.innerText = topic;
    post_date.innerText = new Date(date).toDateString();
    post_views.innerText = views;
    post_username.innerText = username;
    post_body.innerText = body;
    if (username != user.username) {
      post_delete_button.style.visibility='hidden';
      post_edit_button.style.visibility='hidden';
    }
}
function buildCommentList(username, date, body, id){
    clone = comment_template.cloneNode(true);
    clone.querySelector("#comment_date").innerText = new Date(date).toDateString();
    clone.querySelector("#comment_username").innerText = username;
    clone.querySelector("#comment_body").innerText = body
    if (username == user.username){
        clone.querySelector("#comment_delete_button").style.visibility = "visible";
        clone.querySelector("#comment_delete_button").onclick = (() => {deleteComment(id)})
    }

    comment_list_div.appendChild(clone);
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


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}