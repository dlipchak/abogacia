document.addEventListener("DOMContentLoaded", () => {
  const salaryInput = document.querySelector(".calculatorTrafficAccident #salary");
  const incapacityInput = document.querySelector(".calculatorTrafficAccident #incapacity");
  const ageInput = document.querySelector(".calculatorTrafficAccident #age");
  const btnCalculate = document.querySelector(".calculatorTrafficAccident #btnCalculate");
  const resultElement = document.querySelector(".calculatorTrafficAccident #result");
  const msgElement = document.querySelector(".calculatorTrafficAccident .style-msg");

  // Ensure elements exist before attaching event listeners
  if (salaryInput) {
    salaryInput.addEventListener("keypress", (e) => {
      const keyCode = e.which || e.keyCode;
      if ((keyCode !== 8 && keyCode !== 32) && (keyCode < 48 || keyCode > 57)) {
        e.preventDefault();
      }
    });

    salaryInput.addEventListener("keypress", (e) => {
      if (!isNumeric(e.key)) {
        e.preventDefault();
      }
    });

    salaryInput.addEventListener("keyup", toggleCalculateButton);
  }

  if (incapacityInput) {
    incapacityInput.addEventListener("keyup", toggleCalculateButton);
  }

  if (ageInput) {
    ageInput.addEventListener("keypress", (e) => {
      const keyCode = e.which || e.keyCode;
      if ((keyCode !== 8 && keyCode !== 32) && (keyCode < 48 || keyCode > 57)) {
        e.preventDefault();
      }
    });

    ageInput.addEventListener("keypress", (e) => {
      if (!isNumeric(e.key)) {
        e.preventDefault();
      }
    });

    ageInput.addEventListener("keyup", toggleCalculateButton);
  }

  if (btnCalculate) {
    btnCalculate.addEventListener("click", calculate);
  }

  function toggleCalculateButton() {
    const salary = salaryInput?.value || "";
    const incapacity = incapacityInput?.value || "";
    const age = ageInput?.value || "";

    if (salary && incapacity && age) {
      btnCalculate.disabled = false;
    } else {
      btnCalculate.disabled = true;
    }
  }

  function calculate() {
    calculateMendez();
    // calculateVuotto();
  }

  function calculateMendez() {
    const salary = parseFloat(salaryInput.value);
    const incapacity = parseFloat(incapacityInput.value);
    const age = parseFloat(ageInput.value);

    const a = salary * (60 / age) * 13 * (incapacity / 100);
    const i = 0.04;
    const n = 75 - age;
    const Vn = 1 / Math.pow(1 + i, n);

    const C = (a * (1 - Vn) * 1) / i;

    const ret = Math.round((C + Number.EPSILON) * 100) / 100;

    resultElement.textContent = currencyFormat(ret);
    msgElement.classList.remove("invisible");
  }

  function calculateVuotto() {
    const salary = parseFloat(salaryInput.value);
    const incapacity = parseFloat(incapacityInput.value);
    const age = parseFloat(ageInput.value);

    const a = salary * 13 * (incapacity / 100);
    const i = 0.06;
    const n = 65 - age;
    const Vn = 1 / Math.pow(1 + i, n);

    const C = (a * (1 - Vn) * 1) / i;

    const ret = Math.round((C + Number.EPSILON) * 100) / 100;

    resultElement.textContent = currencyFormat(ret);
    msgElement.classList.remove("invisible");
  }

  function isNumeric(value) {
    return /^-?\d+$/.test(value);
  }

  function currencyFormat(value) {
    return value.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
  }
});
