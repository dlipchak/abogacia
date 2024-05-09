$(document).ready(function () {
  $(".calculatorWorkAccident #age").keypress(function (e) {
    var keyCode = e.which;
    if ((keyCode != 8 || keyCode == 32) && (keyCode < 48 || keyCode > 57)) {
      return false;
    }
  });

  $(".calculatorWorkAccident #age").keypress(function (e) {
    return $.isNumeric(e.which);
  });

  $(".calculatorWorkAccident #salary").keypress(function (e) {
    var keyCode = e.which;
    if ((keyCode != 8 || keyCode == 32) && (keyCode < 48 || keyCode > 57)) {
      return false;
    }
  });

  $(".calculatorWorkAccident #salary").keypress(function (e) {
    return $.isNumeric(e.which);
  });

  $(".calculatorWorkAccident #salary").keyup(toggleCalculateButton);
  $(".calculatorWorkAccident #incapacity").keyup(toggleCalculateButton);
  $(".calculatorWorkAccident #age").keyup(toggleCalculateButton);

  function toggleCalculateButton() {
    var salary = $(".calculatorWorkAccident #salary").val();
    var incapacity = $(".calculatorWorkAccident #incapacity").val();
    var age = $(".calculatorWorkAccident #age").val();

    if (salary && incapacity && age) {
      $(".calculatorWorkAccident #btnCalculate").prop("disabled", false);
    } else {
      $(".calculatorWorkAccident #btnCalculate").prop("disabled", true);
    }
  }

  function calculate() {
    var salary = parseFloat($(".calculatorWorkAccident #salary").val());
    var incapacity = parseFloat($(".calculatorWorkAccident #incapacity").val());

    var minCompensation = (incapacity / 100) * 3483482;

    var age = parseFloat($(".calculatorWorkAccident #age").val());
    var accidentPlaceWork = $(
      ".calculatorWorkAccident input[name='accident-place']:checked"
    ).val();

    var accidentPlaceFactor = accidentPlaceWork === "work" ? 1.2 : 1;

    var ret = salary * (65 / age) * 53 * (incapacity / 100);

    if (ret < minCompensation) {
      ret = minCompensation;
    }

    ret = ret * accidentPlaceFactor;

    //var ret = Math.round((C + Number.EPSILON) * 100) / 100;

    $(".calculatorWorkAccident #result").text(currencyFormat(ret));
    $(".calculatorWorkAccident .style-msg").removeClass("invisible");
  }

  $(".calculatorWorkAccident #btnCalculate").on("click", function (e) {
    calculate();
  });
});
