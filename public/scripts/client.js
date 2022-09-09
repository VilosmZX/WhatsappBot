const socket = io();

socket.emit('start');

socket.on('load_msg', (chats) => {
  const div = document.querySelector('div');
  chats.forEach((data) => {
    const span = document.createElement('span');
    span.innerText = data?.value;
    div.appendChild(span);
  });
})

socket.on('new_msg', (data) => {
  const div = document.querySelector('div');
  const span = document.createElement('span');
  span.innerText = `(${data?.chat}) From ${data.author?.number} AKA ${data.author?.name}: ${data.msg}`;
  div.appendChild(span);
});