function updateContract(contractId, action) {
  fetch("/update-contract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contractId, action }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update contract.");
      }
      return response.text();
    })
    .then((data) => {
      console.log(data);
      location.reload(); // Refresh page on success
    })
    .catch((error) => console.error("Error:", error));
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".accept-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const contractId = button.getAttribute("data-contract-id");
      updateContract(contractId, "accept");
    });
  });

  document.querySelectorAll(".cancel-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const contractId = button.getAttribute("data-contract-id");
      updateContract(contractId, "decline");
    });
  });

  document.querySelectorAll(".done-btn").forEach((button) => {
    button.addEventListener("click", () => {
        const contractId = button.getAttribute("data-contract-id");
        updateContract(contractId, "done"); // Call updateContract with "done"
    });
});
});
