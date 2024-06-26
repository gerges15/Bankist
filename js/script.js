'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2024-04-07T23:36:17.929Z',
    '2024-04-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [8000, 5400, -75, -400, -1510, -1000, 8500, -15],
  interestRate: 1.5,
  pin: 5555,

  movementsDates: [
    '2020-11-01T13:15:33.035Z',
    '2020-11-30T09:48:16.867Z',
    '2020-12-25T06:04:23.907Z',
    '2022-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2021-04-10T14:43:26.374Z',
    '2023-06-25T18:49:59.371Z',
    '2024-03-26T12:01:20.894Z',
  ],
  currency: 'EGP',
  locale: 'ar_EG',
};
const account3 = {
  owner: 'Gerges Sami',
  movements: [5000, 3400, -150, -790, -3210, -500, 17000, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2024-03-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2, account3];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
const formatCurr = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};
const formatMovementData = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date1 - date2) / (1000 * 60 * 60 * 24)));
  const passedDays = calcDaysPassed(new Date(), date);

  if (passedDays === 0) return 'Today';
  if (passedDays === 1) return 'Yesterday';
  if (passedDays <= 7) return `${passedDays} days ago`;
  // else {
  //   const day = `${date.getDay()}`.padStart(2, 0);
  //   const month = `${date.getMonth() + 1}`.padStart(2, 0);
  //   const year = date.getFullYear();
  //   return `${day}/${month}/${year}`;
  // }
  return new Intl.DateTimeFormat(locale).format(date);
};
const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);

    const displayDate = formatMovementData(date, acc.locale);
    const formattedMov = formatCurr(mov, acc.locale, acc.currency);
    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
    <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  const formattedBalance = formatCurr(acc.balance, acc.locale, acc.currency);
  labelBalance.textContent = `${formattedBalance}`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  const formattedIncomes = formatCurr(incomes, acc.locale, acc.currency);
  labelSumIn.textContent = `${formattedIncomes}`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  const formattedOut = formatCurr(out, acc.locale, acc.currency);
  labelSumOut.textContent = `${formattedOut}€`;
  // labelSumOut.textContent = `${Math.abs(out.toFixed(2))}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  const formattedInterest = formatCurr(interest, acc.locale, acc.currency);
  labelSumInterest.textContent = `${formattedInterest}`;
  // labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;
//
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;
////////////////

const now = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  weekday: 'long',
};
const locale = navigator.language;

////////////////
btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
    //
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());
    // Update UI
    updateUI(currentAccount);
    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      // Add movement
      currentAccount.movements.push(amount);
      ////
      currentAccount.movementsDates.push(new Date().toISOString());
      // Update UI
      updateUI(currentAccount);
    }, 25000);
    clearInterval(timer);
    timer = startLogOutTimer();
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
//
const startLogOutTimer = function () {
  let time = 55;
  const tick = function () {
    let minute = String(Math.trunc(time / 60)).padStart(2, 0);
    let sec = String(time % 60).padStart(2, 0);
    labelTimer.textContent = `${minute}:${sec}`;
    if (time === 0) {
      // labelTimer.textContent = `${minute}:${sec}`;

      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    time--;
  };
  //
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
// console.log(Number.parseInt('32px'));
// console.log(Number.parseInt('32px', 10));
// console.log(Number.parseFloat('2.5px', 10));
// console.log(Number.parseInt('2.5px', 10));

// console.log(Number.isNaN(32));
// console.log(Number.isNaN('2'));
// console.log(Number.isNaN(+'2C'));
// console.log(Number.isFinite('2C'));
// console.log(Number.isFinite(2 / 0));

// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));
// console.log(8 ** (1 / 3));
// console.log(Math.max(1, 2, 4, 5, 7, 12, 4, 6, 8, 7, 7, 23));
// console.log(Math.min(1, 2, 4, 5, 7, 12, 4, 6, 8, 7, 7, 23));
// console.log(Math.PI);

// const randomInt = (min, max) => Math.floor(Math.random() * (max - min)) + min;

// labelBalance.addEventListener('click', function () {
//   [...document.querySelectorAll('.movements__row')].forEach((curr, i) => {
//     if (i % 2 == 0) curr.style.backgroundColor = 'orangered';
//   });
// });

// const dimeter = 283_460_000_000;
// console.log(dimeter);
/*
console.log(new Date('2024-04-12T16:37:53.947Z').getDay());
console.log();

console.log();

const future = new Date(2037, 10, 19, 15, 23);

const calcDaysPassed = (date1, date2) =>
  Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));
const days1 = calcDaysPassed(new Date(2037, 3, 23, 12), new Date(2037, 3, 13));
console.log(days1);
*/

const number = 343438438428.43;
const options2 = {
  style: 'unit',
  unit: 'mile-per-hour',
};

console.log('US  :', new Intl.NumberFormat('EN-US', options2).format(number));
console.log(
  'Germany  :',
  new Intl.NumberFormat('de-DE', options2).format(number)
);
console.log('arab  :', new Intl.NumberFormat('ar-sy', options2).format(number));
console.log(
  'Brows  :',
  new Intl.NumberFormat(navigator.language, options2).format(number)
);

setTimeout(() => console.log('Here is your pizz 🍕'), -0);
console.log('waiting...');
/*
setInterval(() => {
  const now = new Date();
  console.log(
    `${now.getHours()}:${now.getMinutes()}:{${now.getSeconds().padStart(0, 2)}}`
  );
}, 1000);
*/
// console.log('hello wold😊');
// console.log(+inputLoginPin.value);
// console.log(inputLoginPin.value);
