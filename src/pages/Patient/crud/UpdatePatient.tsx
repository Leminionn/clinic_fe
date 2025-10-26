import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Patient } from "../../../types/Patient";
import { apiCall } from "../../../api/api";
import { receptionistGetPatientDetail, receptionistUpdatePatient } from "../../../api/urls";
import type { PatientCreateDto } from "../../../types/PatientCreateDto";
const UpdatePatient: React.FC= ()=>{
    const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
   const [form, setForm] = useState<PatientCreateDto | null>(null);
   
   const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  function onGetPatientSuccess(data:any) {
    setForm(data.data);
  }
  function onUpdateSuccess(data:any) {
    navigate("/test/patient_detail/"+id);
  }
  function onUpdateFailure(data:any) {
    setError(data.message);
  }
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => (prev ? { ...prev, [name]: value } : prev));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;

    setError(null);
    

    apiCall(receptionistUpdatePatient(id?id:"0"),"PUT",null,JSON.stringify(form),onUpdateSuccess,onUpdateFailure);
  };
  function onGetPatientFailure(data:any) {
    if(data.statusCode==404) {
        navigate("/not_found");
    }
  }
  useEffect(()=>{
    if(!id||id=="") {
        navigate("/not_found");
    }
    apiCall(receptionistGetPatientDetail(id?id:""),"GET",null,null,onGetPatientSuccess,onGetPatientFailure);

  },[id]);
    return (<div>
    <h2>Update Patient</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID: {id}</label>
          
        </div>

        <div>
          <label>Full Name: </label>
          <input
            name="fullName"
            value={form?.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Date of Birth: </label>
          <input
            type="date"
            name="dateOfBirth"
            value={form?.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Gender: </label>
          <select
            name="gender"
            value={form?.gender}
            onChange={handleChange}
            required
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label>Email: </label>
          <input
            type="email"
            name="email"
            value={form?.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Phone: </label>
          <input
            name="phone"
            value={form?.phone || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>ID Card: </label>
          <input
            name="idCard"
            value={form?.idCard || ""}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Address: </label>
          <input
            name="address"
            value={form?.address}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>First Visit Date: </label>
          <input
            type="date"
            name="firstVisitDate"
            value={form?.firstVisitDate}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Update</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      
    </div>)
}
export default UpdatePatient;