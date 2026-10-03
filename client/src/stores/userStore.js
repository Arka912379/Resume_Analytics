import { create } from "zustand";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import api from "../api/api";
const { user } = useAuth()
const useUserStore = create(async (set) => ({
    userAllData: null,
    isAuthenticated: false,
    token: await user?.getIdToken(),
    fecthuser: async () => {
        const response = await api.get("/api/v1/auth/getuser");
        console.log(response)
    }




}))