import { TimeState } from '../types';

export class TimeController {
  private timeState: TimeState;

  constructor() {
    this.timeState = {
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0
    };
    this.update();
  }

  update(): void {
    const now = new Date();
    const jstOffset = 9 * 60;
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const jstMinutes = (utcMinutes + jstOffset) % (24 * 60);

    this.timeState.hours = Math.floor(jstMinutes / 60);
    this.timeState.minutes = jstMinutes % 60;

    const utcSeconds = now.getUTCSeconds();
    const milliseconds = now.getUTCMilliseconds();
    this.timeState.seconds = utcSeconds + milliseconds / 1000;

    this.timeState.totalSeconds =
      this.timeState.hours * 3600 +
      this.timeState.minutes * 60 +
      this.timeState.seconds;
  }

  getTimeState(): TimeState {
    return { ...this.timeState };
  }

  getHours(): number {
    return this.timeState.hours;
  }

  getMinutes(): number {
    return this.timeState.minutes;
  }

  getSeconds(): number {
    return this.timeState.seconds;
  }

  getSecondsWithMillis(): number {
    return this.timeState.seconds;
  }

  getTotalSeconds(): number {
    return this.timeState.totalSeconds;
  }

  getHourHandAngle(): number {
    const hours12 = this.timeState.hours % 12;
    const minuteFraction = this.timeState.minutes / 60;
    return -((hours12 + minuteFraction) / 12) * Math.PI * 2;
  }

  getMinuteHandAngle(): number {
    const secondFraction = this.timeState.seconds / 60;
    return -((this.timeState.minutes + secondFraction) / 60) * Math.PI * 2;
  }

  getSecondHandAngle(): number {
    return -(this.timeState.seconds / 60) * Math.PI * 2;
  }

  getFormattedTime(): string {
    const h = this.timeState.hours.toString().padStart(2, '0');
    const m = this.timeState.minutes.toString().padStart(2, '0');
    const s = Math.floor(this.timeState.seconds).toString().padStart(2, '0');
    return `${h}:${m}:${s} JST`;
  }
}
