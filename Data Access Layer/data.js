const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");
const fs = require("fs").promises;
var nodemailer = require("nodemailer");

const ReadFile = async (filename) => {
  try {
    const data = await fs.readFile(path.join(__dirname, `${filename}.json`), "utf8");
    if (data === "") {
      return [];
    }
    const jsonArray = JSON.parse(data);
    return jsonArray;
  } catch (err) {
    console.error("Error reading file:", err);
    return null;
  }
};

/*const DeleteContent = async (filename) => {
  fs.truncate(path.join(__dirname, `${filename}.json`), 0, (err) => {
    if (err) {
      console.error("Error writing data file:", err);
      return res.status(500).json({ success: false, message: "Error writing data file." });
    }
  });
};*/

async function textGenTextOnlyPrompt() {
  // Await the results of ReadFile
  const technicians = await ReadFile("technicianinfo");
  const contracts = await ReadFile("contracts");

  if (!technicians || !contracts) {
    console.error("Failed to read technicians or contracts.");
    return;
  }

  console.log("The Answer:");
  console.log("--------------------------------");

  const genAI = new GoogleGenerativeAI("AIzaSyAcRpLHKvOtrG9wd8Np8HjZVG-T5KtNz34");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `Here is the actual JSON data of technicians: ${JSON.stringify(
    technicians
  )} and contracts: ${JSON.stringify(
    contracts
  )}. Based on this exact data, assign the best technician to each contract considering the skills, availability, and any other information provided. The same person can't be scheduled twice. Return only the final result in the following JSON format:

  [
    {
      "contract_id": "<contract_id>",
      "clientName": "<clientName>",
      "clientSurname": "<clientSurname>",
      "clientEmail": "<clientEmail>",
      "clientPhone": "<clientPhone>",
      "typeofjob": "<typeofjob>",
      "contracttype": "<contracttype>",
      "timePeriod": "<timePeriod>",
      "startDate": "<startDate>",
      "contractname": "<contractname>",
      "location": "<location>",
      "assigned": "<assigned_technician>",
      "finished": "false",
      "accepted": "false",
      "reviewed": "false"
    }
  ]
  Do not return a generic response, and please base the assignments only on the actual data I’ve provided. I want one thing in the response and that is the JSON output, no explanation or characters such as :"json" or backticks or grave accents etc. Only the JSON output`;

  const result = await model.generateContent(prompt);
  const assignedContracts = JSON.parse(result.response.text());

  fs.writeFile(path.join(__dirname, `contracts.json`), JSON.stringify(assignedContracts, null, 2), (err) => {
    if (err) {
      console.error("Error writing data file:", err);
      return res.status(500).json({ success: false, message: "Error writing data file." });
    }
  });
  return result.response.text();
}

const sendMail = (email) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "senproject384@gmail.com",
      pass: "zbyz hqxs tutb iwpu",
    },
  });

  var mailOptions = {
    from: "senproject384@gmail.com",
    to: `${email}`,
    subject: "Apexcare || Thank you!",
    text: `Thank you for using our services.\n\nPlease use the following link to leave a review or raise a ticket:\nhttp://localhost:5000/review?email=${encodeURIComponent(
      email
    )}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = { textGenTextOnlyPrompt, sendMail };
