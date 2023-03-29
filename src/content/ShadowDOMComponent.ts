/**
 * Abstract class for Shadow DOM components. It provides a common interface for all components that should do
 * overlay related things. It also provides a common way to register events.
 *
 */
abstract class ShadowDOMComponent {
  protected shadowRoot: ShadowRoot;
  constructor(shadowRoot: ShadowRoot) { this.shadowRoot = shadowRoot; }
  protected abstract bindMethods(): void;
  abstract registerEvents(getTargetCallback: () => HTMLElement): void;
}

export default ShadowDOMComponent;
