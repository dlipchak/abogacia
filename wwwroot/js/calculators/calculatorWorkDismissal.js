$(document).ready(function () {
  $(".calculatorWorkDismissal #bestSalary").keypress(function (e) {
    var keyCode = e.which;
    if ((keyCode != 8 || keyCode == 32) && (keyCode < 48 || keyCode > 57)) {
      return false;
    }
  });

  $(".calculatorWorkDismissal #bestSalary").keypress(function (e) {
    return $.isNumeric(e.which);
  });

  $(".calculatorWorkDismissal #bestSalary").keyup(toggleCalculateButton);
  $(".calculatorWorkDismissal #incapacity").keyup(toggleCalculateButton);
  $(".calculatorWorkDismissal #age").keyup(toggleCalculateButton);

  $(".calculatorWorkDismissal #btnCalculate").on("click", function (e) {
    calculate();
  });

  function toggleCalculateButton() {
    var salary = $(".calculatorWorkDismissal #bestSalary").val();
    var startDate = $(".calculatorWorkDismissal #startDate").val();
    var endDate = $(".calculatorWorkDismissal #endDate").val();
    var notice = $(".calculatorWorkDismissal #noticeSelect").val();

    if (salary && startDate && endDate && notice) {
      $(".calculatorWorkDismissal #btnCalculate").prop("disabled", false);
    } else {
      $(".calculatorWorkDismissal #btnCalculate").prop("disabled", true);
    }
  }

  function calculate() {
    var ret = 0;
    var startDate = $(".calculatorWorkDismissal #startDate").val();
    var endDate = $(".calculatorWorkDismissal #endDate").val();
    var bestSalary = $(".calculatorWorkDismissal #bestSalary").val();
    var notice = $(".calculatorWorkDismissal #noticeSelect").val();

    var months = moment(endDate).diff(moment(startDate), "months", true);

    var years = Math.floor(months / 12);
    var resto = months % 12;

    var aux = resto >= 3 ? 1 : 0;

    years = years + aux;

    var extraForNoNotice = 0;
    if (notice == "Sin preaviso") {
      if (months <= 3) extraForNoNotice = 0.5;
      else if (months > 3 && months <= 60) extraForNoNotice = 1;
      else if (months > 60) extraForNoNotice = 2;
    }
    years = years + extraForNoNotice;

    //Mejor salario
    ret = bestSalary * years;

    //integracion mes despido:

    let daysUntilEndOfMonth =
      moment(endDate).diff(moment(endDate).clone().endOf("month"), "day") * -1;

    let daysCountInCurrentMonth = moment(endDate).daysInMonth();
    let salaryPerDay = bestSalary / daysCountInCurrentMonth;

    let salaryForDaysUntilEndOfMonth = daysUntilEndOfMonth * salaryPerDay;
    ret += salaryForDaysUntilEndOfMonth;

    //Vacaciones
    const workingHoursInMonthOnAverage = 173.33;

    let vacationDays = 0;
    let weeksAnitguedad = moment(endDate).diff(
      moment(startDate),
      "weeks",
      true
    );
    let monthsAnitguedad = moment(endDate).diff(
      moment(startDate),
      "months",
      true
    );
    let daysAnitguedad = moment(endDate).diff(moment(startDate), "days", true);

    if (monthsAnitguedad <= 6) {
      switch (true) {
        case 4 < weeksAnitguedad <= 7: {
          vacationDays = 1;
          break;
        }

        case 7 < weeksAnitguedad <= 11:
          vacationDays = 2;
          break;
        case 11 < weeksAnitguedad <= 15:
          vacationDays = 3;
          break;
        case 15 < weeksAnitguedad <= 19:
          vacationDays = 4;
          break;
        case 19 < weeksAnitguedad <= 24:
          vacationDays = 5;
          break;
      }
    } else {
      switch (monthsAnitguedad) {
        case 6 < monthsAnitguedad <= 60:
          vacationDays = 14;
          break;
        case 60 < monthsAnitguedad <= 120:
          vacationDays = 21;
          break;
        case 120 < monthsAnitguedad <= 240:
          vacationDays = 28;
          break;
        case 240 < monthsAnitguedad <= 240:
          vacationDays = 35;
          break;
      }
    }

    const vacationsSalary =
      (bestSalary / workingHoursInMonthOnAverage) * vacationDays;

    ret += vacationsSalary;

    //Aguinaldo SAC
    sacFirstDate = moment([moment(endDate).year(), 5, 30]);

    sacSecondDate = moment([moment(endDate).year(), 11, 31]);

    var daysUntilSac = 0;
    var totalDaysInHalfYear = 0;

    if (moment(endDate).isBefore(sacFirstDate)) {
      daysUntilSac = moment(sacFirstDate).diff(endDate, "days");
      var aux = moment(sacSecondDate).clone();
      aux.set("year", moment(endDate).year() - 1);
      totalDaysInHalfYear = moment(sacFirstDate).diff(aux, "days");
    } else {
      daysUntilSac = moment(sacSecondDate).diff(endDate, "days");
      totalDaysInHalfYear = moment(sacSecondDate).diff(sacFirstDate, "days");
    }

    var sac =
      ((totalDaysInHalfYear - daysUntilSac) / totalDaysInHalfYear) *
      bestSalary *
      0.5;

    ret += sac;

    $(".calculatorWorkDismissal #result").text(currencyFormat(ret));
    $(".calculatorWorkDismissal .style-msg").removeClass("invisible");
  }
});
