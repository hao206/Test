export class HealthSnapshot {
  constructor({ status, service, timestamp }) {
    this.status = status;
    this.service = service;
    this.timestamp = timestamp;
  }
}
