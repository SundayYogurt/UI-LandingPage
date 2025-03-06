
    function toggleHamburgerIcon(el) {
      el.classList.toggle("change");
    }

    const myMenu = document.getElementById("myMenu");
    const hamIcon = document.getElementById("hamIcon");

    hamIcon.addEventListener("click", function(){
        if(myMenu.style.display === "block"){
            myMenu.style.display = "none"
        }else {
            myMenu.style.display = "block"
        }
    });