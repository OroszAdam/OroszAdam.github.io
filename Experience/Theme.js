import EventEmitter from "events";

export default class Theme extends EventEmitter {
  constructor() {
    super(); // For accessing EventEmitter

    this.theme = "light";

    this.toggleButton = document.querySelector(".toggle-button");
    this.toggleCircle = document.querySelector(".toggle-circle");

    this.seEventListeners();
  }
  seEventListeners() {
    this.toggleButton.addEventListener("click", () => {
      this.toggleCircle.classList.toggle("slide");
      this.theme = this.theme === "light" ? "dark" : "light";

      this.emit("switch", this.theme);
    });
  }
}
