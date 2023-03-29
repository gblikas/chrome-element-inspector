import Prism from "prismjs";
import Emojis from "./Emojis";
import ShadowDOMComponent from "./ShadowDOMComponent";

/**
 * {@link displayMessage} about the current clicked element, see {@link registerEvents} cb, {@param getTargetCallback}.
 *
 * @class Notification
 * @extends ShadowDOMComponent
 */
class Notification extends ShadowDOMComponent {
  private notificationElement!: HTMLElement;

  constructor(shadowRoot: ShadowRoot) {
    super(shadowRoot);
    this.bindMethods();
    this.notificationElement = this.shadowRoot.querySelector(".new-element")!;
  }

  protected bindMethods(): void {
    this.displayMessage = this.displayMessage.bind(this);
  }

  private displayMessage(message: string): void {
    const msgDiv = document.createElement("div");
    msgDiv.innerHTML = `<code class='tl-code language-markup' id='msgDiv'>${message}</code>`;
    this.notificationElement.innerHTML = "";
    this.notificationElement.appendChild(msgDiv);
    this.notificationElement.classList.remove("show");
    this.notificationElement.classList.add("show");

    const element = this.shadowRoot.querySelector("#msgDiv");
    if (element) {
      Prism.highlightElement(element);
    } else {
      console.error("Element not found");
    }

    setTimeout(() => {
      if (this.notificationElement.classList.contains("show")) {
        this.notificationElement.classList.remove("show");
      }
    }, 2000);
  }

  registerEvents(getTargetCallback: () => HTMLElement): void {
    document.addEventListener("click", () => {
      const target = getTargetCallback();
      const message =
        `You clicked on ${target.id || target.tagName}! ${Emojis[Math.floor(Math.random() * Emojis.length)]}`;
      this.displayMessage(message);
    });
  }
}

export default Notification;
