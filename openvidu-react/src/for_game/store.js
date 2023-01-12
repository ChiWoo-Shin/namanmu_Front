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

  myUserID: "none",
  set_myUserID: (input) => set({ myUserID: input }),
  //경준
  cur_time: 1000000,
  settime: (input) => set({ cur_time: input }),

  time_state: "no_change",
  set_time_change: (input) => set({ time_state: input }),

  cnt_answer: 0,
  cnt_plus: (input) => set(() => ({ cnt_answer: input })),

  //Team 별  round 점수
  curRed_cnt: 0,
  set_CurRed_cnt: (input) => set(() => ({ curRed_cnt: input })),
  curBlue_cnt: 0,
  set_CurBlue_cnt: (input) => set(() => ({ curBlue_cnt: input })),
  curRed_total: 0,
  set_CurRed_total: (input) => set(() => ({ curRed_total: input })),
  curBlue_total: 0,
  set_CurBlue_total: (input) => set(() => ({ curBlue_total: input })),

  cur_session: undefined,
  set_session_change: (input) => set({ cur_session: input }),

  cur_turn_states: "room",
  set_turn_state_change: (input) => set({ cur_turn_states: input }),

  cur_who_turn: "none",
  set_who_turn: (input) => set({ cur_who_turn: input }),

  cur_round: 0,
  set_cur_round: (input) => set({ cur_round: input }),

  is_my_turn: false,
  set_my_turn: (input) => set({ is_my_turn: input }),
}));

export default useStore;
