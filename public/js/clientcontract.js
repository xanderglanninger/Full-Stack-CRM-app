let clients = [];
const contracts = [];
let OldClients = [];

// Wait for the DOM to load before running the script
document.addEventListener("DOMContentLoaded", async () => {
  const clientForm = document.getElementById("clientForm");
  const contractForm = document.getElementById("contractForm");
  const contractClientNameInput = document.getElementById("Contract-Client-Name");

  // Load old clients from client.json
  await loadOldClients(); // Ensures OldClients is available before proceeding

  // Handle client form submission
  clientForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newClient = {
      name: document.getElementById("Client-Name").value,
      surname: document.getElementById("Client-Surname").value,
      email: document.getElementById("Client-Email").value,
      phone: document.getElementById("Client-Phone").value,
      location: document.getElementById("Client-Location").value,
    };

    writeToClient(newClient);
    OldClients.push(newClient); // Save the new client

    console.log("Client added:", newClient);
    clientForm.reset();
  });

  // Handle contract form submission
  contractForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newContract = {
      contract_id: 0,
      clientName: contractClientNameInput.value,
      clientSurname: document.getElementById("Contract-Client-Surname").value,
      clientEmail: document.getElementById("Contract-Client-Email").value,
      clientPhone: document.getElementById("Contract-Client-Phone").value,
      typeofjob: document.getElementById("Contract-Category").value,
      contracttype: document.getElementById("Contract-Maintenance").value,
      timePeriod: document.getElementById("Contract-Time-Period").value,
      startDate: document.getElementById("Contract-Start-Date").value,
      contractname: document.getElementById("Contract-Description").value,
      location: document.getElementById("Contract-Location").value,
      assigned: "none",
      finished: false,
      accepted: false,
      reviewed: false,
    };

    writeToContract(newContract);
    console.log("Contract added:", newContract);
    contractForm.reset();
  });

  // Auto-fill client details based on selected name
  contractClientNameInput.addEventListener("input", function () {
    const input = this.value.toLowerCase().trim();
    const inputParts = input.split(" ");

    let matchedClient;

    if (inputParts.length > 1) {
      const [inputName, inputSurname] = inputParts;

      matchedClient = OldClients.find(
        (client) => client.name.toLowerCase() === inputName && client.surname.toLowerCase() === inputSurname
      );
    } else {
      matchedClient = OldClients.find((client) => client.name.toLowerCase() === input);
    }

    if (matchedClient) {
      document.getElementById("Contract-Client-Surname").value = matchedClient.surname;
      document.getElementById("Contract-Client-Email").value = matchedClient.email;
      document.getElementById("Contract-Client-Phone").value = matchedClient.phone;
    } else {
      document.getElementById("Contract-Client-Surname").value = "";
      document.getElementById("Contract-Client-Email").value = "";
      document.getElementById("Contract-Client-Phone").value = "";
    }
  });
});

const loadOldClients = async () => {
  try {
    const response = await fetch("/getClients");
    const data = await response.json();

    if (data.success) {
      OldClients = data.clients;
      console.log("Old clients loaded:", OldClients);
    } else {
      console.error("Failed to load old clients.");
    }
  } catch (error) {
    console.error("Error fetching old clients:", error);
  }
};

const writeToClient = (client) => {
  fetch("/writeToClient", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ client }),
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
