function getVerticalBounds(data) {
  const {min, max} = data.reduce((returnObj, {games}) => {
    for (const region in games) {
      const { regionMin, regionMax } = games[region].reduce(({regionMin, regionMax}, mmr, i) => {
        if (i === 0) {
          return { regionMin: mmr, regionMax: mmr }
        } else if (mmr < regionMin) {
          return { regionMin: mmr, regionMax: regionMax }
        } else if (mmr > regionMax) {
          return { regionMin: regionMin, regionMax: mmr }
        } else {
          return { regionMin: regionMin, regionMax: regionMax }
        }
      }, {});

      if (returnObj.min === null) {
        returnObj.min = regionMin;
        returnObj.max = regionMax;
      }

      if (regionMin < returnObj.min) {
        returnObj.min = regionMin;
      }

      if (regionMax > returnObj.max) {
        returnObj.max = regionMax;
      }
    }

    return returnObj;
  }, {min: null, max: null});
  const maxAdj = Math.ceil(max / 500) * 500;
  const minAdj = Math.floor(min / 500) * 500;
  return {
    vmax: maxAdj,
    vmin: minAdj,
    vsteps: (maxAdj - minAdj) / 500
  }
}

function getHorizontalBounds(timeframe) {
  if (timeframe === 'day') {
    return {
      hmax: 24,
      hmin: 0,
      hsteps: 24
    }
  } else if (timeframe === 'week') {
    return {
      hmax: 7,
      hmin: 0,
      hsteps: 7
    }
  } else {
    throw Error('Invalid timeframe ' + timeframe);
  }
}

/*eslint-disable*/
function mix (color_1, color_2, weight) {
  if(color_1.substr(0, 1) === '#') color_1 = color_1.substr(1);
  if(color_2.substr(0, 1) === '#') color_2 = color_2.substr(1);
  function d2h(d) { return d.toString(16); }  // convert a decimal value to hex
  function h2d(h) { return parseInt(h, 16); } // convert a hex value to decimal 

  weight = (typeof(weight) !== 'undefined') ? weight : 50; // set the weight to 50%, if that argument is omitted

  var color = "#";

  for(var i = 0; i <= 5; i += 2) { // loop through each of the 3 hex pairs—red, green, and blue
    var v1 = h2d(color_1.substr(i, 2)), // extract the current pairs
        v2 = h2d(color_2.substr(i, 2)),
        
        // combine the current pairs from each source color, according to the specified weight
        val = d2h(Math.floor(v2 + (v1 - v2) * (weight / 100.0))); 

    while(val.length < 2) { val = '0' + val; } // prepend a '0' if val results in a single digit
    
    color += val; // concatenate val to our new color string
  }
    
  return color; // PROFIT!
};
/*eslint-enable*/

const now = new Date();
const msInDay = 86400000;

function getOpacity(date, timeframe) {
  const diffInMs = now - date;
  let diffPercent = 0;
  if (timeframe === 'day') {
    diffPercent = 1 - (diffInMs / msInDay);
  } else {
    diffPercent = 1 - (diffInMs / (msInDay * 7));
  }
  const squeezeFactor = 0.4;
  diffPercent *= (1 - squeezeFactor);
  diffPercent += squeezeFactor;
  return diffPercent * 100;
}

function getTimeFromTimestamp(timestamp, timeframe) {
  if (typeof timestamp !== 'number') timestamp = Number(timestamp);
  const date = new Date(timestamp);

  const lastValidWeekDate = now.getTime() - (msInDay * 7);
  const lastValidDayDate = now.getTime() - msInDay;

  const weekDiffInMs = date - lastValidWeekDate;
  const dayDiffInMs = date - lastValidDayDate;

  const weekValid = weekDiffInMs > 0;
  const dayValid = dayDiffInMs > 0;

  const weekMinutesScaled = (date.getMinutes() / 60) * 0.1;
  const weekHoursScaled = (date.getHours() / 24);
  const dayMinutesScaled = (date.getMinutes() / 60);
  return {
    week: weekValid ? date.getDay() + weekHoursScaled + weekMinutesScaled : null,
    day: dayValid ? date.getHours() + dayMinutesScaled : null
  }
}

export { getVerticalBounds, getHorizontalBounds, mix, getOpacity, getTimeFromTimestamp };
