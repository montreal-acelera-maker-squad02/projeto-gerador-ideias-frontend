import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const authService = {
  register: async (
    name: string,
    email: string,
    password: string,
    confirmPassword: string
  ) => {
    const response = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
      confirmPassword,
    });
    return response.data;
  },

  login: async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
  },
};
