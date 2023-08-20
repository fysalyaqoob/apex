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
