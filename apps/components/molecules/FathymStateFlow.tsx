// import { createContext, JSX } from "preact";
// import { useContext } from "preact/hooks";
// import { deepSignal } from "npm:deepsignal";

// export interface FathymStateFlowProps extends JSX.HTMLAttributes<HTMLElement> {
//   state?: Record<string, unknown>;
// }

// export default function FathymStateFlow(props: FathymStateFlowProps) {
//   const state = deepSignal(props.state);

//   const DeepState = createContext(state);

//   return (
//     <DeepState.Provider value={state}>
//       {props.children}
//     </DeepState.Provider>
//   );
// }
