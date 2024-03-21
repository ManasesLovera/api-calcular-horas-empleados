import Express, {Request, Response} from 'express';
const app = Express();

//middleware
app.use(Express.json());

app.use('/', Express.static('public'));

type Employee = {
    id: number,
    cedula: string,
    fullname: string,
    pricePerHour: number
}

type WorkedHours = {
    employeeid: number,
    hours: number
}

let employees: Employee[] = [
    {
        id: 1,
        cedula: '123123123123',
        fullname: 'Manases Lovera',
        pricePerHour: 1000
    }
];
let workedHoursList: WorkedHours[] = [
    {
        employeeid: 1,
        hours: 8
    }
];

// (get) /employee -> obtener todos los empleados registrados
app.get('/employee', (req:Request, res:Response) => {
    res.json(employees)
})

// (get) /allemployeeinfo -> manda info para el frontend
app.get('/allemployeeinfo', (req:Request, res:Response) => {
    
    const allemployeeinfo = employees.map( (employee) => {
        const hours:WorkedHours[]|undefined = workedHoursList.filter( (workedhour:WorkedHours) => {
            if(workedhour.employeeid === employee.id) {
                return workedhour;
            }
        })
        let totalHours:number = 0;
            hours.forEach( (hour:WorkedHours) => {
                totalHours += hour.hours;
            });
        return {
            id: employee.id,
            fullname: employee.fullname,
            govermentID: employee.cedula,
            pricePerHour: employee.pricePerHour,
            workedHours: totalHours,
            salary: employee.pricePerHour*totalHours
        }
    })
    res.json(allemployeeinfo)
})

// (get) /employee/:id -> obtener un empleado enviando el id
app.get('/employee/:id', (req:Request, res:Response) => {

    if(isNaN(parseInt(req.params.id))) {
        return res.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            Message: 'Invalid value inserted'
        })
    }

    const id:number = Number.parseInt(req.params.id);

    const user:Employee|undefined = employees.find( (e:Employee) => {
        if(e.id === id) return e;
    })

    if(user) {
        return res.status(200).json(user);
    }
    else {
        return res.status(404).json({
            statusCode: 404,
            statusValue: 'Not Found',
            Message: 'Employee not found'
        });
    }
})

// (get) /employee/:id/hours
// -> obtiene todas las horas trabajadas por un empleado, enviando el id
app.get('/employee/:id/hours', (req:Request, res:Response) => {
    const id:number = Number.parseInt(req.params.id);
    if(isNaN(id)) {
        return res.status(400).json( {
            statusCode: 400,
            statusValue: 'Invalid value',
            Message: 'Invalid value inserted'
        });
    }
    const hours:WorkedHours[]|undefined = workedHoursList.filter( (workedhour:WorkedHours) => {
        if(workedhour.employeeid === id) {
            return workedhour;
        }
    })
    if(hours) {
        let totalHours:number = 0;
        hours.forEach( (hour:WorkedHours) => {
            totalHours += hour.hours;
        });
        return res.json({hours,totalHours});
    } else {
        return res.status(404).json({
            statusCode: 404,
            statusValue: 'Not Found',
            Message: 'Not Found: Id is not a valid employee'
        })
    }
})
// (get) /employee/:id/salary
// ->  obtiene el salario a pagar basandose en el total de horas por el precio 
//de hora del empleado
app.get('/employee/:id/salary', (req:Request, res:Response) => {
    const id:number = Number.parseInt(req.params.id);
    if(isNaN(id)){
        return res.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            Message: 'Invalid value'
        })
    }
    const employee:Employee|undefined = employees.find((e:Employee) => {
        if(e.id === id){
            return e;
        }
    })
    const workedhours:WorkedHours|undefined = workedHoursList.find((wh:WorkedHours) => {
        if(wh.employeeid === id){
            return wh;
        }
    })
    if(!employee || !workedhours){
        return res.status(404).json({
            statusCode: 404,
            statusValue: 'Not Found',
            Message: 'Id does not exist'
        })
    }
    else {
        return res.json({
            "Employee id": employee.id,
            "FullName": employee.fullname,
            "Price hour cost": employee.pricePerHour,
            "Worked hours": workedhours.hours,
            "salary": employee.pricePerHour * workedhours.hours
        })
    }
})

// (post) /employee -> agrega un empleado nuevo
app.post('/employee', (req:Request, res:Response) => {
    const {fullname, cedula, pricePerHour} = req.body;
    const id:number = employees[employees.length-1].id + 1;
    if(!fullname || !cedula || !pricePerHour) {
        return res.status(400).json({
            status: 400,
            statusText: 'Bad Request',
            Message: 'Some or all values are missing'
        })
    }

    const userExist = employees.find(employee => {
        if(employee.fullname === fullname
        || employee.cedula === cedula){
            return true
        }
        else 
            false
    })
    if(userExist){
        return res.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            Message: 'This user already exists'
        })
    }
    const cedulaExists = employees.find(e => e.cedula === cedula);
    if(cedulaExists){
        return res.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            Message: 'Cedula already exists'
        })
    }
    if(isNaN(Number.parseInt(pricePerHour))){
        return res.status(400).json({
            statusCode: 400,
            statusValue: 'Bad Request',
            Message: 'The price per hour is not a number'
        })
    }

    const employeeJson: Employee = {
        id, cedula, fullname, pricePerHour:Number.parseInt(pricePerHour)
    }
    employees.push(employeeJson);
    return res.json(employeeJson);
})

// (post) /employee/:id/hours
// -> agrega un registro nuevo de horas usando el id del empleado para asociar las horas
app.post('/employee/:id/hours', (req:Request, res:Response) => {
    const id = Number.parseInt(req.params.id);
    const hours = Number.parseInt(req.body.hours);

    if(isNaN(id) || isNaN(hours)) {
        return res.status(400).json({
            statusCode: 400,
            statusValue: 'Invalid number',
            Message: 'Value must be a number'
        })
    }

    const employee = employees.find(e => e.id === id)

    if (employee) {
        const workedHoursObj = {
            employeeid: id,
            hours
        }
        workedHoursList.push(workedHoursObj)
        return res.json(workedHoursObj)
    }
    else {
        return res.status(404).json({
            statusCode: 404,
            statusValue: 'Not Found',
            Message: 'Employee not found'
        })
    }
})

// (put) /employee/:id
//-> actualiza la informacion del empleado (solo el fullname y pricePerhours)
app.put('/employee/:id', (req:Request, res:Response) => {
    const {newFullname, newPricePerHours} = req.body;
    const id:number = Number.parseInt(req.params.id)
    if(newFullname === undefined || newFullname === null || newPricePerHours === ''){
        return res.status(400).json({
            statusCode: '400',
            statusValue: 'Bad Request',
            Message: 'New fullname is empty or missing'
        })
    }
    if(isNaN(Number.parseInt(newPricePerHours))) {
        return res.status(400).json({
            statusCode: '400',
            statusValue: 'Bad Request',
            Message: 'New price per hours is not a number or it is empty'
        })
    }
    if(isNaN(id)) {
        return res.status(400).json({
            statusCode: '400',
            statusValue: 'Bad Request',
            Message: 'Id is not a number'
        })
    }
    const employee = employees.find( e => e.id === id)

    if(employee) {
        employee.fullname = newFullname;
        employee.pricePerHour = Number(newPricePerHours);
        return res.json(employee)
    }
    else {
        return res.status(404).json({
            statusCode: 404,
            statusValue: 'Not Found',
            Message: 'Employee id was not found'
        })
    }
})

// (delete) / employee
// -> borra un empleado y todo el registro de las horas trabajadas
app.delete('/employee/:id', (req:Request, res:Response) => {
    const id:number = Number.parseInt(req.params.id)
    if(isNaN(id)){
        res.status(400).json({
            statusCode: 400,
            statusValue: 'Bad request',
            Message: 'Id value is not a number'
        })
    }
    const employeeIndex = employees.findIndex( e => e.id === id)
    const workedHoursIndex = workedHoursList.findIndex( wh => wh.employeeid === id)

    if(employeeIndex === -1 || workedHoursIndex === -1) {
        return res.status(400).json({
            statusCode: 404,
            statusValue: 'Not Found',
            Message: 'Employee and/or workHours are not found'
        })
    }
    employees.splice(employeeIndex, 1);
    workedHoursList.splice(workedHoursIndex, 1);

    return res.json({
        statusCode: 200,
        statusValue: 'OK',
        Message: 'Employee deleted correctly'
    })
})

app.listen(3000, () => {
    return console.log('listening at http://localhost:3000');
})