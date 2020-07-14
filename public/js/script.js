let showButton = $("#myBtn");
// let column2 = $(".col2");
let mobileHidden = $(".hidden-md");


showButton.on("click", () => {
    
    if (mobileHidden.hasClass("hidden-md")) {
        mobileHidden.removeClass("hidden-md");
        showButton.text("Show less...");
    } else {
        mobileHidden.addClass("hidden-md");
        showButton.text("Show more...");
    }

});