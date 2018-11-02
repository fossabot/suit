// @flow

import Position from '../api/Position';

export default class PositionUtils {
  static calcBounds(values: Array<any>) {
    // Set default bounds in case there are no values in the array
    let minLatitude = -90;
    let maxLatitude = 90;
    let minLongitude = -180;
    let maxLongitude = 180;
    let firstTime = true;
    values.forEach((value) => {
      if (firstTime) {
        minLatitude = value.latitude || 0;
        minLongitude = value.longitude || 0;
        maxLatitude = minLatitude;
        maxLongitude = minLongitude;
        firstTime = false;
      } else {
        const latitude = value.latitude || 0;
        const longitude = value.longitude || 0;
        minLatitude = Math.min(latitude, minLatitude);
        maxLatitude = Math.max(latitude, maxLatitude);
        minLongitude = Math.min(longitude, minLongitude);
        maxLongitude = Math.max(longitude, maxLongitude);
      }
    });
    const bounds = [[minLongitude, minLatitude], [maxLongitude, maxLatitude]];
    return bounds;
  }

  static calcCenter(values: Array<any>): Position {
    let result;

    if (values.length === 0) {
      result = new Position(0, 0);
    } else if (values.length === 1) {
      result = new Position(values[0].longitude || 0, values[0].latitude || 0);
    } else {
      let x = 0;
      let y = 0;
      let z = 0;

      values.forEach((value) => {
        // Some value objects may not have both longitude and latitude set...
        const latitudeDegrees = value.latitude || 0;
        const longitudeDegrees = value.longitude || 0;
        const latitude = (latitudeDegrees * Math.PI) / 180;
        const longitude = (longitudeDegrees * Math.PI) / 180;

        x += (Math.cos(latitude) * Math.cos(longitude));
        y += (Math.cos(latitude) * Math.sin(longitude));
        z += Math.sin(latitude);
      });
      const total = values.length;
      x /= total;
      y /= total;
      z /= total;

      const centralSquareRoot = Math.sqrt((x * x) + (y * y));
      const centerLatitudeRad = Math.atan2(z, centralSquareRoot);
      const centerLongitudeRad = Math.atan2(y, x);

      result = new Position((centerLongitudeRad * 180) / Math.PI, (centerLatitudeRad * 180) / Math.PI);
    }
    return result;
  }

  /**
   * Convert the fractional representation of an angle in degrees to a string showing integral
   * (absolute) values for degrees, minutes, and seconds. If seconds is zero, it is left off
   * the final result.
   */
  static toDegreesMinutesSeconds(orig: number): string {
    const absOrig = Math.abs(orig);
    let degrees = Math.trunc(Math.abs(absOrig));
    const minutesFraction = absOrig - degrees;
    let minutes = Math.trunc(minutesFraction * 60);
    const secondsFraction = (minutesFraction * 60) - minutes;
    let seconds = Math.round(secondsFraction * 60);
    if (seconds === 60) {
      minutes += 1;
      seconds = 0;
    }
    if (minutes === 60) {
      degrees += 1;
      minutes = 0;
    }

    if (seconds > 0) {
      return `${degrees}\u00B0${minutes}\u2032${seconds}\u2033`;
    }
    return `${degrees}\u00B0${minutes}\u2032`;
  }

  /**
   * Given the latitude and longitude of a geographic point, render a human-readable
   * string for the coordinates, in the form "39°55′N 116°23′E" (if seconds are
   * not significant) or "18°58′30″N 72°49′33″E" if they are.
   */
  static latLongString(latitude: number, longitude: number): string {
    let latNS;
    if (latitude > 0) {
      latNS = 'N';
    } else if (latitude < 0) {
      latNS = 'S';
    } else {
      latNS = '';
    }
    const latString = `${PositionUtils.toDegreesMinutesSeconds(latitude)}${latNS}`;

    let longEW;
    if (longitude > 0) {
      longEW = 'E';
    } else if (longitude < 0) {
      longEW = 'W';
    } else {
      longEW = '';
    }
    const longString = `${PositionUtils.toDegreesMinutesSeconds(longitude)}${longEW}`;

    return `${latString} ${longString}`;
  }
}
