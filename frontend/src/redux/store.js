// In your store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import adminReducer from "./slices/adminSlice";
import architectReducer from "./slices/architectSlice";
import marketplaceReducer from "./slices/marketplaceSlice";
import projectReducer from "./slices/ProjectSlice";
import eventReducer from "./slices/eventSlice";
import clientsReducer from "./slices/clientsSlice";
import tasksReducer from "./slices/TaskSlice";
import quotesReducer from "./slices/quotesSlice";
import needSheetReducer from "./slices/needSheetSlice";
import subscriptionReducer from "./slices/subscriptionSlice";
import serviceCategoriesReducer from "./slices/serviceCategoriesSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    architect: architectReducer,
    marketplace: marketplaceReducer,
    projects: projectReducer,
    events: eventReducer,
    clients: clientsReducer,
    tasks: tasksReducer,
    subscriptions: subscriptionReducer,
    quotes: quotesReducer,
    needSheet: needSheetReducer,
    serviceCategories: serviceCategoriesReducer,
  },
});

export default store;
