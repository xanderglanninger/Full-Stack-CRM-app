document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("dashboard").addEventListener("click", function () {
    window.location.href = "/dashboard"; // Redirect to dashboard page
  });

  document.getElementById("contracts").addEventListener("click", function () {
    window.location.href = "/contract"; // Redirect to contract page
  });

  document.getElementById("technician").addEventListener("click", function () {
    window.location.href = "/technician"; // Redirect to technician page
  });

  document.getElementById("assignjob").addEventListener("click", function () {
    window.location.href = "/assign"; // Redirect to assign job page
  });

  document.getElementById("reporting").addEventListener("click", function () {
    window.location.href = "/reporting"; // Redirect to reporting page
  });

  /*document.getElementById("add-contract-button").addEventListener("click", function () {
    window.location.href = "/contract"; // Redirect to dashboard page
  });

  document.getElementById("login-button").addEventListener("click", function () {
    window.location.href = "/login"; // Redirect to dashboard page
  });*/
});
