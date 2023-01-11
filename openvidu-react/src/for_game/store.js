import create from 'zustand';

const useStore = create((set) => ({
    gamers: [],
    setGamers: (gamer) => {
      set((state) => ({
        gamers: [...state.gamers, gamer]
      }));
    },
    deleteGamer: (name) => {
      set((state) => ({
        gamers: state.gamers.filter((a) => a.name !== name),
      }));
    },
    clearGamer:() =>{
      set((state) => ({
        gamers:[]
      }));
    }
    
  }));


export default useStore