import { create } from "zustand";
import api from "../api/api";
const useUserStore = create(async (set) => ({
    userAllData: null,
    strikeDay: 0,
    isAuthenticated: false,
    isLoding: false,
    error:null,
    fecthuser: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.get("/api/v1/auth/getuser");

            if (response.status === 200) {
                set({ userAllData: response.data.userData, isAuthenticated: true, strikeDay: response.data.strikeday })
            } else {
                set({ userAllData: null, isAuthenticated: false, strikeDay: 0 })
            }
        } catch (error) {
            set({ userAllData: null, isAuthenticated: false, strikeDay: 0 })
            throw error;
        }finally{
            set({isLoding:false})
        }

    }




}))

export default useUserStore;