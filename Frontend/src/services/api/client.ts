import axios from 'axios';
import { NativeModules, Platform } from 'react-native';
import { getToken } from '../storage/token.storage';

const API_PORT = 4000;
const REQUEST_TIMEOUT_MS = 4000;
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

type RetriableRequestConfig = {
  __retryHosts?: string[];
  __retryIndex?: number;
};

const extractMetroHost = (): string | null => {
  const sourceCodeModule = NativeModules.SourceCode as
    | { scriptURL?: string }
    | undefined;
  const scriptURL = sourceCodeModule?.scriptURL;

  if (!scriptURL) {
    return null;
  }

  const hostMatch = scriptURL.match(/^https?:\/\/([^/:?#]+)(?::\d+)?/i);
  return hostMatch?.[1] ?? null;
};

const buildHostCandidates = (): string[] => {
  const platformFallbacks =
    Platform.OS === 'android'
      ? ['10.0.2.2', '10.0.3.2', 'localhost', '127.0.0.1']
      : ['localhost', '127.0.0.1'];

  // Try Metro host first so physical devices and LAN dev setups work without manual config.
  const candidates = [extractMetroHost(), ...platformFallbacks].filter(
    (host): host is string => Boolean(host && host.trim()),
  );

  return Array.from(new Set(candidates));
};

const toBaseUrl = (host: string): string => `http://${host}:${API_PORT}/api`;

const initialHost = buildHostCandidates()[0] ?? DEFAULT_HOST;
const BASE_URL = toBaseUrl(initialHost);

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

apiClient.interceptors.request.use(async config => {
  const retriableConfig = config as typeof config & RetriableRequestConfig;
  const retryHosts = retriableConfig.__retryHosts ?? buildHostCandidates();
  const retryIndex = retriableConfig.__retryIndex ?? 0;

  retriableConfig.__retryHosts = retryHosts;
  retriableConfig.__retryIndex = retryIndex;
  retriableConfig.baseURL = toBaseUrl(retryHosts[retryIndex] ?? DEFAULT_HOST);

  const token = await getToken();

  if (token) {
    retriableConfig.headers = retriableConfig.headers ?? {};
    retriableConfig.headers.Authorization = `Bearer ${token}`;
  }

  return retriableConfig;
});

apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (!axios.isAxiosError(error) || !error.config || error.response) {
      return Promise.reject(error);
    }

    const retriableConfig = error.config as typeof error.config &
      RetriableRequestConfig;
    const retryHosts = retriableConfig.__retryHosts ?? [];
    const retryIndex = retriableConfig.__retryIndex ?? 0;
    const hasMoreHosts = retryIndex < retryHosts.length - 1;

    if (!hasMoreHosts) {
      return Promise.reject(error);
    }

    // Network-only failures retry on the next host candidate before surfacing the error.
    retriableConfig.__retryIndex = retryIndex + 1;
    retriableConfig.baseURL = toBaseUrl(
      retryHosts[retriableConfig.__retryIndex] ?? DEFAULT_HOST,
    );

    return apiClient.request(retriableConfig);
  },
);

export const isBackendUnavailable = (error: unknown): boolean => {
  return axios.isAxiosError(error) && !error.response;
};
