import ReactECharts from "echarts-for-react";
import { useEffect, useMemo, useState } from "react";
import { apiCall } from "../../../api/api";
import { useNavigate } from "react-router-dom";

const fakeData = [
  { month: "Jan", completed: 120, notshown: 15, cancelled: 21, waiting: 0,confirmed:0 },
  { month: "Feb", completed: 110, notshown: 13, cancelled: 16, waiting: 0, confirmed:0 },
  { month: "Mar", completed: 150, notshown: 18, cancelled: 23, waiting: 0, confirmed:0 },
  { month: "Apr", completed: 160, notshown: 23, cancelled: 26, waiting: 0,confirmed:0  },
  { month: "May", completed: 180, notshown: 19, cancelled: 23, waiting: 0,confirmed:0  },
  { month: "Jun", completed: 153, notshown: 16, cancelled: 20, waiting: 0,confirmed:0  },
  { month: "Jul", completed: 120, notshown: 14, cancelled: 17, waiting: 0,confirmed:0  },
  { month: "Aug", completed: 130, notshown: 17, cancelled: 22, waiting: 0,confirmed:0  },
  { month: "Sep", completed: 196, notshown: 24, cancelled: 28, waiting: 0,confirmed:0  },
  { month: "Oct", completed: 135, notshown: 15, cancelled: 21, waiting: 50,confirmed:0  },
  { month: "Nov", completed: 0, notshown: 0, cancelled: 18, waiting: 80,confirmed:0  },
  { month: "Dec", completed: 0, notshown: 0, cancelled: 10, waiting: 47,confirmed:0  },
];


export default function AppointmentsChart() {
  const [data, setData] = useState(fakeData);
  const navigate = useNavigate();
  useEffect(()=>{
     const accessToken = localStorage.getItem("accessToken");
     apiCall("admin/appointment_chart","GET",accessToken?accessToken:"",null,(responseData:any)=>{
      setData(responseData.data);
     },(responseData:any)=>{
      alert(responseData.message);
      navigate("/admin");
     })
  },[])
  const option = useMemo(() => {
  return {
     tooltip: {
      trigger: "axis",
    },
    legend: {
      bottom: 0,
      itemWidth: 20,
      itemHeight: 8,
      itemGap: 24,
      textStyle: { fontSize: 12, },
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "12%",
      top: "12%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: data.map(d => d.month),
        axisTick: { show: false },
        axisLine: { show: false },
      },
    ],
    yAxis: [
      {
        type: "value",
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: "#eee" } },
      },
    ],
    series: [
      {
        name: "Completed",
        type: "bar",
        stack: "total",
        data: data.map(d => d.completed),
        itemStyle: { color: "#3cefef" },
        barWidth: 20,
      },
      {
        name: "Not shown",
        type: "bar",
        stack: "total",
        data: data.map(d => d.notshown),
        itemStyle: { color: "#50c8ec" },
        barWidth: 20,
      },
      {
        name: "Cancelled",
        type: "bar",
        stack: "total",
        data: data.map(d => d.cancelled),
        itemStyle: { color: "#239cff" },
        barWidth: 20,
      },
      {
        name: "Waiting",
        type: "bar",
        stack: "total",
        data: data.map(d => d.waiting),
        itemStyle: { color: "#0068ca" },
        barWidth: 20,
      },
      {
        name: "Confirmed",
        type: "bar",
        stack: "total",
        data: data.map(d => d.confirmed),
        itemStyle: { color: "#00ca62ff" },
        barWidth: 20,
      },
    ],
  };
}, [data]);
  
  

  return (
    <div style={{ width: "100%", height: 350 }}>
      <ReactECharts option={option} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
