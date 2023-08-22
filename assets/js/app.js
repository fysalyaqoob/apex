import * as Bootstrap from 'bootstrap';
const Toast = Bootstrap.Toast;

// Rest of your JavaScript code
const toastTrigger = document.getElementById('liveToastBtn');
const toastLiveExample = document.getElementById('liveToast');

if (toastTrigger) {
  toastTrigger.addEventListener('click', () => {
    const toast = new Toast(toastLiveExample);
    toast.show();
  });
}

// Get the cartTrigger element
var cartTrigger = document.getElementById("cartTrigger");

// Add event listener for hover
cartTrigger.addEventListener("mouseover", function () {
  // Find the Bootstrap Offcanvas instance related to the cartOffcanvas element
  var offcanvas = new Bootstrap.Offcanvas(document.getElementById("cartOffcanvas"));

  // Show the offcanvas
  offcanvas.show();
});

import './custom';
