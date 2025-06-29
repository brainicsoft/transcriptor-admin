/* eslint-disable @typescript-eslint/no-explicit-any */
import axiosInstance from "./config";

export async function getData(endpoint:string) {
  try {
    const response = await axiosInstance.get(`${endpoint}`);
    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error:any) {
    console.error(error.message);
  }
}

export async function postData(endpoint:string, data:any) {
  try {
    const response = await axiosInstance.post(`${endpoint}`, data);
    return response.data;
  } catch (error:any) {
    if (error.response) {
      alert(` ${error.response.data.message}`);
    } else if (error.request) {
     alert("Error: No response received from the server");
    } else {
     alert(`Error: ${error.message}`);
    }
  }
}

export async function deleteData(endpoint:string) {
  try {
    const response = await axiosInstance.delete(`${endpoint}`);
    return response.data;
  } catch (error:any) {
    console.error("Error:", error.message);
  }
}

export async function updateData(endpoint:string, data:any) {
  try {
    const response = await axiosInstance.patch(`${endpoint}`, data);
    return response.data;
  } catch (error:any) {
    alert(error.message);
  }
}