// script for mega menu

// Portal Mega Menu
function initMegaMenuPortal() {
  // Attach the hover event listener to level 1 and level 2 items
  const level1Items = document.querySelectorAll("div#menu-list .level1 a");
  level1Items.forEach(item => {
    item.addEventListener("mouseover", handleMegaMenuHover);
  });

  const level2Items = document.querySelectorAll("div#menu-list .level2 a");
  level2Items.forEach(item => {
    item.addEventListener("mouseover", function (event) {
      const currentMenu = item;

      // Add active class to the current li element
      const activeLis = document.querySelectorAll("div#menu-list .level2 li.mm_active");
      if (activeLis) {
        activeLis.forEach(li => {
          li.classList.remove("mm_active");
        });
      }
      const currentLi = event.target.parentElement;
      if (currentLi) {
        currentLi.classList.add("mm_active");
      }
      showMenuDescription(currentMenu);
    });
  });

  // Function to handle the hover event for level 1 and level 2 items
  function handleMegaMenuHover(event) {
    // Get the data-show attribute value
    const showAttr = event.target.getAttribute("data-show");
    const parentDiv = event.target.parentElement.parentElement.parentElement;
    const parentSubmenuContainer = event.target.closest('.submenu-container-new');

    // Hide all level 3 elements
    const level3Elements = parentSubmenuContainer.querySelectorAll(".level3 > div");
    level3Elements.forEach(element => {
      element.classList.add("hide");
    });

    // Show the corresponding level 2 or level 3 element based on the data-show attribute value
    if (parentDiv) {
      let openLevels = [];
      let activeLis = [];
      if (parentDiv.classList.contains("level1")) {
        openLevels = parentSubmenuContainer.querySelectorAll('.level2 > ul');
        activeLis = parentSubmenuContainer.querySelectorAll(".level1 li");
      } else {
        openLevels = parentSubmenuContainer.querySelectorAll('.level3 > div');
        activeLis = parentSubmenuContainer.querySelectorAll(".level2 li");
      }
      // Remove active class from all li elements
      if (activeLis) {
        activeLis.forEach(li => {
          li.classList.remove("mm_active");
        });
      }

      if (openLevels) {
        for (i = 0; i <= openLevels.length; i++) {
          if (openLevels[i]) {
            openLevels[i].classList.remove("mm_active");
            openLevels[i].classList.add("hide");
          }
        }
      }
    }

    const nextLevelElement = parentSubmenuContainer.querySelector(`ul[data-show="${showAttr}"], div[data-show="${showAttr}"]`);
    if (nextLevelElement) {
      nextLevelElement.classList.remove("hide");
      // Add active class to the current li element
      const currentLi = event.target.parentElement;
      if (currentLi) {
        currentLi.classList.add("mm_active");
      }
    }

    // set defaultView for level1 anchor
    if (parentDiv.classList.contains("level1")) {
      activeDefailtView(parentDiv.parentElement.parentElement.parentElement.parentElement.parentElement);
    }
  }

  function showMenuDescription(currentMenu) {
    const parentDiv = currentMenu.parentElement.parentElement.parentElement.parentElement;
    const mega_menu_level3 = parentDiv.querySelector(".level3");
    const currentMenuHREF = currentMenu.getAttribute("href");
    var currentMenuHREF_New = "";

    // Remove the ENTRY part from URL
    if (currentMenuHREF) {
      const [baseUrl, queryParams] = currentMenuHREF.split("?");
      const newParams = queryParams ? queryParams.split("&").filter(pair => !pair.startsWith("ENTRY=")) : [];
      currentMenuHREF_New = baseUrl + (newParams.length > 0 ? "?" + newParams.join("&") : "");
    }

    if (mega_menu_level3) {
      mega_menu_level3.innerHTML = "";

      for (var key in mm_data) {
        if (mm_data.hasOwnProperty(key)) {
          var subGuide = mm_data[key];

          if (currentMenuHREF == "/doing-business-guide/" + subGuide.slug || currentMenuHREF_New == subGuide.slug) {
            var thumb_image = subGuide.thumb_image;

            if (!thumb_image.startsWith('https://')) {
              thumb_image = 'https://resource.dezshira.com/resize/350x150/' + thumb_image;
            }

            var displayURL = "/doing-business-guide/" + subGuide.slug;
            if (subGuide.slug.startsWith("http://") || subGuide.slug.startsWith("https://")) {
              displayURL = subGuide.slug;
            } else if (subGuide.slug == "/contact") {
              displayURL = "javascript:openForm('personnel');";
            } else if (subGuide.slug == "/search") {
              displayURL = "javascript:open_search();";
            }

            mega_menu_level3.innerHTML = `
              <div class="level3_content active">
                <div class="briefing-news">
                  <div class="posts">
                    <div class="thumbnail">
                      <a href="`+ displayURL + `" class="megamenu_l3_link">
                      <img src="`+thumb_image+`" width="227" height="127" data-main-src="`+ thumb_image + `" class="img-responsive megamenu_l3_image">
                      </a>
                    </div>
                    <div class="news-content">
                      <h3>
                        <a href="`+ displayURL + `" class="megamenu_l3_link megamenu_l3_title">` + subGuide.title + `</a>
                      </h3>
                      <span class="tag"></span>
                      <p class="megamenu_l3_teaser">`+ subGuide.teaser + `</p>
                      <a class="find-out-m-link" href="`+ displayURL + `" class="megamenu_l3_link">Find out more</a>
                    </div>
                  </div>
                </div>
              </div>
            `;
          }
        }
      }
    }
  }

  function activeDefailtView(submenuContainer) {
    var activeLevel1 = submenuContainer.querySelector(".level1 li.mm_active");
    if (!activeLevel1) activeLevel1 = submenuContainer.querySelector(".level1 li:first-child");
    
    if (activeLevel1 && activeLevel1.querySelector("a")) {
      var l1_dataShow = activeLevel1.querySelector("a").getAttribute("data-show");
      var activeLevel2 = submenuContainer.querySelectorAll(".level2 > ul");
      for (i = 0; i <= activeLevel2.length; i++) {
        if (activeLevel2[i]) {
          activeLevel2[i].classList.add("hide");
          if (activeLevel2[i].getAttribute("data-show") == l1_dataShow) {
            activeLevel2[i].classList.remove("hide");
            var current_activeLevel2LI = activeLevel2[i].querySelector("li.mm_active");
            if (!current_activeLevel2LI) current_activeLevel2LI = activeLevel2[i].querySelector("li:first-child");
            if (current_activeLevel2LI) {
              current_activeLevel2LI.classList.add("mm_active");
              showMenuDescription(current_activeLevel2LI.querySelector("a"));
            }
          }
        }
      }
    }
    const level3Content = submenuContainer.querySelector(".level3");
    if (level3Content) level3Content.style.display = "block";
  }

  var mainMenuLists = document.querySelectorAll(".nav > .nav__item");
  for (i = 0; i <= mainMenuLists.length; i++) {
    if (mainMenuLists[i]) {
      mainMenuLists[i].addEventListener("mouseover", function (e) {
        if (this.querySelector(".submenu-container-new")) {
          activeDefailtView(this.querySelector(".submenu-container-new"));
        }
      })
    }
  }

  // Trigger mouseover event on the first level 1 item of each menu
  var firstLevel1Items = document.querySelectorAll(".nav > .nav__item > .nav__link");
  firstLevel1Items.forEach(item => {
    item.dispatchEvent(new Event('mouseover'));
  });
}

let mmCheckPortals = document.querySelectorAll(".MMportal");
if (mmCheckPortals.length) {
  initMegaMenuPortal();
}