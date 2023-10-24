import {
  storageAuthTokenGet,
  storageAuthTokenSave,
} from "@storage/storageAuthToken";
import { AppError } from "@utils/AppError";
import axios, { AxiosError, AxiosInstance } from "axios";

type SignOut = () => void;

type PromiseType = {
  onSuccess: (token: string) => void;
  onFailure: (error: AxiosError) => void;
};

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (signOut: SignOut) => () => void;
};

const api = axios.create({
  baseURL: "http://192.168.100.6:3333",
}) as APIInstanceProps;

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

// Dessa forma eu consigo interceptar todas as respostas de erro
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response && error.response.data) {
//       return Promise.reject(new AppError(error.response.data.message));
//     }

//     return Promise.reject(error);
//   }
// );

let failedQueue: PromiseType[] = [];
let isRefreshing = false;

api.registerInterceptTokenManager = (signOut) => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => response,
    async (requestError) => {
      if (requestError?.response?.status === 401) {
        if (
          requestError.response.data?.message === "token.expired" ||
          requestError.response.data?.message === "token.invalid"
        ) {
          const { refresh_token } = await storageAuthTokenGet();

          if (!refresh_token) {
            signOut();
            return Promise.reject(requestError);
          }

          const originalRequestConfig = requestError.config;

          // Verificar se está acontecendo a solicitação de um novo token
          // Verifica se é a primeira vez
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({
                onSuccess: (token) => {
                  originalRequestConfig.headers[
                    "Authorization"
                  ] = `Bearer ${token}`;
                  resolve(api(originalRequestConfig));
                },
                onFailure: (error) => {
                  reject(error);
                },
              });
            });
          }

          isRefreshing = true;

          return new Promise(async (resolve, reject) => {
            try {
              const { data } = await api.post("/sessions/refresh-token", {
                refresh_token,
              });

              await storageAuthTokenSave({
                token: data.token,
                refresh_token: data.refresh_token,
              });

              if (originalRequestConfig.data) {
                originalRequestConfig.data = JSON.parse(
                  originalRequestConfig.data
                );
              }

              originalRequestConfig.headers[
                "Authorization"
              ] = `Bearer ${data.token}`;

              api.defaults.headers.common[
                "Authorization"
              ] = `Bearer ${data.token}`;

              failedQueue.forEach((request) => request.onSuccess(data.token));

              console.log("Token atualizado com sucesso!");

              resolve(api(originalRequestConfig));
            } catch (error: any) {
              failedQueue.forEach((request) => request.onFailure(error));

              signOut();
              reject(error);
            } finally {
              isRefreshing = false;
              failedQueue = [];
            }
          });
        }
        signOut();
      }

      if (requestError.response && requestError.response.data) {
        return Promise.reject(new AppError(requestError.response.data.message));
      }

      return Promise.reject(requestError);
    }
  );

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  };
};

export { api };
