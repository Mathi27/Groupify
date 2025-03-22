document.getElementById("process-btn").addEventListener("click", () => {
  const fileInput = document.getElementById("file-upload");
  const teamSize = parseInt(document.getElementById("team-size").value, 10);
  const minBoys = parseInt(document.getElementById("min-boys").value, 10);
  const minGirls = parseInt(document.getElementById("min-girls").value, 10);
  const interdisciplinary = document.getElementById(
    "interdisciplinary-check"
  ).checked;
  const categoryBased = document.getElementById("category-check").checked;

  if (!fileInput.files.length) {
    showToast("Please upload a CSV file.", "error");
    return;
  }

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    console.log("File content read successfully.");
    const csvContent = e.target.result;
    const rows = csvContent.split("\n").map((row) => row.split(","));
    const headers = rows.shift().map((h) => h.trim().toLowerCase());
    const nameIndex = headers.indexOf("name");
    const genderIndex = headers.indexOf("gender");
    const departmentIndex = headers.indexOf("department");
    const categoryIndex = headers.indexOf("category");

    if (
      nameIndex === -1 ||
      genderIndex === -1 ||
      departmentIndex === -1 ||
      categoryIndex === -1
    ) {
      showToast(
        "CSV must include 'Name', 'Gender', 'Department', and 'Category' columns.",
        "error"
      );
      return;
    }

    const participants = rows
      .map((row) => ({
        name: row[nameIndex]?.trim(),
        gender: normalizeGender(row[genderIndex]?.trim()),
        department: normalizeDepartment(row[departmentIndex]?.trim()),
        category: normalizeCategory(row[categoryIndex]?.trim()),
      }))
      .filter(
        (person) =>
          person.name && person.gender && person.department && person.category
      );

    console.log(participants);

    const teams = interdisciplinary
      ? splitIntoInterdisciplinaryTeams(participants, teamSize)
      : categoryBased
      ? splitIntoCategoryTeams(participants, teamSize)
      : splitIntoTeams(participants, teamSize, minBoys, minGirls);

    const csvOutput = generateCSV(teams);

    document.getElementById("download-btn").style.display = "inline-block";
    document.getElementById("download-btn").onclick = () =>
      downloadCSV(csvOutput);

    showToast(`Successfully split into ${teams.length} teams!`, "success");
  };

  reader.readAsText(file);
});

function normalizeGender(gender) {
  if (!gender) return null;
  const normalized = gender.toLowerCase();
  if (normalized === "male" || normalized === "m") return "male";
  if (normalized === "female" || normalized === "f") return "female";
  return null;
}


function splitIntoTeams(participants, teamSize, minBoys, minGirls) {
    const boys = participants.filter(p => p.gender === 'male');
    const girls = participants.filter(p => p.gender === 'female');
    const teams = [];

    while (boys.length || girls.length) {
        const team = [];
        for (let i = 0; i < minBoys && boys.length; i++) team.push(boys.pop());
        for (let i = 0; i < minGirls && girls.length; i++) team.push(girls.pop());

        while (team.length < teamSize && (boys.length || girls.length)) {
            if (boys.length) team.push(boys.pop());
            else if (girls.length) team.push(girls.pop());
        }

        teams.push(team);
    }

    return teams;
}

// Map normalized department names
function normalizeDepartment(department) {
  if (!department) return null;
  const cleaned = department.toLowerCase().replace(/[^a-z]/g, "");
  const departmentMap = {
    cse: "CSE",
    csea: "CSE",
    cseb: "CSE",
    becomputerscienceandengineering: "CSE",
    computerscienceandengineering: "CSE",
    it: "IT",
    btechinformationtechnology: "IT",
    informationtechnology: "IT",
    ece: "ECE",
    beece: "ECE",
    ecea: "ECE",
    eceb: "ECE",
    electronicsandcommunicationengineering: "ECE",
    beelectronicsandcommunicationengineering: "ECE",
    csbs: "CSBS",
    btechcomputerscienceandbusinesssystems: "CSBS",
    computerscienceandbusinesssystems: "CSBS",
    mech: "MECH",
    bemechanicalengineering: "MECH",
    mechanicalengineering: "MECH",
    aids: "AI&DS",
    aidsa: "AI&DS",
    aidsb: "AI&DS",
    btechartificialintelligenceanddatascience: "AI&DS",
    artificialintelligenceanddatascience: "AI&DS",
  };
  if (departmentMap[cleaned]) {
    console.log("Match found:", cleaned, "->", departmentMap[cleaned]);
    return departmentMap[cleaned];
  }
  console.log("No match found for:", cleaned);
  return null;
}

function splitIntoInterdisciplinaryTeams(participants, teamSize) {
  const departmentGroups = participants.reduce((groups, participant) => {
    if (!groups[participant.department]) {
      groups[participant.department] = [];
    }
    groups[participant.department].push(participant);
    return groups;
  }, {});

  const departments = Object.keys(departmentGroups);
  const teams = [];
  let currentTeam = [];

  while (departments.length > 0) {
    for (let i = departments.length - 1; i >= 0; i--) {
      const dept = departments[i];

      if (departmentGroups[dept].length > 0) {
        currentTeam.push(departmentGroups[dept].pop());

        if (departmentGroups[dept].length === 0) {
          departments.splice(i, 1);
        }
        if (currentTeam.length === teamSize) {
          teams.push(currentTeam);
          currentTeam = [];
        }
      }
    }
  }

  if (currentTeam.length > 0) {
    teams.push(currentTeam);
  }

  return teams;
}

function normalizeCategory(category) {
  if (!category) return null;
  const normalized = category.toLowerCase();
  const categoryMap = {
    e: "Excellent",
    excellent: "Excellent",
    p: "Proficient",
    proficient: "Proficient",
    i: "Ideal",
    ideal: "Ideal",
    c: "Capable",
    capable: "Capable",
  };
  return categoryMap[normalized] || null;
}

function splitIntoCategoryTeams(participants, teamSize) {
  const categories = {
    Excellent: [],
    Proficient: [],
    Ideal: [],
    Capable: [],
  };

  // Categorize participants
  participants.forEach((person) => categories[person.category].push(person));

  const totalTeams = Math.ceil(participants.length / teamSize);
  let teams = Array.from({ length: totalTeams }, () => []);

  // Distribute Excellent leaders
  let remainingLeaders = [...categories.Excellent];

  // If not enough Excellent leaders, add Proficient as leaders
  while (
    remainingLeaders.length < totalTeams &&
    categories.Proficient.length > 0
  ) {
    remainingLeaders.push(categories.Proficient.shift());
  }

  // Assign a leader to each team
  teams.forEach((team) => {
    if (remainingLeaders.length > 0) {
      team.push(remainingLeaders.shift());
    }
  });

  // Distribute remaining Proficient members fairly
  let allMembers = [
    ...categories.Proficient,
    ...categories.Ideal,
    ...categories.Capable,
  ];
  let teamIndex = 0;

  while (allMembers.length > 0) {
    teams[teamIndex].push(allMembers.shift());
    teamIndex = (teamIndex + 1) % totalTeams; // Rotate team index to balance
  }

  return teams;
}

function generateCSV(teams) {
  const headers = ["Team", "Name", "Gender", "Department", "Category"];
  const rows = teams.flatMap((team, index) =>
    team.map((member) => [
      index + 1,
      member.name,
      member.gender,
      member.department,
      member.category,
    ])
  );

  return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

function downloadCSV(csvContent) {
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "teams.csv";
  link.click();
}

function showToast(message, type) {
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => toast.remove(), 4000);
}

document
  .getElementById("file-upload")
  .addEventListener("change", function (event) {
    const fileNameDisplay = document.getElementById("file-name");
    if (event.target.files.length > 0) {
      fileNameDisplay.textContent = `📂 File uploaded: ${event.target.files[0].name}`;
    } else {
      fileNameDisplay.textContent = "";
    }
  });
