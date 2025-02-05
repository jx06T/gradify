import * as React from "react"
import { Link } from "gatsby";
import { MaterialSymbolsAccountCircle } from "./Icons";
import { navigate } from "gatsby";

function Header() {
    const [isHidden, setIsHidden] = React.useState<boolean>(false);
    const [showPerson, setShowPerson] = React.useState<boolean>(false);
    const [userName, setUserName] = React.useState<string>("");
    const [userPermissions, setUserPermissions] = React.useState<string>("");
    const lastScrollY = React.useRef(0);

    React.useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            setIsHidden(currentScrollY > lastScrollY.current && currentScrollY > 50);
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);

    }, []);

    React.useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            //@ts-ignore
            if (!e.target.classList || !e.target.parentNode.classList) {
                setShowPerson(false)
                return
            }

            //@ts-ignore
            if (e.target.classList.contains('d-c') || e.target.parentNode.classList.contains('d-c')) {
                return
            }
            setShowPerson(false)
        }

        if (typeof window !== 'undefined') {
            setUserName(localStorage.getItem('name') || "")
            setUserPermissions(["Guest", "Student", "Teacher"][parseInt(localStorage.getItem('permissions') || "0")] || "Guest")
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header
            className={` flex justify-between z-30 fixed top-0 left-0 w-full bg-white shadow-md transition-transform duration-300 ${isHidden ? "-translate-y-full" : "translate-y-0"}`}
        >
            <div className=" flex">
                <div className="ml-6 text-2xl font-bold py-2 px-0 masked-text w-fit">
                    <Link to="/">Gradify</Link>
                </div>
                <div className=" hidden sm:flex mx-10 w-full space-x-5 text-lg justify-end items-center">
                    <Link to="/" className=" hover:border-2 bg-slate-50 border-r-4 border-b-4 px-2 rounded-sm border-amber-600 ">Docs</Link>
                    <a href="https://github.com/jx06T/gradify" target="__blenk" className=" hover:border-2 bg-slate-50 border-r-4 border-b-4 px-2 rounded-sm border-amber-600 ">Github</a>
                </div>
            </div>
            <div className=" text-lg">
                <div className=" z-40 bg-white ">
                    <button className="px-2 pt-2 cursor-pointer" onClick={() => setShowPerson(true)}>
                        {userPermissions !== "Guest"
                            ? <span className=" inline-block mr-2 text-xl">{userName}</span>
                            : <Link to="/login" className=" underline inline-block mr-2 text-xl">Login</Link>
                        }
                        <MaterialSymbolsAccountCircle className=" inline-block text-4xl"></MaterialSymbolsAccountCircle>
                    </button>
                </div>
                <div className={`d-c rounded-b-md bg-white shadow-md text-lg -mt-36 pt-3  transition-transform duration-300 ${showPerson ? "translate-y-24" : "translate-y-0"}`}>
                    <div className="relative px-4 pt-3 d-c"><span className=" absolute top-0 left-2 text-sm">Role：</span>{userPermissions}</div>
                    <div className=" cursor-pointer px-4 py-2 hover:bg-blue-50 d-c"><button
                        className="underline cursor-pointer"
                        onClick={() => {
                            if (typeof window !== 'undefined') {
                                localStorage.setItem("name", "")
                                localStorage.setItem("permissions", "0")
                            }
                            setShowPerson(false)
                            navigate("/")
                        }}>Logout</button></div>
                </div>
            </div>
        </header >
    );
}

export default Header