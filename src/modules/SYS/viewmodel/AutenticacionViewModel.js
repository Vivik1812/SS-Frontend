import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { guardarToken } from "../service/AuthService";

const useAutenticacionViewModel = () =>{
    const [parametros] = useSearchParams();
    const navegar = useNavigate();

    useEffect(() => {
        const token = parametros.get("token");

        if(token){
            guardarToken(token);
            navegar("/", {replace: true});
            return;
        }

        navegar("/login", {replace: true});
    },[parametros], navegar);
}

export default useAutenticacionViewModel;