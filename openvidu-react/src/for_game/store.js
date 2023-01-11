import create from "zustand";

const useStore = create((set) => ({
  //치우
  gamers: [],
  setGamers: (gamer) => {
    set((state) => ({
      gamers: [...state.gamers, gamer],
    }));
  },

  deleteGamer: (name) => {
    set((state) => ({
      gamers: state.gamers.filter((a) => a.name !== name),
    }));
  },
  clearGamer: () => {
    set((state) => ({
      gamers: [],
    }));
  },

  //경준
  cur_time: 1000000,
  settime: (input) => set({ cur_time: input }),

  time_state: "no_change",
  set_time_change: (input) => set({ time_state: input }),

  cnt_answer: 0,
  cnt_plus: (input) => set(() => ({ cnt_answer: input })),

  cur_session: undefined,
  set_session_change: (input) => set({ cur_session: input }),

  cur_turn_states: "room",
  set_turn_state_change: (input) => set({ cur_turn_states: input }),
}));

export default useStore;
