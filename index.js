import 'regenerator-runtime/runtime'

// redux style store
const makeGenState = (initialState) => {
  let state = initialState;
  const listeners = [];
  const getState = () => state;

  const subscribe = fn => {
    listeners.push(fn);
    return () => listeners.filter(l => l !== fn);
  }

  function* updaterGen() {
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
  const updater = updaterGen();
  return {
    getState,
    subscribe,
    updater,
  }
}


// examples
const initialState = { count: 0 };
const { subscribe, updater, getState } = makeGenState(initialState);

function render() {
  document.getElementById('app').innerHTML = JSON.stringify(getState());
}

render();
subscribe(render);

let i = 0;
document.querySelector('button').addEventListener('click', () => {
  updater.next({ count: i });
  i++
});

document.querySelector('input').addEventListener('input', e => {
  updater.next({ text: e.target.value });
})