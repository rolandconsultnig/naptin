// Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:4200/api',
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://your-backend-url.com/api',
  },
};

const environment = import.meta.env.MODE || 'development';
export const apiUrl = config[environment as keyof typeof config].apiUrl;

export default config; 