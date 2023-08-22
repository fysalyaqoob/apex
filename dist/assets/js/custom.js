document.addEventListener('DOMContentLoaded', function () {
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
});

document.addEventListener('DOMContentLoaded', function () {
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
});

document.addEventListener('DOMContentLoaded', () => {
    adjustSubmenuPosition();
    window.addEventListener('resize', adjustSubmenuPosition);
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

document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('#apxCarousel');
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
});

