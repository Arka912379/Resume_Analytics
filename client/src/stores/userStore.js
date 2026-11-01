import { create } from "zustand";
import api from "../api/api";
import axios from "axios";
const useUserStore = create(async (set) => ({
    userAllData: null,
    strikeDay: 0,
    isAuthenticated: false,
    isLoding: false,
    error: null,
    loginProcess: null,
    sendOtpProcess:null,
    refId:null,
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
        } finally {
            set({ isLoding: false })
        }

    },
    register: async () => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.post("/api/v1/auth/register");

            if (response.status === 200) {
                set({ userAllData: response.data.userData, isAuthenticated: true, strikeDay: response.data.strikeday })
            } else {
                set({ userAllData: null, isAuthenticated: false, strikeDay: 0 })
            }
        } catch (error) {
            set({ userAllData: null, isAuthenticated: false, strikeDay: 0 })
            throw error;
        } finally {
            set({ isLoding: false })
        }

    },
    login: async (email, password) => {
        try {
            set({ isLoading: true, error: null });
            const response = await api.post("/api/v1/auth/login", { email, password })
            if (response.status === 200) {
                set({ loginProcess: true })
            } else {
                set({ loginProcess: false })
            }

        } catch (error) {
            set({ loginProcess: false })
            throw error
        }
        finally {
            set({ isLoding: false })
        }

    },
    sendOtp: async (email) => {
        try {
            set({isLoading: true, error: null})
            const response= await api.post("/api/v1/auth/send-email",{email});
            if(response.status===200){
                set({sendOtpProcess:true,refId:response.data.referenceCode})
            }else{
                set({sendOtpProcess:false})
            }
        
        } catch (error) {
            set({ sendOtpProcess: false })
            throw error
        }
        finally {
            set({ isLoding: false })
        }
    },
    checkOTP: async(otp)=>{
        try {
            set({isLoading: true, error: null})
            const response = await api.post("/api/v1/auth/check-otp",{referenceCode:refId,otp})
            

            
        } catch (error) {
            
            
        }finally {
            set({ isLoding: false })
        }
    }




}))

export default useUserStore;