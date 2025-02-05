import * as React from "react"
import { StaticImage } from "gatsby-plugin-image";
import createPopWindows from "../components/PopWindows";
import { navigate } from "gatsby";
import LoadingAnimation from "../components/LoadingAnimation";
import { GasLink } from "../utils/GasLink";

function LoginPage() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [logining, setLogining] = React.useState<boolean>(false);

    async function hashPassword(password: string) {
        const encoder = new TextEncoder();
        const message = "qofmusyrps" + password; // 與後端一致的鹽
        const data = encoder.encode(message); // 轉換為 Uint8Array

        const hashBuffer = await crypto.subtle.digest("SHA-256", data); // 計算 SHA-256 雜湊
        const hashArray = Array.from(new Uint8Array(hashBuffer)); // 轉換為 byte array
        const hashBase64 = btoa(String.fromCharCode(...hashArray)) // 轉換為 Base64

        return hashBase64.replace(/=+$/, ""); // 移除 Base64 末尾的 "="
    }


    const handleSubmit = async (e: SubmitEventInit) => {
        // @ts-ignore
        e.preventDefault();
        try {
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain', 'User-Agent': 'insomnia/10.3.0' },
                body: `{"type":"login","data":{"name":"${username}","password":"${await hashPassword(password)}"}}`
            };
            const response = await fetch(GasLink, options)

            const result = await response.json();
            if (result.permissions > 0) {
                createPopWindows('Login successful', `role：${["Guest", "Student", "Teacher"][parseInt(result.permissions)]}`, () => { navigate("/") })
                if (typeof window !== 'undefined') {
                    localStorage.setItem("name", username)
                    localStorage.setItem("permissions", result.permissions)
                    localStorage.setItem('jwt', result.token);
                }
            } else {
                createPopWindows('Login failed', "Please try again. If you still cannot log in, please ask your teacher.")
                if (typeof window !== 'undefined') {
                    localStorage.setItem("name", "")
                    localStorage.setItem("permissions", "0")
                }
            }
            setLogining(false)
        } catch (error) {
            createPopWindows('Login failed', "error message：" + error)
            if (typeof window !== 'undefined') {
                localStorage.setItem("name", "")
                localStorage.setItem("permissions", "0")
            }
            setLogining(false)
        }
    };

    return (
        <div className=" w-full h-screen relative">
            <StaticImage
                src="../images/pexels-olly-3769138.jpg"

                alt="Background"
                layout="fullWidth"
                className="absolute top-0 left-0 w-full h-full object-cover"
            />
            <div className=" absolute w-full left-0 top-0 h-full ">
                <div className=" w-[90%] max-w-96 mx-auto mt-40 rounded-md p-4 max-h-96 bg-white/30 backdrop-blur-sm shadow-lg">
                    <h1 className=" text-3xl text-center font-extrabold">login</h1>
                    <form onSubmit={(e) => {
                        setLogining(true)
                        handleSubmit(e)
                    }} className="space-y-4 mt-4">
                        <div>
                            <label className=" text-lg text-white" htmlFor="username">帳號</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className=" outline-none w-full py-2 px-4 mt-2 bg-white/50 rounded-md"
                            />
                        </div>
                        <div>
                            <label className=" text-lg text-white" htmlFor="password">密碼</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className=" outline-none w-full py-2 px-4 mt-2 bg-white/50 rounded-md"
                            />
                        </div>
                        <button type="submit" className=" hover:bg-white/50 cursor-pointer w-full bg-white/20 rounded-md mt-4 py-2 px-4">
                            {logining ? <LoadingAnimation /> : "登入"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
export default LoginPage
