import type React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { Patient } from "../../../types/Patient";
import { apiCall } from "../../../api/api";
import { receptionistGetPatientDetail } from "../../../api/urls";

const PatientDetail:React.FC = ()=>{
    const navigate = useNavigate();
    const {id} = useParams<{id:string}>();
    const [patient, setPatient] = useState<Patient|null>(null);
    function onSuccess(data:any) {
        setPatient(data.data);
    }
    function onFailure(data:any) {
        if(data.statusCode==404) {
            navigate("/not_found");
        }
    }
    useEffect(()=>{
        if(!id||id=="") {
            navigate("/not_found");
        }
        apiCall(receptionistGetPatientDetail(id?id:""),"GET",null,null,onSuccess,onFailure);

    },[]);
    return (
        <div>
      <h2>Patient Detail</h2>
      <table border={1} cellPadding={5}>
        <tbody>
          <tr><td>ID</td><td>{patient?.patientId}</td></tr>
          <tr><td>Full Name</td><td>{patient?.fullName}</td></tr>
          <tr><td>Date of Birth</td><td>{new Date(patient?patient.dateOfBirth:"").toLocaleDateString()}</td></tr>
          <tr><td>Gender</td><td>{patient?.gender}</td></tr>
          <tr><td>Email</td><td>{patient?.email}</td></tr>
          <tr><td>Phone</td><td>{patient?.phone}</td></tr>
          <tr><td>ID Card</td><td>{patient?.idCard}</td></tr>
          <tr><td>Address</td><td>{patient?.address}</td></tr>
          <tr><td>First Visit</td><td>{new Date(patient?patient.firstVisitDate:"").toLocaleDateString()}</td></tr>
        </tbody>
      </table>

      <div style={{ marginTop: 12 }}>
        <Link to="/test/list_patient">← Back to List</Link>
      </div>
    </div>
    )
}
export default PatientDetail;