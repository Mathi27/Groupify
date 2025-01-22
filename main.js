document.getElementById('process-btn').addEventListener('click', () => {
    const fileInput = document.getElementById('file-upload');
    const teamSize = parseInt(document.getElementById('team-size').value, 10);
    const minBoys = parseInt(document.getElementById('min-boys').value, 10);
    const minGirls = parseInt(document.getElementById('min-girls').value, 10);

    if (!fileInput.files.length) {
        showToast("Please upload a CSV file.", "error");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const csvContent = e.target.result;
        const rows = csvContent.split("\n").map(row => row.split(","));
        const headers = rows.shift().map(h => h.trim().toLowerCase());
        const nameIndex = headers.indexOf("name");
        const genderIndex = headers.indexOf("gender");

        if (nameIndex === -1 || genderIndex === -1) {
            showToast("CSV must include 'Name' and 'Gender' columns.", "error");
            return;
        }

        const participants = rows.map(row => ({
            name: row[nameIndex]?.trim(),
            gender: normalizeGender(row[genderIndex]?.trim()),
        })).filter(person => person.name && person.gender);

        const teams = splitIntoTeams(participants, teamSize, minBoys, minGirls);
        const csvOutput = generateCSV(teams);

        document.getElementById('download-btn').style.display = 'inline-block';
        document.getElementById('download-btn').onclick = () => downloadCSV(csvOutput);

        showToast(`Successfully split into ${teams.length} teams!`, "success");
    };

    reader.readAsText(file);
});

function normalizeGender(gender) {
    if (!gender) return null;
    const normalized = gender.toLowerCase();
    if (normalized === 'male' || normalized === 'm') return 'male';
    if (normalized === 'female' || normalized === 'f') return 'female';
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

function generateCSV(teams) {
    const headers = ['Team', 'Name', 'Gender'];
    const rows = teams.flatMap((team, index) =>
        team.map(member => [index + 1, member.name, member.gender])
    );

    return [headers, ...rows].map(row => row.join(",")).join("\n");
}

// This feature yet to be implemented
/*
function splitByDepartment(participants){
    const ece = participants.filter(p => p.department === 'ece');
    const aids = participants.filter(p => p.department === 'aids');
    const mech = participants.filter(p => p.department === 'mech');
    const cse = participants.filter(p => p.department === 'cse');
}
    */

function downloadCSV(csvContent) {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'teams.csv';
    link.click();
}

function showToast(message, type) {
    const toastContainer = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => toast.remove(), 4000);
}

