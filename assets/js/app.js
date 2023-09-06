document.addEventListener('DOMContentLoaded', (event) => {

  const toastTrigger = document.getElementById('liveToastBtn');
  const toastLiveExample = document.getElementById('liveToast');

  if (toastTrigger) {
    toastTrigger.addEventListener('click', () => {
      const toast = new bootstrap.Toast(toastLiveExample);

      // Check if 'show' class is not present
      if (!toastLiveExample.classList.contains('show')) {
        // If 'show' class is not present, show the toast
        toast.show();
      }
      // If 'show' class is already present, do nothing
    });
  }

  // Get the cartTrigger element
  var cartTrigger = document.getElementById("cartTrigger");

  // Add event listener for hover
  cartTrigger.addEventListener("mouseover", function () {
    // Find the Bootstrap Offcanvas instance related to the cartOffcanvas element
    var offcanvas = new bootstrap.Offcanvas(document.getElementById("cartOffcanvas"));

    // Show the offcanvas
    offcanvas.show();
  });

  // Get all the parallax containers and backgrounds
  const parallaxContainers = document.querySelectorAll('.parallax-container');
  const parallaxBackgrounds = document.querySelectorAll('.parallax-bg');

  // Function to handle the parallax effect
  function handleParallax() {
    // Calculate the distance scrolled
    const scrollPosition = window.pageYOffset;

    // Loop through each parallax background and apply the effect
    parallaxBackgrounds.forEach((background, index) => {
      // Get the offsetTop of the associated container to determine its position on the page
      const containerTop = parallaxContainers[index].offsetTop;

      // Check if the parallax container is in the viewport
      if (scrollPosition > containerTop - window.innerHeight && scrollPosition < containerTop + parallaxContainers[index].offsetHeight) {
        // Calculate the parallax offset based on how much of the container is visible
        const parallaxOffset = (scrollPosition - containerTop) * 0.3;

        // Update the position of the current parallax background
        background.style.transform = `translateY(${parallaxOffset}px)`;
      }
    });
  }

  // Attach the function to the window's scroll event
  window.addEventListener('scroll', handleParallax);
  /*
    // Check if the site-header and floating window elements exist on the page
    let siteHeader = document.querySelector('.site-header');
    let floatingWindow = document.querySelector('#liveToast');
  
    if (siteHeader && floatingWindow) {
      // Get the height of the site-header
      let siteHeaderHeight = siteHeader.offsetHeight;
  
      // Calculate the top position with the extra 35px
      let topPosition = siteHeaderHeight + 35;
  
      // Set the top position of the floating window
      floatingWindow.style.top = `${topPosition}px`;
    }
  
    // Adjust position on window resize to make it responsive
    window.addEventListener('resize', function () {
      if (siteHeader && floatingWindow) {
        siteHeaderHeight = siteHeader.offsetHeight;
        topPosition = siteHeaderHeight + 35;
        floatingWindow.style.top = `${topPosition}px`;
      }
    });
  */

  adjustSubmenuPosition();
  window.addEventListener('resize', adjustSubmenuPosition);

  const carousel = document.querySelector('#apxCarousel');
  if (carousel) {
    const carouselInner = carousel.querySelector('.carousel-inner');
    const carouselItems = carouselInner.querySelectorAll('.carousel-item');
    const carouselIndicators = carousel.querySelector('.carousel-indicators');

    // Clear existing indicators
    carouselIndicators.innerHTML = '';

    carouselItems.forEach((item, index) => {
      const indicator = document.createElement('button');
      indicator.type = 'button';
      indicator.dataset.bsTarget = '#apxCarousel';
      indicator.dataset.bsSlideTo = index;
      indicator.setAttribute('aria-label', `Slide ${index + 1}`);

      if (index === 0) {
        indicator.classList.add('active');
        indicator.setAttribute('aria-current', 'true');
      }

      carouselIndicators.appendChild(indicator);
    });
  }

  let table = document.querySelector('.product-loop');

  if (table) { // Check if the table with class 'product-loop' exists
      let headers = Array.from(document.querySelectorAll('.product-loop thead th')).map(th => th.textContent);
      let rows = document.querySelectorAll('.product-loop tbody tr');

      rows.forEach(row => {
          let cells = row.querySelectorAll('td');
          cells.forEach((cell, index) => {
              cell.setAttribute('data-label', headers[index]);
          });
      });
  }

});

function adjustSubmenuPosition() {
  // Assuming menuItems are direct children of the navbar or another container
  const menuItems = document.querySelectorAll('#primary-nav .dropdown');

  menuItems.forEach(menuItem => {
    menuItem.addEventListener('mouseover', function () {
      const submenu = this.querySelector('.dropdown-menu, #primary-nav ul ul');

      if (submenu && !submenu.dataset.positionChecked) {
        const rightEdge = submenu.getBoundingClientRect().right;
        const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

        if (rightEdge > viewportWidth) {
          submenu.classList.add('has-submenu-right');
        }

        // Add a class or data attribute to remember that we've checked this submenu's position
        submenu.dataset.positionChecked = 'true';
      }
    });
  });
}

// Function to implement the parallax effect on scroll with variable speeds
function parallaxScrollEffectWithSpeed() {
  // Get all the elements with the attribute 'data-parallax="scroll"'
  const parallaxElements = document.querySelectorAll('[data-parallax="scroll"]');

  // Loop through each of the elements
  parallaxElements.forEach(element => {
    const imagePath = element.getAttribute('data-image-src');
    if (!imagePath) {
      console.error("Element missing 'data-image-src' attribute.");
      return;
    }

    // Get the speed from 'data-speed' attribute or set default to 0.5 if not found
    const speed = parseFloat(element.getAttribute('data-speed')) || 0.5;

    // Set the initial background of the element
    element.style.backgroundImage = `url(${imagePath})`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';

    // Event listener for the scroll event
    window.addEventListener('scroll', () => {
      // Calculate the parallax offset
      const scrolled = window.scrollY;
      const offset = -(scrolled * speed) + 'px';

      // Set the background position
      element.style.backgroundPosition = `center ${offset}`;
    });
  });
}

// Execute the parallax effect function once the document is fully loaded
document.addEventListener('DOMContentLoaded', parallaxScrollEffectWithSpeed);