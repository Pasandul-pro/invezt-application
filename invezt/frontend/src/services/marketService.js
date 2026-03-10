import axios from "axios";

export const getMarketData = () => {
  return axios.get("http://localhost:5000/api/market");
};

export const getStock = (symbol) => {
  return axios.get(`http://localhost:5000/api/stock/${symbol}`);
};