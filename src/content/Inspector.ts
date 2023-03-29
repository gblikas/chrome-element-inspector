import Prism from 'prismjs';
import Renderer from "./Renderer";
import Notification from "./Notification";

class Inspector {
  private template!: string;
  private $host!: HTMLElement;
  private shadow!: ShadowRoot;
  private $wrap!: HTMLElement;
  private $code!: HTMLElement;
  private $target!: HTMLElement;
  private $cacheEl!: HTMLElement;
  private $cacheElMain!: HTMLElement;
  private stringified!: string;
  private serializer: XMLSerializer;
  private forbidden: HTMLElement[];

  private renderer!: Renderer;
  private notification!: Notification;

  constructor() {
    this.bindMethods();
    this.initializeElements();
    this.serializer = new XMLSerializer();
    this.forbidden = [this.$cacheEl, document.body, document.documentElement];
  }

  private bindMethods(): void {
    this.logMouseMovement = this.logMouseMovement.bind(this);
    this.updateCodeOutput = this.updateCodeOutput.bind(this);
  }

  private initializeElements(): void {
    this.$target = document.body;
    this.$cacheEl = document.body;
    this.$cacheElMain = document.body;
  }

  private async loadTemplate(): Promise<void> {
    const path = chrome.runtime.getURL('templates/template.html');
    const response = await fetch(path);
    if (response.ok) {
      this.template = await response.text();
      this.createTemplateNodes();
      this.registerEvents();
    } else {
      console.error('Error loading template:', response.status, response.statusText);
    }
  }

  private createTemplateNodes(): void {
    this.createHostElement();
    this.attachShadowToHost();
    this.populateShadowTemplate();
    this.setShadowElementReferences();
  }

  private createHostElement(): void {
    this.$host = document.createElement('div');
    this.$host.className = 'tl-host';
    this.$host.style.cssText = 'all: initial;';
    document.body.appendChild(this.$host);
  }

  private attachShadowToHost(): void {
    this.shadow = this.$host.attachShadow({mode: 'open'});
  }

  private populateShadowTemplate(): void {
    const templateMarkup = document.createElement("div");
    templateMarkup.innerHTML = this.template;
    this.shadow.innerHTML = templateMarkup.querySelector('template')!.innerHTML;
  }

  private setShadowElementReferences(): void {
    this.$wrap = this.shadow.querySelector('.tl-wrap')!;
    this.$code = this.shadow.querySelector('.tl-code')!;
  }

  private logMouseMovement(e: MouseEvent): void {
    this.$target = e.target as HTMLElement;

    if (this.forbidden.indexOf(this.$target) !== -1) return;

    this.stringified = this.serializer.serializeToString(this.$target);

    this.updateCodeOutput();

    this.$cacheEl = this.$target;
    this.renderer.drawOverlay(this.$target);
  }

  private updateCodeOutput(): void {
    if (this.$cacheElMain === this.$target) return;
    this.$cacheElMain = this.$target;

    this.$code.innerText = this.stringified
      .slice(0, this.stringified.indexOf('>') + 1)
      .replace(/ xmlns="[^"]*"/, '');
    Prism.highlightElement(this.$code);
  }

  registerEvents() {
    console.log('Registering events...');
    document.addEventListener('mousemove', this.logMouseMovement);
  }

  public async activate(): Promise<void> {
    await this.loadTemplate();
    this.renderer = new Renderer(this.shadow);
    this.renderer.registerEvents(() => this.$target);

    this.notification = new Notification(this.shadow);
    this.notification.registerEvents(() => this.$target);
  }

  public deactivate(): void {
    this.$wrap.classList.add('-out');
    document.removeEventListener('mousemove', this.logMouseMovement);
    setTimeout(() => {
      if (document.body.contains(this.$host)) {
        document.body.removeChild(this.$host);
      }
    }, 300);
  }

}

export default Inspector;
