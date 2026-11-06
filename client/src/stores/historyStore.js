import { create } from "zustand";
import api from "../api/api";

const useHistoryStore = create((set) => ({
    history: [],
    message: null,
    isLoading : false,
    error : null
}));

export default useHistoryStore;