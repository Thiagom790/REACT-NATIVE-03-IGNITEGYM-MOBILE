import { AppError } from "@utils/AppError";
import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.100.6:3333",
});

// Com o request eu intercepto todas as requisições
// O config tem todas as configurações da requisição
// O segundo parâmetro é a função que vai ser executada em caso de erro
// api.interceptors.request.use(
//   (config) => {
//     console.log({ config });
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      return Promise.reject(new AppError(error.response.data.message));
    }

    return Promise.reject(error);
  }
);

export { api };
