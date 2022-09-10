const socket = io();

socket.emit('start');

socket.on('load_msg', (chats) => {
  const div = document.querySelector('.chatlog__container');
  chats.forEach((data) => {
    const span = document.createElement('span');
    span.innerHTML = `(${data?.group}) From <a href="https://wa.me/${data?.number}">${data?.number}</a> AKA ${data?.name}: ${data?.msg}`;
    div.appendChild(span);
    div.scrollTo(0, div.scrollHeight);
  });
})

socket.on('new_msg', (data) => {
  const div = document.querySelector('.chatlog__container');
  const span = document.createElement('span');
  span.innerHTML = `(${data?.chat}) From <a href="https://wa.me/${data.author?.number}">${data.author?.number}</a> AKA ${data.author?.pushname}: ${data.msg}`;
  div.appendChild(span);
  div.scrollTo(0, div.scrollHeight);
});

socket.on('clear_msg_done', () => {
  const div = document.querySelector('.chatlog__container');
  div.innerHTML = '';
});

function clearMsg() {
  socket.emit('clear_msg');
}

function navigate(location) {
  window.location.replace(location);
}