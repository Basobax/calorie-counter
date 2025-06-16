
const calorieCounter = document.getElementById('calorie-counter');
const budgetNumberInput = document.getElementById('budget');
const entryDropdown = document.getElementById('entry-dropdown');
const addEntryButton = document.getElementById('add-entry');
const clearButton = document.getElementById('clear');
const output = document.getElementById('output');
const bmrResult = document.getElementById('bmr-result');


const weightInput = document.getElementById('weight');
const heightInput = document.getElementById('height');
const ageInput = document.getElementById('age');


let weight = 0;
let height = 0;
let age = 0;
let currentGender = '';
let currentActivity = 0;
let currentGoal = 'maintain';
let isError = false;


const goalCaloriesMap = {
  bulk: 300,   
  maintain: 0,  
  cut: -300     
};


function initEventListeners() {
  
  [weightInput, heightInput, ageInput].forEach(input => {
    input.addEventListener('input', () => {
      if (input === weightInput) weight = parseFloat(input.value) || 0;
      if (input === heightInput) height = parseFloat(input.value) || 0;
      if (input === ageInput) age = parseInt(input.value) || 0;
      updateBMRResult();
    });
  });

  
  document.querySelectorAll('input[name="gender"]').forEach(radio => {
    radio.addEventListener('change', () => {
      currentGender = radio.value;
      updateBMRResult();
    });
  });

  document.querySelectorAll('input[name="activity"]').forEach(radio => {
    radio.addEventListener('change', () => {
      currentActivity = parseFloat(radio.value);
      updateBMRResult();
    });
  });

  document.querySelectorAll('input[name="fitness-goal"]').forEach(radio => {
    radio.addEventListener('change', () => {
      currentGoal = radio.value;
      updateBMRResult();
    });
  });

  
  addEntryButton.addEventListener("click", addEntry);
  calorieCounter.addEventListener("submit", calculateCalories);
  clearButton.addEventListener("click", clearForm);
}


function calculateTDEE() {
  const bmr = currentGender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;
  return Math.round(bmr * currentActivity);
}

function updateBMRResult() {
  if (weight > 0 && height > 0 && age >= 12 && currentGender && currentActivity > 0) {
    const tdee = calculateTDEE();
    const adjustedCalories = tdee + goalCaloriesMap[currentGoal];
    
    bmrResult.innerHTML = `
      <p><strong>BMR:</strong> ${Math.round(tdee / currentActivity)} calories</p>
      <p><strong>TDEE:</strong> ${tdee} calories</p>
      <p><strong>Goal (${currentGoal}):</strong> ${adjustedCalories} calories</p>
    `;
    budgetNumberInput.value = adjustedCalories;
  } else {
    bmrResult.textContent = 'Complete all fields with valid values';
  }
}


function cleanInputString(str) {
  const regex = /[+-\s]/g;
  return str.replace(regex, '');
}

function isInvalidInput(str) {
  const regex = /\d+e\d+/i;
  return str.match(regex);
}

function addEntry() {
  const targetInputContainer = document.querySelector(`#${entryDropdown.value} .input-container`);
  const entryNumber = targetInputContainer.querySelectorAll('input[type="text"]').length + 1;
  const HTMLString = `
    <div class="entry">
      <label for="${entryDropdown.value}-${entryNumber}-name">Entry ${entryNumber} Name</label>
      <input type="text" id="${entryDropdown.value}-${entryNumber}-name" placeholder="Name" />
      <label for="${entryDropdown.value}-${entryNumber}-calories">Calories</label>
      <input
        type="number"
        min="0"
        id="${entryDropdown.value}-${entryNumber}-calories"
        placeholder="Calories"
      />
      <button type="button" class="remove-entry">×</button>
    </div>`;
  targetInputContainer.insertAdjacentHTML('beforeend', HTMLString);
  
  
  const newEntry = targetInputContainer.lastElementChild;
  newEntry.querySelector('.remove-entry').addEventListener('click', () => {
    newEntry.remove();
  });
}

function calculateCalories(e) {
  e.preventDefault();
  isError = false;

  const mealCategories = ['breakfast', 'lunch', 'dinner', 'snacks'];
  const exerciseInputs = document.querySelectorAll("#exercise input[type='number']");

  let consumedCalories = 0;
  mealCategories.forEach(category => {
    const inputs = document.querySelectorAll(`#${category} input[type='number']`);
    consumedCalories += getCaloriesFromInputs(inputs) || 0;
  });

  const exerciseCalories = getCaloriesFromInputs(exerciseInputs) || 0;
  const budgetCalories = parseFloat(budgetNumberInput.value) || 0;

  if (isError) return;

  const remainingCalories = budgetCalories - consumedCalories + exerciseCalories;
  const surplusOrDeficit = remainingCalories < 0 ? 'Surplus' : 'Deficit';
  
  output.innerHTML = `
    <span class="${surplusOrDeficit.toLowerCase()}">
      ${Math.abs(remainingCalories)} Calorie ${surplusOrDeficit}
    </span>
    <hr>
    <p>${budgetCalories} Calories Budgeted</p>
    <p>${consumedCalories} Calories Consumed</p>
    <p>${exerciseCalories} Calories Burned</p>
  `;
  output.classList.remove('hide');
}

function getCaloriesFromInputs(list) {
  let calories = 0;
  for (const item of list) {
    const currVal = cleanInputString(item.value);
    const invalidInputMatch = isInvalidInput(currVal);

    if (invalidInputMatch) {
      alert(`Invalid Input: ${invalidInputMatch[0]}`);
      isError = true;
      return null;
    }
    calories += Number(currVal);
  }
  return calories;
}

function clearForm() {
  
  const inputContainers = Array.from(document.querySelectorAll('.input-container'));
  inputContainers.forEach(container => container.innerHTML = '');
  
  
  output.innerText = '';
  output.classList.add('hide');
}


initEventListeners();