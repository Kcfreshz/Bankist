'use strict';
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

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

const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = ''; // Used to clear the inner html before adding contents. We are using innerHTML as a setter.

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__value">${mov}€</div>
    </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html); // insertAdjacentElement is used to insert html into the web. Used to incorporate html built in the js script into the appropriate container. This method accept 2 strings, the first string is the position(afterbegin) in which we want to attach the html and the second is the string containing the html that we want to insert(html)
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0); // The reason why we can set a property on the acc object and it will set that on the account objects that we have above is that they all these references points to the same object in the memory heap.
  labelBalance.textContent = `${acc.balance}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}€`;

  const out = Math.abs(
    acc.movements.filter(mov => mov < 0).reduce((acc, mov) => acc + mov, 0)
  );

  labelSumOut.textContent = `${out}€`; // The Math.abs method can be wrapped around the out 'Math.abs${out}' to give the same result.

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposits => (deposits * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${Math.abs(interest)}€`;
}; // NB: We should not overuse chaining, we should try to optimize it because chaining tons of methods one after the other can cause a real performance issues if we have really huge arrays. So, if we have a huge chain of methods, chained one after another we should try to compress all the functionality that they do into as little methods as possible. For example, sometimes we create way more map methods than we actually need, where we could just do it all in just one map call. So, when you chainmethods like this, keep looking for opportunities of keeping up your code performance. Secondly, it's a bad practice in JS to chain methods that mutate the underlying original array and the example of that is the splice method. Therefore, you should not chain method like the splice or the reverse method except in small application like this Bankist App is not a big deal and is not going to cause problems, but in a large scale application it usually a good practice to avoid mutating arrays. We will talk more about this in Functional Programming.

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join(''); // The split method splits the strings and packs them in an array. With the strings being packed in an array we will be able to loop over the array to get the 1st letter using map method. With map method, in each iteration we get the first letter. Since, the map method returns a new array, we'll then call the join method on the array to give us the 1st letter of the string.
  });
};
createUsernames(accounts); // In this lecture, it was very important to understand the use case for the map method which was perfect because it allowed us to create a new simple array, which contains only the initials of whatever name it is used on. On the other hand, the forEach method was a great use case to produce some so called side effects, to simply do some work without returning anything.

const updateUI = function (acc) {
  displayMovements(acc.movements);
  // Display balance
  calcDisplayBalance(acc);
  // Display summary
  calcDisplaySummary(acc);
};

// Event handler
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  // Prevents form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Clearing the input field
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  // Clearing the inputs
  inputTransferTo.value = inputTransferAmount.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }

  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    ); // findIndex method only returns the index of the first element in the array that matches the condition. It returns the index and not the element itself. The findIndex method is similar to the indexOf(23), the big difference is that with findIndex we can only search for value that's in the array, if the array containes 23 it is true if not it's false but with findIndex we can create complex condition. Both returns index number. NB: Both the find and findIndex methods gets access to current index and the current entire array, so beside the current element the other two values are available. Secondly, find and findIndex methods were added to JS in ES6 so they might not work in super old browsers but there is a way to support old browsers in JS.

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
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

////////////////////////////////////////////////////////
// LECTURES
/*
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, 130, 70, 1300];

// Array Methods

// Why do Arrays have methods? Remember that methods are simply functions that we can call on Objects. Basically, they are functions attached to objects. If we have array methods that means arrays themselves are also Objects. So, these array methods are simply functions that are attached to all arrays that we create in JS. Therefore, arrays are objects and they get access to special built-in methods that we can essentially see as tools for arrays.

// SLICE Method
// Slice method: Similar to slice method in string. For this method, we can extract part of any array without changing the original array.
let arr = ['a', 'b', 'c', 'd', 'e'];
console.log(arr.slice(2));
console.log(arr.slice(2, 4)); // The length of the output array will be the end-parameter minus the beginning-parameter(4-2).
console.log(arr.slice(-2));
console.log(arr.slice(-1));
console.log(arr.slice(1, -2)); // NB: The slice ends before the end-parameter is reached. This means that the slice only stops at the element before the element of the specified end-parameter. Here, it means that the slice start extracting from position 1 EXPECT the last two element.
console.log(arr.slice()); // Here, we use slice method to create a shallo copy of the arr array. Therefore, we can use slice method to create a shallow copy of any array, we simply call it without passing any argument.
console.log([...arr]); // The same as using slice method to create a shallow copy.

// SPLICE Method: The splice method almost work the same way as the slice method but the difference is that it CHANGES the original array(It mutates the original array).

// console.log(arr.splice(2)); // splice does mutate the arr array. The splice method returns an element but most of the time the value that splice method returns doesn't interest us. What we interested in is to delete one or two elements using splice.
arr.splice(-1);
arr.splice(1, 2); //The splice method is somehow to zero-based because it starts counting it's first element from 1. The first parameter in splice method is not deleted while the no 2nd parameter is the number of the array that should be deleted. For instance, 'arr.splice(1, 2);' element no 1 is not deleted but 2 two elements are being deleted after element 1. This means that in splice the 1st parameter is preserved while the 2nd parameter gives the number of array that should be deleted after the 1st parameter.
console.log(arr);

// REVERSE: The reverse method reverses the order of the array and mutates the original array.
arr = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse());
console.log(arr2);

// CONCAT: Concat method is used to concatenate two arrays. Concat method doesn't mutate involved arrays.
const letters = arr.concat(arr2);
console.log(letters);
console.log([...arr, ...arr2]); // This is the same as concat method.

// JOIN: Join array elements together with a separator.
console.log(letters.join(' - '));

// NB: There's no developer who knows all these methods by heart. So, if any the methods you need or don't understand you can always come back to this lecture or check the documentation on MDN.


// AT Method:
const arr = [23, 11, 64];
console.log(arr[0]);
console.log(arr.at(0));

// Getting last array element
console.log(arr[arr.length - 1]);
console.log(arr.slice(-1)[0]);
console.log(arr.at(-1));

console.log('Fresh'.at(3));
console.log('Fresh'.at(-1));


const movements = [200, 450, -400, 3000, -650, 130, 70, 1300];
// for (const movement of movements) {
for (const [i, movement] of movements.entries()) {
  // This is a way of getting the counter and the element from an array.
  if (movement > 0) {
    console.log(`Movement ${i + 1}: You deposited ${movement}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(movement)}`); // The abs is used to remove the minus sign (-)
  }
}

console.log('----forEach----');

movements.forEach(function (mov, i, arr) {
  // Here, we use a callback function to tell a high order function which is forEach what to do.
  if (mov > 0) {
    console.log(`Movement ${i + 1}: You deposited ${mov}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(mov)}`);
  }
}); // When we are looping using forEach it passes three thing: 1) The element 2) The index 3) The whole array we are looping. Therefore, to get the element, index and the array we have to specify it in this order in the function-argument to get the 3 things that forEach loop passes through.


// forEach With Maps and Sets
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

currencies.forEach(function (value, key, map) {
  // with maps the 1st parameter gives the value, 2nd the key and 3rd the entire map
  console.log(`${key}: ${value}`);
});

const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
console.log(currenciesUnique);

currenciesUnique.forEach(function (value, _, set) {
  // In Set the forEach loop doesn't pass key because Set doesn't have a key
  console.log(`${value}: ${value}`);
});

// DATA Transformations: map, filter, reduce: In JS there 3 big and important array method that we use to all the time to perform data transformations. These are methods that we use to create new arrays based on transforming data from other arrays. These tools are Map, Filter and Reduce.
// Map Method: This is an array method that we can use to map over arrays. map is similar to forEach method but the difference is that map creates a brand new array based on the original array. Eseentially, the Map method takes an array, loops over that array and in each iteration, it applies a callback function that we specify in our code to the current array element. So, in the example below we say that each element should be multiplied by 2 and with this callback in place, the Map method multiplies every single element by two and puts it into a new array. We say that it maps the value of the original array to a new array and that's why this method is called map. It's very useful, way more useful than forEach method because forEach simply allows us to do some work with each array element. But map on the other hand, builds us a brand new array containing the result of applying an operation to the original array.

// Filter Method: It's used to filter for elements in the original array which satisfy a certain condition. So, in the example below we are only looking for elements greater than 2. Therefore, only elements that pass the test that we specified will make it into a new filtered array. In other words, elements for which the condition is true will be included in a new array that filter method returns, all other elements will get filtered out, they will not be included into the new array.

// Reduced Method: We use to boil down all the elements of the original array into one single value. And example of this can be to add all the elements of an array together. But we can also do many other interesting things. For the example of adding up all the numbers in the array, we need to specify an operation we have an accumulator variable then as the reduce method loops over the array, it keeps adding the current element onto the accumulator until the end of the loop we have the total sum of all the elements. In this method there is no new array but instead the reduced value will be returned.

// The Map Method:
const movements = [200, 450, -400, 3000, -650, 130, 70, 1300];
const eurToUsd = 1.1;
// const movementsUSD = movements.map(function (mov) {
  //   return mov * eurToUsd;
  // }); // Here, we'll end up with a new array containing all the movements but converts it from euros to US dollars and this is because what we returned here from the callback function(return keyword). We could have returned something else like 23. If we return 23, it means that in each iteration of the original movements array, it simply put 23 into the new array at the same position. NB: The map method doesn't mutate the original array.
  const movementsUSD = movements.map(mov => mov * eurToUsd); // This is a another of writing the above code using arrow function.
  console.log(movementsUSD);
  
  const movementsUSDfor = [];
  for (const mov of movements) movementsUSDfor.push(mov * eurToUsd); // This is a different way of writing the above using for-of loop.This is a completely diff philosophy, in the map above we use a function to solve the problem of creating a new array while here we simply loop over one array and manually create a new one. These are complete different philosophies or we can also say paradigms. The map method is more in line with functional programming(In modern JS, there is definitely a push going on in the direction of functional programming). Therefore, in modern JS the map method is the way to go, using methods together with callback functions is the new and modern way of doing stuff.
  console.log(movementsUSDfor);
  
  // const movementsDescription = movements.map((mov, i, arr) => {
      //   if (mov > 0) {
        //     return `Movement ${i + 1}: You deposited ${mov}`;
        //   } else {
          //     return `Movement ${i + 1}: You withdrew ${Math.abs(mov)}`;
//   }
// }); // Just like the for-each method, the map method has access to the exact 3 parameters. So, besides the current array element we get access to the current index as well as the whole array. NB: It's completely acceptable to have two return statements or even more in the same function as long as only one of them is executed. So, in this case only one of the return keyword return at a time, It's impossible for both of them to return at the same time. Also, we just want to do something with these values which is to place the values into a new array.
const movementsDescription = movements.map(
  (mov, i) =>
  `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
    mov
    )}`
    ); // A shorter way of writing the above code using a ternary operator.
    console.log(movementsDescription);
    

// Filter Method: It is used to filter elements that satisfy a certain condition. How do we specify such a condition? We use a callback function. Just like the forEach, this method also gets access to the current element, the current index and the entire array. This method creates a new array.
const deposits = movements.filter(function (mov, i, arr) {
  return mov > 0;
});
console.log(deposits);

const depositsFor = [];
for (const mov of movements) if (mov > 0) depositsFor.push(mov); // This is a similar way of writing the above code using the for-of loop
console.log(depositsFor);

const withdrawals = movements.filter(mov => mov < 0); // Filtering the withdrawals using the arrow method. NB: The movement array is on top of the strict just after the strict mode.
console.log(withdrawals)


// The Reduce Method: We use the reduce method to essentially boil-down all the elements in an array into one single value. The callback function will be called in each iteration of the array.
console.log(movements);

// The reduced method has a callback function. In the callback function unlike the map and filter method, the 1st parameter is the accumulator, 2nd parameter is the current element, 3rd element is the index and the 4th is the whole array. The 1st parameter which is called an accumulator, is essentially like a snowball that keeps accumulating the value that we ultimately wants to return. So, in the case of adding all the elements or all the number of an array together that will be the sum. As always the callback function will be called in each iteration of looping over the array. Reduce loop over the array and calls this callback in each iteration. Here, what do we actually do in each iteration? Well, since the accumulator is the value that we'll keep adding to, what we gonna do is to add the current value to the accumulator. And this works because in each call of the callback function the accumulator will be the current sum of all the previous values. So, we'll keep adding this accumulator in each iteration of the loop. Finally, we have to return this value from the callback, that's how the new accumulator can then be used in the next iteration of the loop. So, basically in each loop iteration, we return the updated accumulator. NB: In this case, zero(0) is the accumulator.

const balance = movements.reduce((acc, cur, i, arr) => acc + cur, 0); // Rewriting the above code using arrow function.
console.log(balance);

let balance2 = 0;
for (const mov of movements) balance2 += mov; // Doing the same thing using the for-of loop. There is a common pattern that we always need an external variable when using a for-of loop which is fine when we need just one loop but can become very cumbersome when use many loops for doing many operations. These methods we are studying completely avoids the extra variable. They simply return the variable or the value right way.
console.log(balance2);
// Maximum value: We can use reduce to get the maximum value because reduce is for boiling down the array into one single value but that value can be whatever we want. It doesn't have to be a sum, it could be whatever we want. It could be multiplication or even something completely different like a string or an object. Here, we want to get the maximum number. There is a ton of things we can do with the reduce method, it by far the  MOST POWERFUL array method there is. And because of this, it can also be the hardest to use. So because of that, we need to always think exactly what we want the accumulator and the current value should be and how they should interact.
const max = movements.reduce(function (acc, mov) {
  if (acc > mov) return acc;
  else return mov;
}, movements[0]);
console.log(max);


// The Magic of Chaining Methods
const eurToUsd = 1.1;
const totalDelpositsUSD = movements
  .filter(mov => mov > 0)
  .map(mov => mov * eurToUsd)
  .reduce((acc, mov) => acc + mov, 0); // We can only chain a method after another one, if the first one returns an array.
console.log(totalDelpositsUSD);


// The find Method: We can use the find method to retrieve one element of an array based on a condition.The find method accepts a condition, it also accepts a callback function which will then be called as the method loops over the array. Find is just another method that loops over the array and does something different. The find method unlike the filter method does not return an array but instead it returns the 1st element that satisfies the condition. The 2 big difference between find and filter method is that find method returns only the first element that match the condition but filter method returns all the elements that match the condition. Secondly, the filter method returns a new array while the find method returns the element itself(not an array).
const firstWithdrawal = movements.find(mov => mov < 0);
console.log(movements);
console.log(firstWithdrawal);
console.log(accounts);
const account = accounts.find(acc => acc.owner === 'Jessica Davis');
console.log(account);

for (const account2 of accounts) {
  if (account2.owner === 'Jessica Davis') console.log(account2);
} // Using the for-of loop to implement the same program that the find method did above.


// some and every method: The some method is similar to the includes method but the difference is that the includes method is used to check for equality while the some method is used to check for condition. The every method is similar to the some method but the difference is that every method returns true if all the elements in the array satisfied the condition that we pass in.

console.log(movements);

// checks for equality
console.log(movements.includes(-130));

// SOME: checks for condition
const anyDeposits = movements.some(mov => mov > 1500);
console.log(anyDeposits);

// EVERY:
console.log(movements.every(mov => mov > 0));
console.log(account4.movements.every(mov => mov > 0));

// separate callback: Up until this point we've written callback function directly into our array method. However, we could also write these functions separately and pass the function as a callback. This is useful for the DRY principle
const deposit = mov => mov > 0;
console.log(movements.some(deposit));
console.log(movements.every(deposit));
console.log(movements.filter(deposit));


// flat and flatMap: These methods were introduced in ES2019 and therefore might not work in super old browsers.
const arr = [[1, 2, 3], [4, 5, 6], 7, 8];
console.log(arr.flat()); // This flattens out the array by removing the nested arrays. This goes one level deep when flattening the array.

const arrDeep = [[[1, 2], 3], [4, [5, 6]], 7, 8]; // This one has two level of nesting which is an array inside an array, inside an array.
console.log(arrDeep.flat(2)); // By inserting 2 in the flat method it goes 2 layer deep into flattening the array. That's it flattens an array inside an array, inside an array.

// Let's say the bank wants to have the sum of all the movements that occured in all the accounts. Here, is how we do it.

const accountMovements = accounts.map(acc => acc.movements);
console.log(accountMovements);
const allMovements = accountMovements.flat();
console.log(allMovements);

const overallBalance = allMovements.reduce((acc, mov) => acc + mov, 0);
console.log(overallBalance);

const overallBalance2 = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acc, mov) => acc + mov, 0); // Using chaining to do the same as the above. This true because the methods returns an array and we can chain another method on the returned array.
console.log(overallBalance2);

// flatMap: flatMap is a combination of flat and map method. This is because it's common to practice to map an array and then flattens it therefore flatMap was introduced. NB: flatMap only goes one level deep and we cannot change. If we deep to go 2 level deep then we have to use flat method. Also, flatMap has the same syntax as map method, it has to receive the same callback method as a map method.

const overallBalance3 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acc, mov) => acc + mov, 0);
console.log(overallBalance3); // Keep these methods in mind whenever you have nested arrays and need to work with them.That happens more than we think.


// Sorting Arrays: Sorting is a much discussed topic in computer science and there are countless algorithms or methods of sorting values. Here, we will talk about JS built-in sort method. The JS built-in sort method mutates the original array.

// Strings
const owners = ['KC', 'Jonas', 'Zach', 'Adam', 'Martha'];
console.log(owners.sort()); // The owners are sorted alphabetically.

// Numbers
console.log(movements);
// console.log(movements.sort()); // The result of the sorted movements is not in any way sorted at all. The reason is because sort method does sorting based on string, that might sound weird but that's how it works by default. Basically, what it does is to convert everything to string and then do the sorting. However, if we look at the result of the movements.sort() then we'll see that the result actually makes sense. Well, we can fix this by passing a compare callback function into the sort method. The callback function is called with 2 parameters and these two parameters are essentially the current value and the next value if we imagine the sort method looping over the array. To understand how the compare function works, and how to write it. Let's think of a and b as simply being two consecutive numbers in the array and it doesn't matter which ones. Let's take two numbers from the movements array 450 and -400, let's compare these two. In our callback function, 'if we return less than zero then the value 'a' will be sorted before the value 'b' and the opposite if we return a positive value then 'a' will be put before 'b' in the sorted array.

// return < 0, a, b (keep order)
// return > 0, b, a (switch order)

// Ascending
// movements.sort((a, b) => {
//   if (a > b) return 1;
//   if (a < b) return -1;
// }); //It's good to note, that 'return 1' means to change order while 'return -1' means to keep order.
movements.sort((a, b) => a - b); // We know that if 'a' is greater than 'b' then (a-b) will be a positive number then we return that positive number, it doesn't have to be exactly one just something greater than zero. If it's the other way round, if 'a' is less than 'b' then (a-b) will be a negative number therefore something negative is returned just as -1 but again it can be any number. By the way, if we return zero in case (a-b) is the same then their position will remain unchanged.
console.log(movements);

// Descending
// movements.sort((a, b) => {
//   if (a > b) return -1;
//   if (a < b) return 1;
// });
movements.sort((a, b) => b - a); // This works the same as above. NB: What we are returning is (b-a). Takeaway: When you want to sort in Ascending order then (a-b) while in Descending order then the operation will be (b-a). Hence, when you say a-b you kinda saying that position 1 which is a smaller number minus position 2 which is a bigger number thereby placing the lower number first before the larger number therefore arranging in Ascending order which is going from small to big. In the other way round, doing (b-a) is placing the larger numbers first before the smaller numbers which is in Descending order. That's going from big to small.
console.log(movements);
*/

// More Ways of Creating and Filling Arrays: This lecture is all about how to programmatically create and fill arrays. Before now, we've already had our data and then we manually create arrays like this 'console.log([1,2,3,4,5,6,7])' or console.log(new Array(1,2,3,4,5,6,7)). However, we can actually generate arrays programatically without having to define all the items manually. There are many situations this is necessary and there are multiple ways of doing it.

const arr = [1, 2, 3, 4, 5, 6, 7];

// Empty arrays + fill method
const x = new Array(7); // This is the easiest way to create an array by using a constructor function and passing in one element. We might think this creates a new array with the element no 7 but it doesn't, it actually creates a new array with seven empty elements in there and it simply contains nothing. This output is weird and it's because of the weird behaviour of this Array() function which does so whenever we pass in one argument, then it creates a new empty argument with that length.So, if you don't know about this special particularity of the Array() constructor function then this can lead to weird errors. We cannot use this x array for anything, for example we cannot call the map method on it to now fill it up. We can only call the fill() method on x. The fill method does mutate the underlying array. In the fill method, we can specify the begin parameter and the end parameter just like in slice method. Like in slice the final index is not going to be included in the array. We can also use the fill method on other arrays not just empty arrays.
console.log(x);
// console.log(x.map(() => 5)); This doesn't work
x.fill(1, 3, 5);
x.fill(1);
console.log(x);

arr.fill(23, 4, 6); // Using fill method on another arr that is not filled. 23 replaces the elements in position 4&5. NB: The last argument is not reached, and array is zero based that's why only the 6 is not reached.
console.log(arr);

// What if we want to create the arr array programtaically then we have to use the Array.from() method. This is actually completely new. Here we are not using the 'from' as a method on an array instead we are using it on the Array() constructor, that's why is Array.from. The Array constructor(new Array()) is a function and on this function we call the 'from() method'. We will make sense of this in the Object Oriented Programming section.

// Array.from()
const y = Array.from({ length: 7 }, () => 1); // Into this function we will pass an object with the lenghth property of 7 and the second argument is like a mapping function(It's exactly like the callback function that we pass in into the map function). Here, we get 1 in each array positions. This method is cleaner than using weird new Array behaviour with the fill method.
console.log(y);

const z = Array.from({ length: 7 }, (_, i) => i + 1); // Adding one to the index gives us values from 1-7. Since we don't need the first parameter then we throw it away by specifying '_' this is because we still need something to occupy the position of the first argument and we use '_' that we do not need the need the first parameter and other programmers will understand this convention and automatically know that we don't use the parameter. This is how we create an array programatically
console.log(z);

// This Array.from() was initially introduced into JS in order to create arrays from arrays-like structures. Remember, iterables things like Strings, Maps or Sets, they are all iterables in JS and so they can be converted to real arrays using Array.from() and that's also the reason for the name of the function because we create arrays from other things. Another great example of array-like structure is the result of using querySelectorAll(). querySelectorAll() returns a NodeList which is something like an array which contains all the selected elements but it's not a real array so it doesn't have most of the array methods like map() or reduce(), for example. If we want to use real array methods on NodeList we have to convert the NodeList to an array and for that Array.from() is perfect.

labelBalance.addEventListener('click', function () {
  // We can attach eventlisteners to every object, it doesn't have to be a button. We attched it to the labelBalance so we could read all the movements from the user interface.
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => Number(el.textContent.replace('€', ''))
  ); // The querySelector with the class is the element that we want to convert to an array. NB: The 2nd argument of the Array.from() method is the mapping callback(el => Number(el.textContent.replace('€', '') and that's what we used to get the value of the elements by placing textContent.value in each elements when looping over the array using map() method). Omitting the map function of the Array.from will just select all the elements and puts it in an array.

  console.log(movementsUI);

  const movementsUI2 = [...document.querySelectorAll('.movements__value')];
  console.log(movementsUI2.map(el => Number(el.textContent.replace('€', '')))); // This is another way of converting NodeList which is not a real array into an array using the spread operator.
});

// Summary: Which Array Method to Use? To know the exact method we are to use we have to know exactly what we want to do. The following answers the questions on our mind.

// To mutate the original array then we use: Add to Original array 👉: .push(end) & unshift(start);  Remove from Original array 👉: .pop(end), .shift(start), .splice(any); others 👉: .reverse(), .sort(), .fill().

// Do we want a new array: computed from original array 👉: .map(loop); Filtered using condition 👉: .filter(); Portion of original👉: .slice(); Adding original to other👉: .concat(); Flattening the original👉: .flat(), flatMap()

// Do we want an array index: Based on value👉: .indexOf(); Based on test condition👉: findIndex(); An array element, Index of an array itself 👉: .find() this is based on a test condition specified in a callback function.

// To check if an array includes: Based on value 👉: .includes(), Based on test condition 👉: .some(), .every() NB: These 3 methods all returns a boolean values which is very helpful in a condition, for example in an if/else statement that's where many times we use one of these methods.

// To transform an array: Transform to a string based on a separator 👉: join(); Transform to value 👉: .reduce() this boils down array to single value of any type: number, string, boolean or even new array or object. In fact we could some of the array methods with a reduce() method.

// To loop over an array without producing any new value we use the forEach method.

// Array Methods Practice:

// Exercise 1:
const totalDeposits = accounts
  .flatMap(mov => mov.movements)
  .filter(mov => mov > 0)
  .reduce((acc, mov) => acc + mov, 0);
console.log(totalDeposits);

// Exercise 2: how many deposits that have been in the bank with atleast 1000

// const Deposits100 = accounts
//   .flatMap(mov => mov.movements)
//   .filter(mov => mov >= 1000).length;
const Deposits100 = accounts
  .flatMap(mov => mov.movements)
  .reduce((acc, mov) => (mov >= 1000 ? ++acc : acc), 0); // Using the reduce method to filter elements and also to determine the length just like the above where we used both filter method and the .length to determine the number of all deposits greater or equals to 1000.
console.log(Deposits100);

// Prefixed ++ operator
let a = 10;
// console.log(a++); // Here, the result is still 10. The result is supposed to be 11 but why is it still 10? Well, the ++ operator actually does the increment the value but it still returns the previous value which is 10. So, when we use it like this, it returns the previous value which is 10.
console.log(++a); // Using the so called prefix operator solves the problem we have above and instantly returns the increased value and not the previous value which was 10. The ++ is written before the operant.
console.log(a);

// Exercise 3:
const { deposits, withdrawals } = accounts
  .flatMap(mov => mov.movements)
  .reduce(
    (acc, mov) => {
      // mov > 0 ? (acc.deposits += mov) : (acc.withdrawals += mov);
      acc[mov > 0 ? 'deposits' : 'withdrawals'] += mov; // Using the bracket notation instead of the dot notation like the above.
      return acc;
    },
    { deposits: 0, withdrawals: 0 }
  );
console.log(deposits, withdrawals);

// Exercise 4: To convert all the words in a sentence to a titleCase. Title case means that all the words in a sentence are capitalize except for some of them.
// this is a nice title -> This Is a Nice Title
const convertTitleCase = function (title) {
  const capitalize = str => str[0].toUpperCase() + str.slice(1);

  const exceptions = ['a', 'an', 'and', 'the', 'but', 'or', 'on', 'in', 'with'];
  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitalize(word)))
    .join(' ');
  return capitalize(titleCase);
};

console.log(convertTitleCase('this is a nice title'));
console.log(convertTitleCase('this is a LONG title but not too long'));
console.log(convertTitleCase('and here is another title with an EXAMPLE'));

/*
////////////////////////////////////////////////////////
const displayMovements = function (movements, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
  <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__value">${mov}</div>
  </div>
  `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance} EUR`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}euro`;

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(outcomes)}euro`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}euro`;
};

const createUsernames = function (acts) {
  acts.forEach(function (act) {
    act.username = act.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc.movements);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// Event handler
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  //Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
  }
  containerApp.style.opacity = 100;

  // Clear input fields
  inputLoginUsername.value = inputLoginPin.value = '';
  inputLoginPin.blur();

  // Update UI
  updateUI(currentAccount);
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
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
    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    // Add movement
    currentAccount.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
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

  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

console.log(account1);

// Working With Arrays

// Coding Challenge #1

// Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners
// about their dog's age, and stored the data into an array (one array for each). For
// now, they are just interested in knowing whether a dog is an adult or a puppy.
// A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years
// old.
// Your tasks:
// Create a function 'checkDogs', which accepts 2 arrays of dog's ages
// ('dogsJulia' and 'dogsKate'), and does the following things:
// 1. Julia found out that the owners of the first and the last two dogs actually have
// cats, not dogs! So create a shallow copy of Julia's array, and remove the cat
// ages from that copied array (because it's a bad practice to mutate function
// parameters)
// 2. Create an array with both Julia's (corrected) and Kate's data
// 3. For each remaining dog, log to the console whether it's an adult ("Dog number 1
// is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy
// �
// ")
// 4. Run the function for both test datasets
// Test data:
// § Data 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
// § Data 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]
// Hints: Use tools from all lectures in this section so far �
// GOOD LUCK �/

const checkDogs = function (dogsJulia, dogsKate) {
  const dogsJuliaCorrected = dogsJulia.slice();
  dogsJuliaCorrected.splice(0, 1);
  dogsJuliaCorrected.splice(-2);
  // dogsJulia.slice(1, 3);

  const dogs = dogsJuliaCorrected.concat(dogsKate);
  console.log(dogs);

  dogs.forEach(function (dog, i) {
    if (dog >= 3) {
      console.log(`Dog number ${i + 1} is an adult, and is ${dog} years old`);
    } else {
      console.log(`Dog number ${i + 1} is still a puppy 🐶`);
    }
  });
};

checkDogs([3, 5, 2, 12, 7], [4, 1, 15, 8, 3]);

// Coding Challenge #2

// Let's go back to Julia and Kate's study about dogs. This time, they want to convert
// dog ages to human ages and calculate the average age of the dogs in their study.
// Your tasks:
// Create a function 'calcAverageHumanAge', which accepts an arrays of dog's
// ages ('ages'), and does the following things in order:
// 1. Calculate the dog age in human years using the following formula: if the dog is
// <= 2 years old, humanAge = 2 * dogAge. If the dog is > 2 years old,
// humanAge = 16 + dogAge * 4
// 2. Exclude all dogs that are less than 18 human years old (which is the same as
// keeping dogs that are at least 18 years old)
// 3. Calculate the average human age of all adult dogs (you should already know
// from other challenges how we calculate averages �)
// 4. Run the function for both test datasets
// Test data:
// § Data 1: [5, 2, 4, 1, 15, 8, 3]
// § Data 2: [16, 6, 10, 5, 6, 1, 4]
// GOOD LUCK �

// Coding Challenge #3

// Rewrite the 'calcAverageHumanAge' function from Challenge #2, but this time
// as an arrow function, and using chaining!
// Test data:
// § Data 1: [5, 2, 4, 1, 15, 8, 3]
// § Data 2: [16, 6, 10, 5, 6, 1, 4]
// GOOD LUCK �

const calcAverageHumanAge = ages =>
  ages
    .map(age => (age <= 2 ? 2 * age : 16 + age * 4))
    .filter(age => age >= 18)
    .reduce((acc, age, i, arr) => acc + age / arr.length, 0);

const calcAverageHumanAge = function (ages) {
  const humanAges = ages.map(age => (age <= 2 ? 2 * age : 16 + age * 4));
  const adults = humanAges.filter(age => age >= 18);
  console.log(humanAges);
  console.log(adults);

  // const average = adults.reduce((acc, age) => acc + age, 0) / adults.length

  const average = adults.reduce(
    (acc, age, i, arr) => acc + age / arr.length,
    0
  );

  // 2,3. (2+3)/2 = 2.5 === 2/2+3/2 = 2.5

  return average;
};

const avg1 = calcAverageHumanAge([5, 2, 4, 1, 15, 8, 3]);
const avg2 = calcAverageHumanAge([16, 6, 10, 5, 6, 1, 4]);
console.log(avg1, avg2);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const eurToUsd = 1.1;

// PIPELINE
const totalDelpositsUSD = movements
  .filter(mov => mov > 0)
  .map((mov, i, arr) => {
    return mov * eurToUsd;
  })
  // .map(mov => mov * eurToUsd)
  .reduce((acc, mov) => acc + mov, 0);

console.log(totalDelpositsUSD);
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

let arr = ['a', 'b', 'c', 'd', 'e'];

// Slice method
console.log(arr.slice(2));
console.log(arr.slice(2, 4));
console.log(arr.slice(-2));
console.log(arr.slice(-1));
console.log(arr.slice(1, -2));
console.log(arr.slice());
console.log([...arr]);

// Splice method
// console.log(arr.splice(2));
arr.splice(-1);
console.log(arr);
arr.splice(1, 2);
console.log(arr);

// REVERSE
arr = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse());
console.log(arr2);

// CONCAT
const letters = arr.concat(arr2);
console.log(letters);
console.log([...arr, ...arr2]);

//  JOIN
console.log(letters.join(' - '));

const arr = [23, 11, 64];
console.log(arr[0]);
console.log(arr.at(0));

// getting last array element
console.log(arr[arr.length - 1]);
console.log(arr.slice(-2)[1]);
console.log(arr.at(-1));

console.log('kelechukwu'.at(0));
console.log('kelechukwu'.at(-1));

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// for (const movement of movements) {
for (const [i, movement] of movements.entries()) {
  if (movement > 0) {
    console.log(`Movement ${i + 1}: You deposited ${movement}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(movement)}`);
  }
}

console.log('----FOREACH-----');
movements.forEach(function (mov, i, arr) {
  if (mov > 0) {
    console.log(`Movement ${i + 1}: You deposited ${mov}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(mov)}`);
  }
});

// MAP
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

currencies.forEach(function (value, key, map) {
  console.log(`${key}: ${value}`);
});

// SET
const currenciesUnique = new Set(['USD', 'GBP', 'USD', 'EUR', 'EUR']);
currenciesUnique.forEach(function (value, _, set) {
  console.log(`${value}: ${value}`);
});

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const eurToUsd = 1.1;

// const movementsUSD = movements.map(function (mov) {
//   return mov * eurToUsd;
// });

const movementsUSD = movements.map(mov => mov * eurToUsd);

console.log(movements);
console.log(movementsUSD);

const movementsUSDfor = [];
for (const mov of movements) movementsUSDfor.push(mov * eurToUsd);
console.log(movementsUSDfor);

const movementsDescription = movements.map(
  (mov, i) =>
    `Movement ${i + 1}: You ${mov > 0 ? 'deposited' : 'withdrew'} ${Math.abs(
      mov
    )}`
);
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const deposits = movements.filter(function (mov) {
  return mov > 0;
});
console.log(movements);
console.log(deposits);

const depositsFor = [];
for (const mov of movements) if (mov > 0) depositsFor.push(mov);
console.log(depositsFor);

const withdrawals = movements.filter(function (mov) {
  return mov < 0;
});
console.log(withdrawals);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const balance = movements.reduce(function (acc, cur, i, arr) {
  console.log(`iteration ${i}: ${acc}`);
  return acc + cur;
}, 0);
const balance = movements.reduce((acc, cur) => acc + cur);

console.log(balance);

let balance2 = 0;
for (const mov of movements) balance2 += mov;
console.log(balance2);

// Maximum value
const max = movements.reduce((acc, mov) => {
  if (acc > mov) return acc;
  else return mov;
}, movements[0]);
console.log(max);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const firstWithdrawal = movements.find(mov => mov < 0);

console.log(movements);
console.log(firstWithdrawal);

console.log(accounts);

const account = accounts.find(acc => acc.owner === 'Jessica Davis');

console.log(account);

Was unable to implement this 😭😭😭
for (const account of accounts) {
  return account.owner;
}

console.log(account);

const arr = [1, 2, 3, 4, 5, 6, 7];
console.log(new Array(1, 2, 3, 4, 5, 6, 7));

// Empty arrays + fill method
const x = new Array(7);
console.log(x);
// console.log(x.map(() => 5));
// x.fill(1);
x.fill(1, 3, 5);
console.log(x);

arr.fill(23, 2, 6);
console.log(arr);

// Array.from
const y = Array.from({ length: 7 }, () => 1);
console.log(y);

const z = Array.from({ length: 7 }, (_, i) => i + 1);
console.log(z);

labelBalance.addEventListener('click', function () {
  const movementsUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => Number(el.textContent)
  );
  console.log(movementsUI);

  const movementsUI2 = [...document.querySelectorAll('.movements__value')];
  console.log(movementsUI2);
});

1.
const bankDepositSum = accounts
  .flatMap(acc => acc.movements)
  .filter(mov => mov > 0)
  .reduce((sum, cur) => sum + cur, 0);
console.log(bankDepositSum);

// 2.
// const numDeposits1000 = accounts
//   .flatMap(acc => acc.movements)
//   .filter(acc => acc >= 1000).length;

const numDeposits1000 = accounts
  .flatMap(acc => acc.movements)
  .reduce((count, cur) => (cur >= 1000 ? ++count : count), 0);
console.log(numDeposits1000);

// Prefixed ++ operator
let a = 10;
console.log(++a);
console.log(a);

// 3
const { deposits, withdrawals } = accounts
  .flatMap(acc => acc.movements)
  .reduce(
    (sums, cur) => {
      // cur >= 0 ? (sums.deposits += cur) : (sums.withdrawals += cur);
      sums[cur > 0 ? 'deposits' : 'withdrawals'] += cur;
      return sums;
    },
    { deposits: 0, withdrawals: 0 }
  );

console.log(deposits, withdrawals);

// 4.
// this is a nice title -> This Is a Nice Title
const convertTitleCase = function (title) {
  const capitalize = str => str[0].toUpperCase() + str.slice(1);
  const exceptions = ['a', 'an', 'the', 'but', 'or', 'on', 'in', 'with', 'and'];

  const titleCase = title
    .toLowerCase()
    .split(' ')
    .map(word => (exceptions.includes(word) ? word : capitalize(word)))
    .join(' ');
  return capitalize(titleCase);
};

console.log(convertTitleCase('this is a nice title'));
console.log(convertTitleCase('this is a LONG title but not too long'));
console.log(convertTitleCase('and here is another title with an EXAMPLE'));

// Coding Challenge #4

// Julia and Kate are still studying dogs, and this time they are studying if dogs are
// eating too much or too little.
// Eating too much means the dog's current food portion is larger than the
// recommended portion, and eating too little is the opposite.
// Eating an okay amount means the dog's current food portion is within a range 10%
// above and 10% below the recommended portion (see hint).
// Your tasks:
// 1. Loop over the 'dogs' array containing dog objects, and for each dog, calculate
// the recommended food portion and add it to the object as a new property. Do
// not create a new array, simply loop over the array. Forumla:
// recommendedFood = weight ** 0.75 * 28. (The result is in grams of
// food, and the weight needs to be in kg)
// 2. Find Sarah's dog and log to the console whether it's eating too much or too
// little. Hint: Some dogs have multiple owners, so you first need to find Sarah in
// the owners array, and so this one is a bit tricky (on purpose) �
// 3. Create an array containing all owners of dogs who eat too much
// ('ownersEatTooMuch') and an array with all owners of dogs who eat too little
// ('ownersEatTooLittle').
// 4. Log a string to the console for each array created in 3., like this: "Matilda and
// Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat
// too little!"
// 5. Log to the console whether there is any dog eating exactly the amount of food
// that is recommended (just true or false)
// 6. Log to the console whether there is any dog eating an okay amount of food
// (just true or false)
// 7. Create an array containing the dogs that are eating an okay amount of food (try
// to reuse the condition used in 6.)
// 8. Create a shallow copy of the 'dogs' array and sort it by recommended food
// portion in an ascending order (keep in mind that the portions are inside the
// array's objects �)
// The Complete JavaScript Course 26
// Hints:
// § Use many different tools to solve these challenges, you can use the summary
// lecture to choose between them �
// § Being within a range 10% above and below the recommended portion means:
// current > (recommended * 0.90) && current < (recommended *
// 1.10). Basically, the current portion should be between 90% and 110% of the
// recommended portion.
Test data:
 const dogs = [
 { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
 { weight: 8, curFood: 200, owners: ['Matilda'] },
 { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
 { weight: 32, curFood: 340, owners: ['Michael'] },
 ];
GOOD LUCK �

const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Micheal'] },
];

// 1.
dogs.forEach(dog => (dog.recFood = Math.trunc(dog.weight ** 0.75 * 28)));
console.log(dogs);

// 2.
const dogSarah = dogs.find(dog => dog.owners.includes('Sarah'));
console.log(dogSarah);
console.log(
  `Sarah's dog is eating too ${
    dogSarah.curFood > dogSarah.recFood ? 'much' : 'less'
  }`
);

// 3.
const ownersEatTooMuch = dogs
  .filter(dog => dog.curFood > dog.recFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooMuch);

const ownersEatTooLittle = dogs
  .filter(dog => dog.curFood < dog.recFood)
  .flatMap(dog => dog.owners);
console.log(ownersEatTooLittle);

// 4. "Matilda and
// Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat
// too little!"

console.log(`${ownersEatTooMuch.join(' and ')}'s dogs eat too much!`);
console.log(`${ownersEatTooLittle.join(' and ')}'s dogs eat too little!`);

// 5.
console.log(dogs.some(dog => dog.curFood === dog.recFood));

// 6 current > (recommended * 0.90) && current < (recommended *
// 1.10)

const checkEatingOkay = dogs.some(
  dog => dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1
);
console.log(checkEatingOkay);

// 7.
console.log(
  dogs.filter(
    dog => dog.curFood > dog.recFood * 0.9 && dog.curFood < dog.recFood * 1.1
  )
);

// 8.
const dogsSorted = dogs.slice().sort((a, b) => a.recFood - b.recFood);
console.log(dogsSorted);
*/
