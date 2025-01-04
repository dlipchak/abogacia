document.addEventListener("DOMContentLoaded", () => {
  const bestSalaryInput = document.querySelector(".calculatorWorkDismissal #bestSalary");
  const incapacityInput = document.querySelector(".calculatorWorkDismissal #incapacity");
  const ageInput = document.querySelector(".calculatorWorkDismissal #age");
  const btnCalculate = document.querySelector(".calculatorWorkDismissal #btnCalculate");
  const startDateInput = document.querySelector(".calculatorWorkDismissal #startDate");
  const endDateInput = document.querySelector(".calculatorWorkDismissal #endDate");
  const noticeSelect = document.querySelector(".calculatorWorkDismissal #noticeSelect");
  const resultElement = document.querySelector(".calculatorWorkDismissal #result");
  const msgElement = document.querySelector(".calculatorWorkDismissal .style-msg");

  // Ensure elements exist before attaching event listeners
  if (bestSalaryInput) {
    bestSalaryInput.addEventListener("keypress", (e) => {
      const keyCode = e.which || e.keyCode;
      if ((keyCode !== 8 && keyCode !== 32) && (keyCode < 48 || keyCode > 57)) {
        e.preventDefault();
      }
    });

    bestSalaryInput.addEventListener("keypress", (e) => {
      if (!isNumeric(e.key)) {
        e.preventDefault();
      }
    });

    bestSalaryInput.addEventListener("keyup", toggleCalculateButton);
  }

  if (incapacityInput) {
    incapacityInput.addEventListener("keyup", toggleCalculateButton);
  }

  if (ageInput) {
    ageInput.addEventListener("keyup", toggleCalculateButton);
  }

  if (btnCalculate) {
    btnCalculate.addEventListener("click", calculate);
  }

  function toggleCalculateButton() {
    const salary = bestSalaryInput?.value || "";
    const startDate = startDateInput?.value || "";
    const endDate = endDateInput?.value || "";
    const notice = noticeSelect?.value || "";

    if (salary && startDate && endDate && notice) {
      btnCalculate.disabled = false;
    } else {
      btnCalculate.disabled = true;
    }
  }

  function calculate() {
    let ret = 0;
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);
    const bestSalary = parseFloat(bestSalaryInput.value);
    const notice = noticeSelect.value;

    const months = monthDiff(startDate, endDate);
    let years = Math.floor(months / 12);
    const resto = months % 12;

    let aux = resto >= 3 ? 1 : 0;
    years += aux;

    let extraForNoNotice = 0;
    if (notice === "Sin preaviso") {
      if (months <= 3) extraForNoNotice = 0.5;
      else if (months > 3 && months <= 60) extraForNoNotice = 1;
      else if (months > 60) extraForNoNotice = 2;
    }
    years += extraForNoNotice;

    // Mejor salario
    ret = bestSalary * years;

    // Integración mes despido
    const daysUntilEndOfMonth = daysUntilEndOfMonthCount(endDate);
    const daysCountInCurrentMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0).getDate();
    const salaryPerDay = bestSalary / daysCountInCurrentMonth;
    const salaryForDaysUntilEndOfMonth = daysUntilEndOfMonth * salaryPerDay;
    ret += salaryForDaysUntilEndOfMonth;

    // Vacaciones
    const workingHoursInMonthOnAverage = 173.33;
    let vacationDays = calculateVacationDays(startDate, endDate);
    const vacationsSalary = (bestSalary / workingHoursInMonthOnAverage) * vacationDays;
    ret += vacationsSalary;

    // Aguinaldo SAC
    const sac = calculateSAC(startDate, endDate, bestSalary);
    ret += sac;

    resultElement.textContent = currencyFormat(ret);
    msgElement.classList.remove("invisible");
  }

  function monthDiff(startDate, endDate) {
    const months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
    return months - startDate.getMonth() + endDate.getMonth();
  }

  function daysUntilEndOfMonthCount(endDate) {
    const endOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    return Math.max(0, Math.floor((endOfMonth - endDate) / (1000 * 60 * 60 * 24)));
  }

  function calculateVacationDays(startDate, endDate) {
    const weeksAntiguedad = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24 * 7));
    const monthsAntiguedad = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
    
    let vacationDays = 0;
    if (monthsAntiguedad <= 6) {
      if (weeksAntiguedad <= 7) vacationDays = 1;
      else if (weeksAntiguedad <= 11) vacationDays = 2;
      else if (weeksAntiguedad <= 15) vacationDays = 3;
      else if (weeksAntiguedad <= 19) vacationDays = 4;
      else if (weeksAntiguedad <= 24) vacationDays = 5;
    } else {
      switch (monthsAntiguedad) {
        case 6:
          vacationDays = 14;
          break;
        case 60:
          vacationDays = 21;
          break;
        case 120:
          vacationDays = 28;
          break;
        case 240:
          vacationDays = 35;
          break;
      }
    }

    return vacationDays;
  }

  function calculateSAC(startDate, endDate, bestSalary) {
    const sacFirstDate = new Date(endDate.getFullYear(), 5, 30);
    const sacSecondDate = new Date(endDate.getFullYear(), 11, 31);

    let daysUntilSac = 0;
    let totalDaysInHalfYear = 0;

    if (endDate < sacFirstDate) {
      daysUntilSac = Math.floor((sacFirstDate - endDate) / (1000 * 60 * 60 * 24));
      totalDaysInHalfYear = Math.floor((sacFirstDate - new Date(endDate.getFullYear() - 1, 5, 30)) / (1000 * 60 * 60 * 24));
    } else {
      daysUntilSac = Math.floor((sacSecondDate - endDate) / (1000 * 60 * 60 * 24));
      totalDaysInHalfYear = Math.floor((sacSecondDate - sacFirstDate) / (1000 * 60 * 60 * 24));
    }

    return ((totalDaysInHalfYear - daysUntilSac) / totalDaysInHalfYear) * bestSalary * 0.5;
  }

  function isNumeric(value) {
    return /^-?\d+$/.test(value);
  }

  function currencyFormat(value) {
    return value.toLocaleString("es-AR", { style: "currency", currency: "ARS" });
  }
});
