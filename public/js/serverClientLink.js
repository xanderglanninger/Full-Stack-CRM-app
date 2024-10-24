const GoogleAI = () => {
  fetch("/GoogleAI", {
    method: "POST",
  })
    .then((response) => response.text())
    .then((html) => {
      document.open();
      document.write(html);
      document.close();
    })
    .catch((error) => console.error("Error:", error));
};

function redirectToPage() {
  window.location.href = "https://apexcaresolutions-5d1fg4vm.b4a.run//loadingscreen";
}

// Assuming this is part of your fetch call
const reloadPage = () => {
  fetch("/reloadPage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Data written successfully:", data);
      // Refresh the page after successful data writing
      location.reload();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
