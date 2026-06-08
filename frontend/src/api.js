import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8000" });

export const classifyImage = async (file) => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post("/classify", form);
  return data;
};

export const getLabels = async () => {
  const { data } = await api.get("/labels");
  return data.labels;
};
