$(document).ready(function () {
  $(".calculatorTrafficAccident #age").keypress(function (e) {
    var keyCode = e.which;
    if ((keyCode != 8 || keyCode == 32) && (keyCode < 48 || keyCode > 57)) {
      return false;
    }
  });

  $(".calculatorTrafficAccident #age").keypress(function (e) {
    return $.isNumeric(e.which);
  });

  $(".calculatorTrafficAccident #salary").keypress(function (e) {
    var keyCode = e.which;
    if ((keyCode != 8 || keyCode == 32) && (keyCode < 48 || keyCode > 57)) {
      return false;
    }
  });

  $(".calculatorTrafficAccident #salary").keypress(function (e) {
    return $.isNumeric(e.which);
  });

  $(".calculatorTrafficAccident #salary").keyup(toggleCalculateButton);
  $(".calculatorTrafficAccident #incapacity").keyup(toggleCalculateButton);
  $(".calculatorTrafficAccident #age").keyup(toggleCalculateButton);

  function toggleCalculateButton() {
    var salary = $(".calculatorTrafficAccident #salary").val();
    var incapacity = $(".calculatorTrafficAccident #incapacity").val();
    var age = $(".calculatorTrafficAccident #age").val();

    if (salary && incapacity && age) {
      $(".calculatorTrafficAccident #btnCalculate").prop("disabled", false);
    } else {
      $(".calculatorTrafficAccident #btnCalculate").prop("disabled", true);
    }
  }

  function calculate() {
    calculateMendez();
    // calculateVuotto();
  }

  function calculateMendez() {
    var salary = parseFloat($(".calculatorTrafficAccident #salary").val());
    var incapacity = parseFloat(
      $(".calculatorTrafficAccident #incapacity").val()
    );
    var age = parseFloat($(".calculatorTrafficAccident #age").val());

    var a = salary * (60 / age) * 13 * (incapacity / 100);
    var i = 0.04;
    var n = 75 - age;
    var Vn = 1 / Math.pow(1 + i, n);

    var C = (a * (1 - Vn) * 1) / i;

    var ret = Math.round((C + Number.EPSILON) * 100) / 100;

    $(".calculatorTrafficAccident #result").text(currencyFormat(ret));
    $(".style-msg").removeClass("invisible");
  }

  function calculateVuotto() {
    var salary = parseFloat($(".calculatorTrafficAccident #salary").val());
    var incapacity = parseFloat(
      $(".calculatorTrafficAccident #incapacity").val()
    );
    var age = parseFloat($(".calculatorTrafficAccident #age").val());

    var a = salary * 13 * (incapacity / 100);
    var i = 0.06;
    var n = 65 - age;
    var Vn = 1 / Math.pow(1 + i, n);

    var C = (a * (1 - Vn) * 1) / i;

    var ret = Math.round((C + Number.EPSILON) * 100) / 100;

    $(".calculatorTrafficAccident #result").text(currencyFormat(ret));
    $(".style-msg").removeClass("invisible");
  }

  $(".calculatorTrafficAccident #btnCalculate").on("click", function (e) {
    calculate();
  });
});
