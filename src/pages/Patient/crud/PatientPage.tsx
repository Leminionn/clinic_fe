import React, { useEffect, useState } from 'react';
import type { Patient } from '../../../types/Patient';
import { apiCall } from '../../../api/api';
import { receptionistDeletePatient, receptionistGetPatient } from '../../../api/urls';
import { useNavigate } from 'react-router-dom';
  import Swal from 'sweetalert2';
const PAGE_SIZE=5;
 const PatientPage: React.FC = ()=>{
    const [patients, setPatient] = useState<Patient[]>([]);
    const navigate = useNavigate();
    function onSuccess(data:any) {
        console.log(data);
        setPatient(data.data);
    }
    function onDeleteFailure(data:any) {
        Swal.fire({
      title: "Failed!",
      text: data.message,
      icon: "error"
    });
    }
    function onDeleteSuccess(data:any) {
        Swal.fire({
      title: "Deleted!",
      text: "Your patient has been deleted.",
      icon: "success"
    });
    window.location.reload();
    }
    function onDeletePatient(id:number) {
        apiCall(receptionistDeletePatient(id),"DELETE",null,null,onDeleteSuccess, onDeleteFailure);
    }
    function onClickDeletePatient(id:number) {
        Swal.fire({
  title: "Are you sure?",
  text: "You won't be able to revert this!",
  icon: "warning",
  showCancelButton: true,
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  confirmButtonText: "Yes, delete it!"
}).then((result:any) => {
  if (result.isConfirmed) {
    onDeletePatient(id);
  }
});
    }
    useEffect(()=>{
        apiCall(receptionistGetPatient,"GET",null,null,onSuccess,()=>{});
    },[])
    return (<div>
      <h2>Patient List</h2>
      <button>Add Patient</button>
      <table border={1} cellPadding={5}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Full Name</th>
            <th>Date of Birth</th>
            <th>Gender</th>
            <th>Email</th>
            <th>Phone</th>
            <th>ID Card</th>
            <th>Address</th>
            <th>First Visit</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p.patientId}>
              <td>{p.patientId}</td>
              <td>{p.fullName}</td>
              <td>{new Date(p.dateOfBirth).toLocaleDateString()}</td>
              <td>{p.gender}</td>
              <td>{p.email}</td>
              <td>{p.phone}</td>
              <td>{p.idCard}</td>
              <td>{p.address}</td>
              <td>{new Date(p.firstVisitDate).toLocaleDateString()}</td>
              <td>
                <button onClick={(e)=>{
                    navigate("/test/patient_detail/"+p.patientId);
                }}>View</button> 
                <button>Update</button> 
                <button onClick={(e)=>{
                    onClickDeletePatient(p.patientId)
                }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>);
}
export default PatientPage;