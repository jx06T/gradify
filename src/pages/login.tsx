import * as React from "react"
import { StaticImage } from "gatsby-plugin-image";
import { useState } from "react";
import createPopWindows from "../components/PopWindows";
import { navigate } from "gatsby";

const LoadingAnimation = () => {
    return (
        <div className="flex items-center justify-center w-full h-6 bg-transparent rounded-lg">
            <div className="flex space-x-2">
                <div className="w-3 h-3 bg-white rounded-full animate-[bounce_1s_ease-in-out_infinite]" />
                <div className="w-3 h-3 bg-white rounded-full animate-[bounce_1s_ease-in-out_0.2s_infinite]" />
                <div className="w-3 h-3 bg-white rounded-full animate-[bounce_1s_ease-in-out_0.4s_infinite]" />
            </div>
        </div>
    );
};

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [logining, setLogining] = useState<boolean>(false);

    const handleSubmit = async (e: SubmitEventInit) => {
        // @ts-ignore
        e.preventDefault();
        try {
            const options = {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain', 'User-Agent': 'insomnia/10.3.0' },
                body: `{"type":"login","data":{"name":"${username}","password":"${password}"}}`
            };
            const response = await fetch('https://script.google.com/macros/s/AKfycbxYwzWbMhfUxyyfgZ132y6cY9vo6loWDFnjFkTLtiajtwsTLk4C-eUIlM1ULbhafpdG/exec', options)

            const result = await response.json();
            console.log(result)
            if (result.permissions > 0) {
                createPopWindows('登入成功', `身分：${["未登入", "學生", "教師"][parseInt(result.permissions)]}`, () => { navigate("/") })
                localStorage.setItem("name", username)
                localStorage.setItem("permissions", result.permissions)
                localStorage.setItem("password", password)
            } else {
                createPopWindows('登入失敗', "請重新嘗試", () => { })
                localStorage.setItem("name", "")
                localStorage.setItem("permissions", "0")
            }
            setLogining(false)
        } catch (error) {
            createPopWindows('登入失敗', "錯誤訊息" + error, () => { })
            localStorage.setItem("name", "")
            localStorage.setItem("permissions", "0")
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
