alert("Omg chonk says hi :)");

let e = document.querySelectorAll('.entry-item.entry-question');
for (let i = 0; i < e.length; i++) {
    let d = e[i].innerHTML;
    if (d.startsWith('[other] remote')) {
      e[i].parentElement.parentElement.parentElement.parentElement.style.display = 'none'
    }
}

function replaceText() {
  let anchors = document.getElementsByTagName("a");
  for (let i = 0; i < anchors.length; i++) {
    if (anchors[i].innerHTML === "15-210 Office Hours Queue") {
      anchors[i].innerHTML = "Functions Are Pointers";
    }
  }
}
replaceText();

let allCyan = document.querySelectorAll('.cyan');
for(let i=0;i<allCyan.length;i++) {
  allCyan[i].classList.remove('cyan');
  allCyan[i].classList.add('pink.lighten-4');
}
let allPurple = document.querySelectorAll('.purple.darken-3');
for(let i=0;i<allPurple.length;i++) {
  allPurple[i].classList.remove('purple', 'darken-3');
  allPurple[i].classList.add('pink.lighten-4');
}

var goose = document.createElement("img");
goose.src = "https://raw.githubusercontent.com/cmu15122/q-prime/honkbomb/goose.png";
goose.style.position = "absolute";
document.body.appendChild(goose);

var iliano = document.createElement("img");
iliano.src = "https://raw.githubusercontent.com/cmu15122/q-prime/honkbomb/iliano.png";
iliano.style.position = "absolute";
document.body.appendChild(iliano);

var x = 0;
var y = 0;
var xSpeed = 2;
var ySpeed = 2;

function animateGoose() {
    x += xSpeed;
    y += ySpeed;
    if (x + goose.width >= window.innerWidth || x <= 0) {
        xSpeed = -xSpeed;
    }
    if (y + goose.height >= window.innerHeight || y <= 0) {
        ySpeed = -ySpeed;
    }
    goose.style.left = x + "px";
    goose.style.top = y + "px";
    requestAnimationFrame(animateGoose);
}
animateGoose();

var x2 = 50;
var y2 = 250;
var x2Speed = 3;
var y2Speed = 1.5;
function animateIliano() {
    x2 += x2Speed;
    y2 += y2Speed;
    if (x2 + iliano.width >= window.innerWidth || x2 <= 0) {
        x2Speed = -x2Speed;
    }
    if (y2 + iliano.height >= window.innerHeight || y2 <= 0) {
        y2Speed = -y2Speed;
    }
    iliano.style.left = x2 + "px";
    iliano.style.top = y2 + "px";
    requestAnimationFrame(animateIliano);
}
animateIliano();


