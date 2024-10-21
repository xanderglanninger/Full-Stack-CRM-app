let reviews = [];
let contracts = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/getContracts");
    const data = await response.json();

    if (data.success) {
      contracts = data.contracts;
      console.log("Contracts loaded:", contracts);
      populateContractDropdown(contracts);
    } else {
      console.error("Failed to load contracts.");
    }
  } catch (error) {
    console.error("Error fetching contracts:", error);
  }

  const reviewForm = document.getElementById("reviewForm");
  reviewForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newReview = {
      contractName: document.getElementById("contractId").value,
      clientName: document.getElementById("clientName").value,
      clientSurname: document.getElementById("clientSurname").value,
      rating: document.getElementById("rating").value,
      description: document.getElementById("description").value,
      fileComplaint: document.getElementById("fileComplaint").checked,
    };

    writeToReview(newReview);
    reviews.push(newReview);
    console.log("Review added:", newReview);
    reviewForm.reset();
  });

  const contractDropdown = document.getElementById("contractId");
  contractDropdown.addEventListener("change", (event) => {
    const selectedContractName = event.target.value;
    const selectedContract = contracts.find(
      (contract) => contract.contractname === selectedContractName
    );

    if (selectedContract) {
      document.getElementById("clientName").value =
        selectedContract.clientName || "";
      document.getElementById("clientSurname").value =
        selectedContract.clientSurname || "";
    } else {
      document.getElementById("clientName").value = "";
      document.getElementById("clientSurname").value = "";
    }
  });
});

const populateContractDropdown = (contracts) => {
  const contractDropdown = document.getElementById("contractId");

  contracts.forEach((contract) => {
    const option = document.createElement("option");
    option.value = contract.contractname; // Use 'contractname' as value
    option.textContent = contract.contractname; // Display contractname as text
    contractDropdown.appendChild(option);
  });
};

const writeToContract = (contract) => {
  fetch("/writeToContract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ contract }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.reload();
      } else {
        console.error("Error updating the file");
      }
    })
    .catch((error) => console.error("Error:", error));
};

const writeToReview = (review) => {
  fetch("/writeToReview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ review }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.reload();
      } else {
        console.error("Error updating the file");
      }
    })
    .catch((error) => console.error("Error:", error));
};