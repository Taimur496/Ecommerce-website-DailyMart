export const apiUrl = "http://localhost:8000/api";

export const VisitorDetails = `${apiUrl}/getvisitor`;

export const adminToken = () => {
  const data = JSON.parse(localStorage.getItem("adminInfo"));
  return data.token;
};
