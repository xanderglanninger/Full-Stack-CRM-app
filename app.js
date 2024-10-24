const express = require("express");
const app = express();
const fs = require("fs");
const path = require("path");
const port = process.env.PORT || 5000;
const GetCounter = require("./Business_Layer/logic.js");
const { textGenTextOnlyPrompt, sendMail } = require("./Data Access Layer/data.js");
const { CLIENT_RENEG_LIMIT } = require("tls");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
//Global synchronization
//==========================================================================================

const LoginClient = "Xander Glanninger"; //This will be used when a technician logs in and used to filted only the contracts assigned to that technician

const tempDashboard = fs.readFileSync(path.join(__dirname, "Presentation_Layer", "dashboard.html"), "utf-8");
const templogin = fs.readFileSync(path.join(__dirname, "Presentation_Layer", "login.html"), "utf-8");
const tempAssign = fs.readFileSync(path.join(__dirname, "Presentation_Layer", "assign.html"), "utf-8");

const tempContractCard = fs.readFileSync(
  path.join(__dirname, "Presentation_Layer", "templates", "contractcard.html"),
  "utf-8"
);
const tempAssignedCard = fs.readFileSync(
  path.join(__dirname, "Presentation_Layer", "templates", "assignedcard.html"),
  "utf-8"
);
const temploading = fs.readFileSync(path.join(__dirname, "Presentation_Layer", "loadingscreen.html"), "utf-8");
const tempDashboardCard = fs.readFileSync(
  path.join(__dirname, "Presentation_Layer", "templates", "dashboardcard.html"),
  "utf-8"
);

const temptechmobileUpcoming = fs.readFileSync(
  path.join(__dirname, "Presentation_Layer", "templates", "techdashboardTemplate.html"),
  "utf-8"
);

const temptechmobileSchedule = fs.readFileSync(
  path.join(__dirname, "Presentation_Layer", "templates", "tecdashboardSchedule.html"),
  "utf-8"
);

const tempTechDashboard = fs.readFileSync(
  path.join(__dirname, "Presentation_Layer", "technician", "technicianDashboard.html"),
  "utf-8"
);

const tempTechLogin = fs.readFileSync(
  path.join(__dirname, "Presentation_Layer", "technician", "technicianLogin.html"),
  "utf-8"
);

const redirect = fs.readFileSync(path.join(__dirname, "Presentation_Layer", "redirect.html"), "utf-8");

//==========================================================================================

//===============================================================================================================================
//Jan Albert
//Technisian Page
app.get("/technician", (req, res) => {
  try {
    const techPage = fs.readFileSync(path.join(__dirname, "Presentation_Layer", "technician.html"), "utf-8");
    res.send(techPage);
  } catch (error) {
    res.status(500).send("Error retrieving tech page.");
  }
});

//Review Page
app.get("/review", (req, res) => {
  try {
    const email = req.query.email || ""; // Get the email from the query parameter
    const reviewPage = fs.readFileSync(path.join(__dirname, "Presentation_Layer", "review.html"), "utf-8");

    // Send the HTML with the page
    res.send(reviewPage);
  } catch (error) {
    res.status(500).send("Error retrieving review page.");
  }
});

//Contracts Page
app.get("/contract", (req, res) => {
  try {
    const techPage = fs.readFileSync(path.join(__dirname, "Presentation_Layer", "client&contract.html"), "utf-8");
    res.send(techPage);
  } catch (error) {
    res.status(500).send("Error retrieving tech page.");
  }
});

//Assign Job Page
app.get("/assign", (req, res) => {
  try {
    fs.readFile(path.join(__dirname, "Data Access Layer", "contracts.json"), "utf-8", (err, contractsdata) => {
      if (err) {
        return res.status(500).send("Error reading data file.");
      }

      let output = [];

      const dataObj = JSON.parse(contractsdata);

      if (dataObj !== "") {
        const unassignedContracts = dataObj.filter((contract) => {
          return contract.assigned === "none";
        });

        const contractsObj = unassignedContracts.map((el) => replaceContractTemplate(tempContractCard, el)).join("");

        output = tempAssign.replace("{%UNASSIGNEDJOBS%}", contractsObj);
      } else {
        output = tempAssign.replace("{%UNASSIGNEDJOBS%}", "");
      }

      const assignedContracts = dataObj.filter((contract) => contract.assigned !== "none");

      if (assignedContracts !== "") {
        const assignedJobsObj = assignedContracts.map((el) => replaceAssignedTemplate(tempAssignedCard, el)).join("");
        output = output.replace("{%ASSIGNEDJOBS%}", assignedJobsObj);
      } else {
        output = output.replace("{%ASSIGNEDJOBS%}", "");
      }
      res.send(output);
    });
  } catch (error) {
    res.status(500).send("Error retrieving tech page.");
  }
});

//Reporting Stats Page
app.get("/reporting", (req, res) => {
  try {
    const techPage = fs.readFileSync(path.join(__dirname, "Presentation_Layer", "reporting.html"), "utf-8");
    res.send(techPage);
  } catch (error) {
    res.status(500).send("Error retrieving tech page.");
  }
});

app.use(express.json());

//===============================================================================================================================

//===============================================================================================================================
//Xander

app.get("/dashboard", async (req, res) => {
  try {
    let output = tempDashboard;
    const noFilter = () => true;
    const complaintFilter = (item) => item.fileComplaint === true;

    const contractsCount = await GetCounter("contracts", noFilter);
    const techniciansCount = await GetCounter("technicianinfo", noFilter);
    const clientsCount = await GetCounter("client", noFilter);
    const complaintCount = await GetCounter("reviews", complaintFilter);

    output = output.replace("{%CONTRACTS%}", contractsCount);
    output = output.replace("{%TECHNICIANS%}", techniciansCount);
    output = output.replace("{%CLIENTS%}", clientsCount);
    output = output.replace("{%COMPLAINTS%}", complaintCount);

    const contractsPath = path.join(__dirname, "Data Access Layer", "contracts.json");
    const contractsData = await fs.promises.readFile(contractsPath, "utf-8");

    const dataObj = JSON.parse(contractsData);
    const contractObj =
      dataObj && dataObj.length ? dataObj.map((el) => replaceAssignedTemplate(tempDashboardCard, el)).join("") : "";

    output = output.replace("{%MAINSTATS%}", contractObj);

    res.send(output);
  } catch (error) {
    console.error("Error retrieving counters:", error); // Log the specific error
    res.status(500).send("Error retrieving counters.");
  }
});

app.get(["/", "/login"], (req, res) => {
  try {
    res.send(redirect);
  } catch (error) {
    res.status(500).send("Error retrieving counters.");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const usersData = await fs.promises.readFile(path.join(__dirname, "Data Access Layer", "users.json"), "utf-8");
    const users = JSON.parse(usersData);

    // Find user
    const user = users.find((u) => u.username === username && u.password === password);
    if (user) {
      // Redirect to dashboard if successful
      return res.status(200).json({ success: true, redirectUrl: "/dashboard" });
    } else {
      return res.status(401).json({ success: false, message: "Invalid username or password." });
    }
  } catch (error) {
    console.error("Error reading users data:", error);
    res.status(500).send("Error processing login.");
  }
});

app.get("/loadingscreen", (req, res) => {
  try {
    res.send(temploading);
  } catch (error) {
    res.status(500).send("Error retrieving counters.");
  }
});

app.post("/assign-jobs", async (req, res) => {
  try {
    const data = await textGenTextOnlyPrompt(); // Await the promise

    // Write data to JSON file
    fs.writeFile(path.join(__dirname, "Data Access Layer", "assignedjobs.json"), data, (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        return res.status(500).send("Internal Server Error");
      }

      // Set Content-Type to text/plain
      res.set("Content-Type", "text/plain"); // Option 1
      // or use res.type('text/plain'); // Option 2

      // Send response with a redirect URL
      res.json({ redirectUrl: "/assign" }); // Respond with the URL to redirect
    });
  } catch (error) {
    console.error("Error generating text:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.post("/writeToClient", (req, res) => {
  const filePath = path.join(__dirname, "Data Access Layer", "client.json");

  // Read the client.json file
  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ success: false, message: "Error reading data file." });
    }

    let oldClientData = [];

    // Check if the file is empty or has invalid JSON
    if (data.trim() === "") {
      console.log("File is empty, initializing with an empty array.");
    } else {
      try {
        oldClientData = JSON.parse(data); // Parse existing data
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError);
        return res.status(500).json({ success: false, message: "Error parsing data file." });
      }
    }

    // Add the new client to the array
    const { client } = req.body;
    oldClientData.push(client);

    // Write updated data back to the file
    fs.writeFile(filePath, JSON.stringify(oldClientData, null, 2), (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        return res.status(500).json({ success: false, message: "Error writing data file." });
      }
      res.status(200).json({ success: true, message: "Client data saved successfully." });
    });
  });
});

app.post("/writeToContract", (req, res) => {
  const filePath = path.join(__dirname, "Data Access Layer", "contracts.json");

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ success: false, message: "Error reading data file." });
    }

    let oldContractData = [];

    if (data.trim() === "") {
      console.log("File is empty, initializing with an empty array.");
    } else {
      try {
        oldContractData = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError);
        return res.status(500).json({ success: false, message: "Error parsing data file." });
      }
    }

    const { contract } = req.body;
    contract.contract_id = oldContractData.length + 1;
    oldContractData.push(contract);

    fs.writeFile(filePath, JSON.stringify(oldContractData, null, 2), (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        return res.status(500).json({ success: false, message: "Error writing data file." });
      }
      res.status(200).json({ success: true, message: "Client data saved successfully." });
    });
  });
});

app.post("/writeToTechnician", (req, res) => {
  const filePath = path.join(__dirname, "Data Access Layer", "technicianinfo.json");

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ success: false, message: "Error reading data file." });
    }

    let oldTechnicianData = [];

    if (data.trim() === "") {
      console.log("File is empty, initializing with an empty array.");
    } else {
      try {
        oldTechnicianData = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError);
        return res.status(500).json({ success: false, message: "Error parsing data file." });
      }
    }

    const { technician } = req.body;
    oldTechnicianData.push(technician);

    fs.writeFile(filePath, JSON.stringify(oldTechnicianData, null, 2), (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        return res.status(500).json({ success: false, message: "Error writing data file." });
      }
      res.status(200).json({ success: true, message: "Client data saved successfully." });
    });
  });
});

app.get("/getContracts", (req, res) => {
  const contractsFilePath = path.join(__dirname, "Data Access Layer", "contracts.json");

  fs.readFile(contractsFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error reading contracts file." });
    }

    try {
      const contracts = JSON.parse(data);
      res.json({ success: true, contracts });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error parsing contracts file." });
    }
  });
});

app.get("/getClients", (req, res) => {
  const clientsFilePath = path.join(__dirname, "Data Access Layer", "client.json");

  fs.readFile(clientsFilePath, "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ success: false, message: "Error reading clients file." });
    }

    try {
      const clients = JSON.parse(data);
      res.json({ success: true, clients });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error parsing clients file." });
    }
  });
});

app.post("/writeToReview", (req, res) => {
  const filePath = path.join(__dirname, "Data Access Layer", "reviews.json");

  fs.readFile(filePath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return res.status(500).json({ success: false, message: "Error reading data file." });
    }

    let oldReviewsData = [];

    if (data.trim() === "") {
      console.log("File is empty, initializing with an empty array.");
    } else {
      try {
        oldReviewsData = JSON.parse(data);
      } catch (parseError) {
        console.error("Error parsing JSON data:", parseError);
        return res.status(500).json({ success: false, message: "Error parsing data file." });
      }
    }

    const { review } = req.body;
    oldReviewsData.push(review);

    fs.writeFile(filePath, JSON.stringify(oldReviewsData, null, 2), (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        return res.status(500).json({ success: false, message: "Error writing data file." });
      }
      res.status(200).json({ success: true, message: "Client data saved successfully." });
    });
  });
});

//===============================================================================================================================

const replaceContractTemplate = (temp, contract) => {
  let result = "";

  result = temp.replace(/{%JOBNUMBER%}/g, contract.contract_id);
  result = result.replace(/{%CONTRACTNAME%}/g, contract.contractname);
  result = result.replace(/{%USERLOCATION%}/g, contract.location);
  result = result.replace(/{%JOBTYPE%}/g, contract.typeofjob);
  result = result.replace(/{%CONTRACTTYPE%}/g, contract.contracttype);

  if (contract.contracttype === "Maintenance") {
    result = result.replace(/{%ONCEOFF%}/g, "maintenance-main-container");
  } else {
    result = result.replace(/{%ONCEOFF%}/g, "onceoff-main-container");
  }

  return result;
};

const replaceAssignedTemplate = (temp, assigned) => {
  let result = "";

  result = temp.replace(/{%JOBNUMBER%}/g, assigned.contract_id);
  result = result.replace(/{%CONTRACTNAME%}/g, assigned.clientName);
  result = result.replace(/{%TECHNICIANNAME%}/g, assigned.assigned);
  result = result.replace(/{%USERLOCATION%}/g, assigned.location);
  result = result.replace(/{%CONTRACTDATE%}/g, assigned.timePeriod);

  return result;
};

const replaceTechDashboardTemplate = (temp, assigned) => {
  return temp
    .replace(/{%CONTRACTNAME%}/g, assigned.contractname || "")
    .replace(/{%CLIENTNAME%}/g, assigned.clientName || "")
    .replace(/{%CONTRACTDATE%}/g, assigned.startDate || "")
    .replace(/{%LOCATION%}/g, assigned.location || "")
    .replace(/{%CONTRACT_ID%}/g, assigned.contract_id || "");
};

//================================================================================================================================
//Mobile Technician Page Setup
app.get("/technicianmobile", async (req, res) => {
  try {
    const contractsPath = path.join(__dirname, "Data Access Layer", "contracts.json");
    const contractsData = await fs.promises.readFile(contractsPath, "utf-8");

    let dataObj = JSON.parse(contractsData);

    const filteredData = dataObj.filter((el) => el.assigned === LoginClient);

    const upcomingContracts = filteredData.filter((el) => !el.accepted);
    const scheduledContracts = filteredData.filter((el) => el.accepted);

    const upcomingHTML = upcomingContracts
      .map((el) => replaceTechDashboardTemplate(temptechmobileUpcoming, el))
      .join("");

    const scheduledHTML = scheduledContracts
      .map((el) => replaceTechDashboardTemplate(temptechmobileSchedule, el))
      .join("");

    let finalOutput = tempTechDashboard.replace("{%UPCOMING%}", upcomingHTML);
    finalOutput = finalOutput.replace("{%SCHEDULE%}", scheduledHTML);

    res.send(finalOutput);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Error retrieving contracts.");
  }
});

app.post("/update-contract", async (req, res) => {
  try {
    const { contractId, action } = req.body;
    const contractsPath = path.join(__dirname, "Data Access Layer", "contracts.json");
    const contractsData = await fs.promises.readFile(contractsPath, "utf-8");

    let dataObj = JSON.parse(contractsData);

    const contract = dataObj.find((el) => el.contract_id == contractId);
    if (!contract) return res.status(404).send("Contract not found.");

    if (action === "accept") {
      contract.accepted = true;
    } else if (action === "decline") {
      contract.assigned = "none";
    } else if (action === "done") {
      contract.finished = true;
      contract.assigned = "Completed";
      sendMail(contract.clientEmail);
    } else if (action === "markReviewed") {
      contract.reviewed = true;
    }

    await fs.promises.writeFile(contractsPath, JSON.stringify(dataObj, null, 2));
    res.send({ success: true, message: "Contract updated successfully." });
  } catch (error) {
    console.error("Error updating contract:", error);
    res.status(500).send({ success: false, message: "Error updating contract." });
  }
});

app.post("/technicianlogin", (req, res) => {
  const isMobile = req.body.isMobile;
  console.log(isMobile);
  if (isMobile) {
    try {
      res.send(tempTechLogin);
    } catch (error) {
      res.status(500).send("Error retrieving counters.");
    }
  } else {
    try {
      res.send(templogin);
    } catch (error) {
      res.status(500).send("Error retrieving counters.");
    }
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Server running at http://localhost:${port}`);
});
