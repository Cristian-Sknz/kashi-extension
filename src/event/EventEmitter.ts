type EmitterType = 'state';
type Callback<T> = (value: CustomEvent<T>) => any;

type MapValue<T> = {
  name: EmitterType;
  callback: Callback<T>;
}

type EmitOptions<T> = {
  state: T,
  element?: HTMLElement
}

class EventEmitter<T extends string> {
  private emitter: EventTarget;
  private map = new Map<Number, MapValue<T>>();
  private next = 0;

  constructor() {
    this.emitter = new EventTarget();
  }

  public emit({ state, element }: EmitOptions<T>) {
    if (element) {
      element.setAttribute('kashi', state);
    }
    this.emitter.dispatchEvent(new CustomEvent<T>('state', {
      detail: state
    }));
  }

  public on(name: EmitterType, callback: Callback<T>) {
    const value = this.next++;
    this.map.set(value, { name, callback });
    this.emitter.addEventListener(name, callback);
    return value;
  }

  public once(name: EmitterType, callback: Callback<T>) {
    const value = this.next++;
    this.map.set(value, { name, callback });
    this.emitter.addEventListener(name, callback, {
      once: true
    });
    return value;
  }

  public off(value: number) {
    if(this.map.has(value)) {
      const { name, callback} = this.map.get(value);
      this.emitter.removeEventListener(name, callback);
    }
  }
}

export default EventEmitter;