import { Fragment, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import AppRoute from "./route/AppRoute";
import { AuthProvider } from "./contexts/AuthProvider";
import { useDispatch } from "react-redux";
import { fetchShippingCharges } from "./redux/slices/shippingSlice";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchShippingCharges());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoute />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
