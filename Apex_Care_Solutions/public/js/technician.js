let technicians = [];

document.addEventListener("DOMContentLoaded", async () => {
  const techForm = document.getElementById("techForm");
  techForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newTech = {
      name: document.getElementById("Technician-Name").value,
      surname: document.getElementById("Technician-Surname").value,
      email: document.getElementById("Technician-email").value,
      phone: document.getElementById("Technician-Phone").value,
      speciality: document.getElementById("Technician-Speciality").value,
      workhours: document.getElementById("Technician-workHours").value,
      location: document.getElementById("Technician-Location").value,
    };

    writeToTechnician(newTech);
    technicians.push(newTech);
    console.log("Client added:", newTech);
    techForm.reset();
  });
});

const writeToTechnician = (technician) => {
  fetch("/writeToTechnician", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ technician }),
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
