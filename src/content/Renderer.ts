import ShadowDOMComponent from "./ShadowDOMComponent";

class Renderer extends ShadowDOMComponent {
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  constructor(shadowRoot: ShadowRoot) {
    super(shadowRoot);
    this.bindMethods();
    this.setCanvasElement();
  }

  protected bindMethods(): void {
    this.drawOverlay = this.drawOverlay.bind(this);
    this.handleResize = this.handleResize.bind(this);
  }

  private setCanvasElement(): void {
    this.canvas = this.shadowRoot.querySelector("#tl-canvas")!;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.canvas.style.pointerEvents = "none";
    this.ctx = this.canvas.getContext("2d")!;
  }

  public drawOverlay(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(element);
    const box = {
      width: rect.width as number,
      height: rect.height as number,
      top: rect.top as number,
      left: rect.left as number,
      margin: {
        top: computedStyle.marginTop! as unknown as number,
        right: computedStyle.marginRight! as unknown as number,
        bottom: computedStyle.marginBottom! as unknown as number,
        left: computedStyle.marginLeft! as unknown as number,
      },
      padding: {
        top: computedStyle.paddingTop! as unknown as number,
        right: computedStyle.paddingRight! as unknown as number,
        bottom: computedStyle.paddingBottom! as unknown as number,
        left: computedStyle.paddingLeft! as unknown as number,
      },
    };

    ["margin", "padding"].forEach((property) => {
      // @ts-ignore
      for (const el in box[property]) {
        // @ts-ignore
        const val = parseInt(box[property][el], 10);
        // @ts-ignore
        box[property][el] = Math.max(0, val);
      }
    });

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    box.left = Math.floor(box.left) + 1.5;
    box.width = Math.floor(box.width) - 1;

    let x: number, y: number, width: number, height: number;

    // margin
    x = box.left - box.margin.left;
    y = box.top - box.margin.top;
    width = box.width + box.margin.left + box.margin.right;
    height = box.height + box.margin.top + box.margin.bottom;

    this.ctx.fillStyle = "rgba(255,165,0,0.5)";
    this.ctx.fillRect(x, y, width, height);

    // padding
    x = box.left;
    y = box.top;
    width = box.width;
    height = box.height;

    this.ctx.fillStyle = "rgba(158,113,221,0.5)";
    this.ctx.clearRect(x, y, width, height);
    this.ctx.fillRect(x, y, width, height);

    // content
    x = box.left + box.padding.left;
    y = box.top + box.padding.top;
    width = box.width - box.padding.right - box.padding.left;
    height = box.height - box.padding.bottom - box.padding.top;

    this.ctx.fillStyle = "rgba(73,187,231,0.25)";
    this.ctx.clearRect(x, y, width, height);
    this.ctx.fillRect(x, y, width, height);

    // rulers (horizontal - =)
    x = -10;
    y = Math.floor(box.top) + 0.5;
    width = this.canvas.width + 10;
    height = box.height - 1;

    this.ctx.beginPath();
    this.ctx.setLineDash([10, 3]);
    this.ctx.fillStyle = "rgba(0,0,0,0.02)";
    this.ctx.strokeStyle = "rgba(13, 139, 201, 0.45)";
    this.ctx.lineWidth = 1;
    this.ctx.rect(x, y, width, height);
    this.ctx.stroke();
    this.ctx.fill();

// rulers (vertical - ||)
    x = box.left;
    y = -10;
    width = box.width;
    height = this.canvas.height + 10;

    this.ctx.beginPath();
    this.ctx.setLineDash([10, 3]);
    this.ctx.fillStyle = "rgba(0,0,0,0.02)";
    this.ctx.strokeStyle = "rgba(13, 139, 201, 0.45)";
    this.ctx.lineWidth = 1;
    this.ctx.rect(x, y, width, height);
    this.ctx.stroke();
    this.ctx.fill();
  }

  clearOverlay(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  handleResize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  registerEvents(getTargetCallback: () => HTMLElement): void {
    document.addEventListener("scroll", () => {
      this.drawOverlay(getTargetCallback());
    });

    window.addEventListener("resize", () => {
      this.handleResize();
      this.drawOverlay(getTargetCallback());
    });
  }
}

export default Renderer;
