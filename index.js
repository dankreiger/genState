import 'regenerator-runtime/runtime'

const makeGenState = (initialState) => {
  let state = initialState;
  const listeners = [];
  const getState = () => state;

  const subscribe = fn => {
    listeners.push(fn);
    return () => listeners.filter(l => l !== fn);
  }

  function* updater() {
    while (true) {
      const update = yield;
      if (typeof update !== 'object') {
        throw new Error(`Invalid payload: ${update}. Update payload must be a plain object.`);
      }
      state = { ...state, ...update }
      for (let i = 0; i < listeners.length; i++) {
        const listener = listeners[i];
        listener();
      }
    }
  }

  return {
    getState,
    subscribe,
    updater,
  }
}

const initialState = { count: 0 };
const store = makeGenState(initialState);

// use the same instance or make new ones - they will do the same thing
const updaterInstance = store.updater();
const updaterInstance1 = store.updater();

function render() {
  document.getElementById('app').innerHTML = JSON.stringify(store.getState());
}

render();
store.subscribe(render);

let i = 0;
document.querySelector('button').addEventListener('click', () => {
  updaterInstance1.next({ count: i });
  i++
});

document.querySelector('input').addEventListener('input', e => {
  updaterInstance.next({ text: e.target.value });
})