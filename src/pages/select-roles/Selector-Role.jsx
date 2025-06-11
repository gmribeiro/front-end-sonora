import RoleSelector from "../../components/RoleSelector/RoleSelector.jsx";
import useTitle from "../../hooks/useTitle.js";

function SelectorRole() {
    useTitle('Tipo de Conta - Sonora');
    return (
        <>
            <RoleSelector />
        </>
    )
}
export default SelectorRole;