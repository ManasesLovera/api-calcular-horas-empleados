const tbody = document.getElementById("tbody");
const btndd = document.getElementById('btnAgregar');
const btnddHours = document.getElementById('btnAgregarHours');
const url = 'http://localhost:3000';

async function showData(){
    const data = await (await fetch(`${url}/allemployeeinfo`)).json();
    
    tbody.innerHTML = '';
    data.forEach(async (employee) => {
        const {id, fullname, govermentID, pricePerHour, workedHours, salary} = employee;
        
        tbody.innerHTML += `
            <tr>
                <td class="content">${id}</td>
                <td class="content">${fullname}</td>
                <td class="content">${govermentID}</td>
                <td class="content">${pricePerHour}</td>
                <td class="content">${workedHours}</td>
                <td class="content">${salary}</td>
                <td class="content">
                    <button onclick="btnDelete(${id})" class="btn" id="btnDelete">Delete</button>
                    <button onclick="btnUpdate(${id})" class="btn" id="btnUpdate">Update</button>
                </td>
            </tr>
        `
    })
};
showData();

btndd.addEventListener('click', async (e)=>{
    e.preventDefault();
    let fullname = document.getElementById('fullname').value;
    let cedula = document.getElementById('cedula').value;
    let pricePerHour = Number(document.getElementById('pricePerHour').value);

    try {
        const response = await fetch(`${url}/employee`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({fullname, cedula, pricePerHour})})
        console.log(response);
        showData();
    }
    catch(err) {
        alert(err);
    }
})

btnAddHours.addEventListener('click', async () => {
    e.preventDefault();
    let employeeid = Number(document.getElementById('employeeid'));
    let hours = Number(document.getElementById('hours'));
    try {
        const response = await fetch(`/employees/${employeeid}/hours`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify(hours)
        });
        console.log(response);
    }
    catch(err) {
        console.log(err);
    } 
})

async function btnDelete(id) {
    console.log(id);
    try {
        const response = await fetch(`${url}/employee/${id}`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'}
        })
        console.log(response);
    }
    catch(err) {
        console.log(err);
    }
}
