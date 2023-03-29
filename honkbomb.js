alert("hi");

let all = document.querySelectorAll('.cyan');
for(let i=0;i<all.length;i++) {
  all[i].classList.remove('cyan');
  all[i].classList.add('pink.lighten-3');
}

var img = document.createElement("img");
img.src = "https://raw.githubusercontent.com/cmu15122/q-prime/d56be7e0a32eee129fd94f0cddc92d664dd92f55/goose.png";
img.style.position = "absolute";
document.body.appendChild(img);

var x = 0;
var y = 0;
var xSpeed = 2;
var ySpeed = 2;

function animate() {
    x += xSpeed;
    y += ySpeed;
    if (x + img.width >= window.innerWidth || x <= 0) {
        xSpeed = -xSpeed;
    }
    if (y + img.height >= window.innerHeight || y <= 0) {
        ySpeed = -ySpeed;
    }
    img.style.left = x + "px";
    img.style.top = y + "px";
    requestAnimationFrame(animate);
}
animate();


