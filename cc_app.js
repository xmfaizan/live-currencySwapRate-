// all the elements
const amountInput = document.getElementById("amount");
const fromCurrencySelect = document.getElementById("from-currency");
const toCurrencySelect = document.getElementById("to-currency");
const swapBtn = document.getElementById("swap-btn");
const convertBtn = document.getElementById("convert-btn");
const exchangeRateEl = document.getElementById("exchange-rate");
const convertedAmountEl = document.getElementById("converted-amount");
const dateEl = document.getElementById("date");

// api
const API_KEY = "4f9f054f1963cd1fd2fe1b2b";
const API_URL = "https://v6.exchangerate-api.com/v6/";

// starting
async function initialize() {
  // add all currency options to dropdown
  populateCurrencyOptions();

  // set default to USD -> INR
  fromCurrencySelect.value = "USD";
  toCurrencySelect.value = "INR";

  // update flags for both dropdowns
  updateFlag(fromCurrencySelect);
  updateFlag(toCurrencySelect);

  // set today's date
  setCurrentDate();

  // do first conversion
  await convertCurrency();

  // add all the event listeners
  setupEventListeners();
}

// put currency options in dropdowns
function populateCurrencyOptions() {
  // clear old options first
  fromCurrencySelect.innerHTML = "";
  toCurrencySelect.innerHTML = "";

  // get all currency codes and sort them
  const currencyCodes = Object.keys(countryList).sort();

  // add each currency to both dropdowns
  currencyCodes.forEach((currency) => {
    // from dropdown
    const fromOption = document.createElement("option");
    fromOption.value = currency;
    fromOption.textContent = `${currency} - ${getCurrencyName(currency)}`;
    fromCurrencySelect.appendChild(fromOption);

    // to dropdown
    const toOption = document.createElement("option");
    toOption.value = currency;
    toOption.textContent = `${currency} - ${getCurrencyName(currency)}`;
    toCurrencySelect.appendChild(toOption);
  });
}

function getCurrencyName(code) {
  // just some common currencies
  const currencyNames = {
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    JPY: "Japanese Yen",
    CAD: "Canadian Dollar",
    AUD: "Australian Dollar",
    CHF: "Swiss Franc",
    CNY: "Chinese Yuan",
    INR: "Indian Rupee",
    MXN: "Mexican Peso",
  };

  return currencyNames[code] || code;
}

// add flag next to currency code
function updateFlag(element) {
  // get country code from currency code
  const currencyCode = element.value;
  const countryCode = countryList[currencyCode];

  // find parent container
  const container = element.closest(".currency-container");

  // check if flag already exists
  let flagElement = container.querySelector(".currency-flag");

  if (!flagElement) {
    // make new flag if there isnt one
    flagElement = document.createElement("img");
    flagElement.className = "currency-flag";
    flagElement.style.width = "24px";
    flagElement.style.height = "16px";
    flagElement.style.marginRight = "8px";
    flagElement.style.verticalAlign = "middle";
    flagElement.style.position = "absolute";
    flagElement.style.left = "10px";
    flagElement.style.top = "50%";
    flagElement.style.transform = "translateY(-50%)";

    // move text over to make room for flag
    const select = container.querySelector("select");
    select.style.paddingLeft = "40px";

    // add flag to container
    container.querySelector(".select-container").style.position = "relative";
    container.querySelector(".select-container").appendChild(flagElement);
  }

  // set flag image
  flagElement.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
  flagElement.alt = `${currencyCode} Flag`;
}

// put today's date in the last updated area
function setCurrentDate() {
  const now = new Date();
  const options = { year: "numeric", month: "short", day: "numeric" };
  dateEl.textContent = now.toLocaleDateString(undefined, options);
}

// get exchange rate from the api
async function fetchExchangeRate(fromCurrency, toCurrency) {
  try {
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${fromCurrency}`
    );
    const data = await response.json();

    if (data.result === "success") {
      // got it!
      const rate = data.rates[toCurrency];
      return rate;
    } else {
      // api error
      throw new Error("Failed to fetch exchange rate");
    }
  } catch (error) {
    // something went wrong
    console.error("Error getting exchange rate:", error);
    alert("Failed to get exchange rate. Try again later.");
    return null;
  }
}

// do the actual conversion
async function convertCurrency() {
  // get input values
  let amount = parseFloat(amountInput.value);
  const fromCurrency = fromCurrencySelect.value;
  const toCurrency = toCurrencySelect.value;

  // making sure amount is valid
  if (!amount || amount <= 0) {
    amount = 1;
    amountInput.value = "1";
  }

  // show loading
  convertBtn.textContent = "Converting...";
  convertBtn.disabled = true;

  // get rate from api
  const exchangeRate = await fetchExchangeRate(fromCurrency, toCurrency);

  if (exchangeRate !== null) {
    // do math
    const convertedAmount = amount * exchangeRate;

    // update display
    exchangeRateEl.textContent = `${exchangeRate.toFixed(4)} ${toCurrency}`;
    convertedAmountEl.textContent = `${amount} ${fromCurrency} = ${convertedAmount.toFixed(
      2
    )} ${toCurrency}`;
  }

  // reset button
  convertBtn.textContent = "Convert";
  convertBtn.disabled = false;
}

// swap the currencies around
function swapCurrencies() {
  // just swap values
  const tempCurrency = fromCurrencySelect.value;
  fromCurrencySelect.value = toCurrencySelect.value;
  toCurrencySelect.value = tempCurrency;

  // update flags
  updateFlag(fromCurrencySelect);
  updateFlag(toCurrencySelect);

  // convert with new values
  convertCurrency();
}

// add all event listeners
function setupEventListeners() {
  // convert button
  convertBtn.addEventListener("click", convertCurrency);

  // swap button
  swapBtn.addEventListener("click", swapCurrencies);

  // currency selection changes
  fromCurrencySelect.addEventListener("change", () => {
    updateFlag(fromCurrencySelect);
  });

  toCurrencySelect.addEventListener("change", () => {
    updateFlag(toCurrencySelect);
  });

  // make sure amount is a number
  amountInput.addEventListener("input", () => {
    // get rid of letters and stuff - only numbers and dot
    amountInput.value = amountInput.value.replace(/[^0-9.]/g, "");

    // dont allow multiple decimal points
    const decimalCount = (amountInput.value.match(/\./g) || []).length;
    if (decimalCount > 1) {
      amountInput.value = amountInput.value.slice(0, -1);
    }
  });
}

// start when page loads
document.addEventListener("DOMContentLoaded", initialize);
