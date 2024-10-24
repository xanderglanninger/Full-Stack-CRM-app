document.addEventListener("DOMContentLoaded", function () {
  // Handle form submission
  document.getElementById("loginForm").addEventListener("submit", function (event) {
      event.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      // Send a POST request to the /login endpoint
      fetch("/login", {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              window.location.href = data.redirectUrl; // Redirect to dashboard page
          } else {
              alert(data.message); // Show error message
          }
      })
      .catch(error => console.error("Error:", error));
    });
});