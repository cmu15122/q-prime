alert("hi");

let e = document.querySelectorAll('.entry-item.entry-question');
for (let i = 0; i < e.length; i++) {
    let d = e[i].innerHTML;
    if (d.startsWith('[other] remote')) {
      e[i].style.display = 'none'
    }
}
