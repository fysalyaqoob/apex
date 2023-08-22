// Import Bootstrap and assign its Toast component to a constant
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

import './custom';