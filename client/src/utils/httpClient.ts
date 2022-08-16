import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig, Method } from "axios";

function isAxiosError(error: unknown): error is AxiosError {
  return (error as AxiosError).isAxiosError === true;
}

const defaults = {
  headers: {
    "Content-Type": "application/json",
  },
};

const removeUndefinedFromParams = (data: any) =>
  data &&
  Object.keys(data).reduce((acc, key) => {
    if (data[key] !== undefined) {
      acc[key] = data[key];
    }
    return acc;
  }, {} as typeof data);

const request = async (
  endpoint: string,
  method: Method,
  config: AxiosRequestConfig = {}
) => {
  try {
    const { data, headers, ...restConfig } = config;

    const result = await axios({
      ...restConfig,
      url: `${process.env.REACT_APP_BASE_URL}${endpoint}`,
      method,
      headers: { ...defaults.headers, ...headers },
      params: method === "get" ? removeUndefinedFromParams(data) : undefined,
      data: method !== "get" ? data : undefined,
      withCredentials: true,
    });

    return result.data;
  } catch (error) {
    if (isAxiosError(error)) {
      const errorData = error?.response?.data;
      if (errorData.statusCode !== 500) {
        return errorData;
      }
      throw errorData;
    }
  }
};

export const httpClient = {
  get: (endpoint: string, config?: AxiosRequestConfig) =>
    request(endpoint, "get", config),
  post: (endpoint: string, config: AxiosRequestConfig) =>
    request(endpoint, "post", config),
  patch: (endpoint: string, config: AxiosRequestConfig) =>
    request(endpoint, "patch", config),
  delete: (endpoint: string) => request(endpoint, "delete"),
};
