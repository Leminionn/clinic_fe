import React, { useState } from "react"
import type { PatientCreateDto } from "../../../types/PatientCreateDto";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../../api/api";
import { receptionistCreatePatient } from "../../../api/urls";
const CreatePatient:React.FC=()=>{
    const navigate = useNavigate();
    const [form, setForm] = useState<PatientCreateDto>({
    address: "",
    firstVisitDate: "",
    fullName: "",
    dateOfBirth: "",
    gender: "MALE",
    email: "",
    idCard:"",
    phone:""
  });
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  function onSuccess(data:any){
    navigate("/test/list_patient");
  }
  function onFailure(data:any) {
    setError(data.message);
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    

    // Kiểm tra bắt buộc (frontend)
    if (
      !form.address ||
      !form.firstVisitDate ||
      !form.fullName ||
      !form.dateOfBirth ||
      !form.gender ||
      !form.email||
      !form.idCard||
      !form.phone
    ) {
      setError("Please fill in all required fields.");
      return;
    }
    apiCall(receptionistCreatePatient,"POST",null,JSON.stringify(form),onSuccess,onFailure);
}
    return (
       <div>
      <h2>Create New Patient</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ID card: </label>
          <input
            type="text"
            name="idCard"
            value={form.idCard}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Full Name: </label>
          <input
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Date of Birth: </label>
          <input
            type="date"
            name="dateOfBirth"
            value={form.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Gender: </label>
          <select
            name="gender"
            value={form.gender}
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
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Phone: </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </div>


        <div>
          <label>Address: </label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>First Visit Date: </label>
          <input
            type="date"
            name="firstVisitDate"
            value={form.firstVisitDate}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit">Create</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      
    </div>
    )
}
export default CreatePatient;