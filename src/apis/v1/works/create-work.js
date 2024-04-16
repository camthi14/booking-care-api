let startTime = 7;
let secondStart = 0;
let secondEnd = 0;
let endTime = 0;

export const createWork = (index) => {
  // * secondStart hơn === 60p reset về 0;
  secondStart = secondStart === 60 ? 0 : secondStart;

  // * secondEnd hơn === 60p reset về 0;
  if (secondEnd == 60) {
    secondEnd = 0;
  } else {
    /**
     * * Nếu secondEnd = 30 thì lúc này vẫn còn thời gian của endTime
     * VD: 07:00 - 07:30 => 07:30 - 08:00;
     */
    startTime -= 1;
  }

  secondStart += 30;
  secondEnd = secondStart + 30;
  startTime += 1;
  endTime = startTime + 1;

  endTime = secondStart === 60 ? endTime - 1 : startTime + 1;

  if (secondStart + 30 > 60) {
    secondEnd -= 60;
  }

  const _startTimeValue = startTime < 10 ? "0" + startTime : startTime;
  const _secondStartValue = secondStart === 60 ? "00" : "30";
  const _endTimeValue = endTime < 10 ? "0" + endTime : endTime;
  const _secondEndValue = secondEnd === 60 ? "00" : "30";
  const _desc = startTime >= 12 ? "Ca chiều" : "Ca sáng";

  return [
    `T${index}`,
    `${_startTimeValue}:${_secondStartValue} - ${_endTimeValue}:${_secondEndValue}`,
    _desc,
  ];
};

const works = [...Array(19)].map((_, index) => createWork(index + 1));

export default works;
