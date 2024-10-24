let contracts = [];

document.addEventListener("DOMContentLoaded", async () => {
  const email = new URLSearchParams(window.location.search).get("email");

  if (!email) {
    console.error("No email provided in the URL.");
    return;
  }

  try {
    const response = await fetch("/getContracts");
    const data = await response.json();

    if (data.success) {
      // Filter contracts by client email and reviewed === false
      contracts = data.contracts.filter(
        (contract) => contract.clientEmail === email && contract.reviewed === false
      );

      console.log("Filtered contracts:", contracts);
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

    const selectedContractName = document.getElementById("contractId").value;
    const selectedContract = contracts.find(
      (contract) => contract.contractname === selectedContractName
    );

    if (!selectedContract) {
      console.error("Selected contract not found.");
      return; // Ensure a contract is selected
    }

    const newReview = {
      contractName: selectedContractName,
      clientName: selectedContract.clientName,
      clientSurname: selectedContract.clientSurname,
      rating: document.getElementById("rating").value,
      description: document.getElementById("description").value,
      fileComplaint: document.getElementById("fileComplaint").checked,
    };

    // Submit the review and mark the contract as reviewed
    await writeToReview(newReview, selectedContract.contract_id);
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
    }
  });
});

const populateContractDropdown = (filteredContracts) => {
  const contractDropdown = document.getElementById("contractId");
  contractDropdown.innerHTML = ""; // Clear previous options

  // Add the placeholder option
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.disabled = true;
  placeholderOption.selected = true;
  placeholderOption.textContent = "Select Contract";
  contractDropdown.appendChild(placeholderOption);

  if (filteredContracts.length === 0) {
    const option = document.createElement("option");
    option.textContent = "No contracts found for this email";
    option.disabled = true;
    contractDropdown.appendChild(option);
    return;
  }

  filteredContracts.forEach((contract) => {
    const option = document.createElement("option");
    option.value = contract.contractname;
    option.textContent = contract.contractname;
    contractDropdown.appendChild(option);
  });
};

const writeToReview = async (review, contractId) => {
  try {
    const response = await fetch("/writeToReview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ review, contractId }),
    });

    const data = await response.json();

    if (data.success) {
      await markContractReviewed(contractId);
      location.reload();
    } else {
      console.error("Error updating the review:", data.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const markContractReviewed = async (contractId) => {
  try {
    const response = await fetch("/update-contract", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contractId, action: "markReviewed" }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error("Failed to mark contract as reviewed:", data.message);
    }
  } catch (error) {
    console.error("Error updating contract:", error);
  }
};
