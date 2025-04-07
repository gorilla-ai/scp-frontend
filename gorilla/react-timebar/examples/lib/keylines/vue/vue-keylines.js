//
//     Vue components KeyLines v4.6.0-9745
//
//     Copyright © 2011-2018 Cambridge Intelligence Limited.
//     All rights reserved.
//

import Vue from 'vue';

KeyLines.promisify(Promise);

class BatchCreate {
  static get INITIAL_QUEUE() {
    return {
      registered: [],
      mounted: 0
    };
  }

  constructor() {
    this.registered = [];
    this.mounted = 0;
    this.busy = false;
    this.queue = BatchCreate.INITIAL_QUEUE;
  }

  register(component) {
    const stack = (this.busy ? this.queue : this).registered;
    stack.push(component);
  }

  unregister(component) {
    const stack = (this.busy ? this.queue : this).registered;
    stack.splice(stack.indexOf(component), 1);
  }

  mount() {
    (this.busy ? this.queue : this).mounted++;

    if (!this.busy) {
      this.createMaybe();
    }
  }

  unmount() {
      this.mounted = 0;
      this.registered = [];
      this.queue = BatchCreate.INITIAL_QUEUE;
  }

  createMaybe() {
    if (this.mounted > 0 && this.mounted === this.registered.length) {
      this.create();
    }
  }

  cleanup() {
    this.registered = this.queue.registered;
    this.mounted = this.queue.mounted;
    this.queue = BatchCreate.INITIAL_QUEUE;
  }

  create() {
    this.busy = true;
    const defs = this.registered.map(({ id, options, type }) => ({ id, options, type }));

    KeyLines.create(defs)
      .then(components => {
        // loop through registered, and set prop on them which is the loaded component
        const componentsById = (Array.isArray(components) ? components : [components])
          .reduce((dict, component) => {
            dict[component.id()] = component;
            return dict;
          }, {});

        this.registered.forEach(r => r.klcreate(componentsById[r.id]));
        this.busy = false;
        this.cleanup();
        this.createMaybe();
      })
      .catch(console.err);
  }
}

const batchCreate = new BatchCreate();

const template = `
<div :class="containerClass">
  <div :id="id" :style="styleObject"></div>
</div>
`;

export const KlComponent = Vue.component('kl-component', {
  props: {
    id: {
      type: String,
      required: true
    },
    containerClass: String,
    styleObject: Object,
    options: Object,
    data: Object,
    animateOnLoad: {
      type: Boolean,
      default: false
    },
    selection: {
      type: Array,
      default: () => []
    }
  },
  template,
  beforeCreate() {
    batchCreate.register(this);
  },
  mounted() {
    batchCreate.mount();
  },
  beforeDestroy() {
    batchCreate.unregister(this);
    if (this.component) {
      this.component.unbind('all', this.onEvent);
    }
  },
  destroyed() {
    batchCreate.unmount();
  },
  methods: {
    onEvent(...args) {
      const name = 'kl-' + args[0];
      const rest = args.slice(1);
      this.$emit('kl-all', args);
      this.$emit.apply(this, [name, ...rest]);
    },
    klcreate(component) {
      this.component = component;
      this.component.bind('all', this.onEvent);
      this.onResize();
      this.component.load(this.data)
        .then(() => this.onLoad({ animate: !!this.animateOnLoad }))
        .then(() => {
          component.selection(this.selection);
          this.$emit('kl-ready', component);
        });
    }
  }
});

export const Chart = Vue.component('kl-chart', {
  extends: KlComponent,
  data: () => ({
    type: 'chart'
  }),
  methods: {
    onLoad(options) {
      return this.component.layout('standard', options, );
    },
    onResize() {
      KeyLines.setSize(this.id, this.$el.clientWidth, this.$el.clientHeight);
      this.component.zoom('fit');
    }
  }
});

export const Timebar = Vue.component('kl-timebar', {
  extends: KlComponent,
  data: () => ({
    type: 'timebar'
  }),
  methods: {
    onLoad() {
      return this.component.zoom('fit');
    },
    onResize() {
      KeyLines.setSize(this.id, this.$el.clientWidth, this.$el.clientHeight);
    }
  }
});
