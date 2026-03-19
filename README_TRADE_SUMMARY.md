# Trade Summary Behavior & Fallback Mechanism

## Overview
This document explains the behavior of the `getTradeSummary` functionality in the backend, specifically regarding how it handles data fetches outside of active trading hours.

## How It Works
The backend is designed to fetch live market prices by calling the official Colombo Stock Exchange (CSE) API:
`https://www.cse.lk/api/tradeSummary`

### Off-Hours Behavior
When the Sri Lankan stock market is closed—such as outside regular trading hours, during weekends, or on public holidays—the CSE API standard behavior is to return an empty list (`[]`). 

Because it receives an empty list, the backend logs the following message:
```
CSE tradeSummary returned no quotes.
```

### Is the API Broken?
**No. Everything is working exactly as intended.** 

The backend is specifically engineered to handle this scenario gracefully. When the CSE API doesn't have live quotes available to return, the backend automatically switches to its **GBM (Geometric Brownian Motion) fallback simulator**.

### The GBM Fallback Simulator
The Geometric Brownian Motion simulator is fundamentally designed to mimic realistic market behaviors. By switching to this simulator when the market is closed, the backend ensures that:
- Your portfolio displays realistic simulated price movements.
- Your charts continue to update dynamically.
- The application as a whole continues to run smoothly and provides an engaging user experience, even when live trading is halted.
