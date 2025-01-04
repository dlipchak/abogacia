document.addEventListener("DOMContentLoaded", () => {
  const salaryInput = document.querySelector(".calculatorWorkAccident #salary");
  const incapacityInput = document.querySelector(".calculatorWorkAccident #incapacity");
  const ageInput = document.querySelector(".calculatorWorkAccident #age");
  const btnCalculate = document.querySelector(".calculatorWorkAccident #btnCalculate");
  const resultElement = document.querySelector(".calculatorWorkAccident #result");
  const msgElement = document.querySelector(".calculatorWorkAccident .style-msg");

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
    const salary = parseFloat(salaryInput.value);
    const incapacity = parseFloat(incapacityInput.value);
    const age = parseFloat(ageInput.value);
    
    const minCompensation = (incapacity / 100) * 3483482;
    
    const accidentPlaceWork = document.querySelector(
      ".calculatorWorkAccident input[name='accident-place']:checked"
    )?.value;

    const accidentPlaceFactor = accidentPlaceWork === "work" ? 1.2 : 1;

    let ret = salary * (65 / age) * 53 * (incapacity / 100);

    if (ret < minCompensation) {
      ret = minCompensation;
    }

    ret = ret * accidentPlaceFactor;

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
