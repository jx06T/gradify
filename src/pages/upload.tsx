import * as React from "react"
import Header from "../components/Header"
import CustomSelect from '../components/Select';

import { navigate } from "gatsby";
import { MiEnter } from "../components/Icons";
import createPopWindows from "../components/PopWindows";
import LoadingAnimation from "../components/LoadingAnimation";
import { GAS_LINK } from "../utils/gasUrl";
import { storage } from "../utils/storage";


const NumberKeypad = ({ onAC, onSubmit, onChange, autoSubmitDelay = 1000 }: { onAC?: Function, onChange?: Function, onSubmit: Function, autoSubmitDelay?: number }) => {
    const [input, setInput] = React.useState('');
    const [timer, setTimer] = React.useState<NodeJS.Timeout | null>(null);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (/^[0-9]$/.test(e.key)) {
                setInput(prev => prev + e.key);
            }
            else if (e.key === 'Backspace') {
                setInput(prev => prev.slice(0, -1));
            }
            else if (e.key === 'Escape') {
                handleClear();
            }
            else if (e.key === ' ') {
                handleClear();
            }
            else if (e.key === 'Enter') {
                handleSubmit();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [[input]]);

    // 自動提交功能
    const resetTimer = React.useCallback(() => {
        if (timer) clearTimeout(timer);
        if (input && autoSubmitDelay) {
            const newTimer = setTimeout(() => {
                onSubmit(input);
                setInput('');
            }, autoSubmitDelay);
            setTimer(newTimer);
        }
    }, [input, timer, autoSubmitDelay, onSubmit]);

    React.useEffect(() => {
        // resetTimer();
        if (onChange) {
            onChange(input)
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [input]);

    // 處理數字輸入
    const handleNumberClick = (number: string) => {
        setInput(prev => prev + number);
    };

    // 處理清空
    const handleClear = () => {
        setInput('');
        if (onAC) {
            onAC()
        }
        if (timer) clearTimeout(timer);
    };

    // 處理確認
    const handleSubmit = () => {
        if (input) {
            onSubmit(input);
            setInput('');
            if (timer) clearTimeout(timer);
        }
    };

    const buttonClass = "border-2 border-white h-16 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 transition-colors /rounded-lg text-xl font-semibold";

    return (
        <div className=" mx-auto w-full max-w-sm my-2">
            {!onChange &&
                <div className="w-full mt-4 px-4 text-xl font-bold ">
                    {input || '-'}
                </div>
            }
            <div className="grid grid-cols-3 /gap-2 rounded-xl overflow-hidden">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                        key={num}
                        onClick={() => handleNumberClick(num + "")}
                        className={buttonClass}
                    >
                        {num}
                    </button>
                ))}
                <button
                    onClick={handleClear}
                    className={`${buttonClass} bg-gray-200 hover:bg-gray-300 active:bg-gray-400`}
                >
                    AC
                </button>

                <button
                    onClick={() => handleNumberClick('0')}
                    className={buttonClass}
                >
                    0
                </button>

                <button
                    onClick={handleSubmit}
                    className={`${buttonClass} bg-gray-200 hover:bg-gray-300 active:bg-gray-400`}
                >
                    <MiEnter className=" inline-block text-2xl" />
                </button>
            </div>
        </div>
    );
};

function AScore({ id, score, onDelete, name }: { name: string, id: number, score: number, onDelete: Function }) {
    return (
        <div className=" w-full max-w-md my-1 space-x-10">
            <span className=" w-20 inline-block">
                <span className=" py-0.5 bg-gray-200 px-2 rounded-md ">{id}</span>
            </span>
            <span className=" w-20 inline-block">
                <span className=" py-0.5 bg-gray-200 px-2 rounded-md ">{name}</span>
            </span>
            <span className=" w-20 inline-block">
                <span className=" py-0.5 bg-gray-200 px-2 rounded-md">{score}</span>
            </span>
            <span className=" w-20 inline-block">
                <span onClick={() => onDelete(id)} className=" py-0.5 cursor-pointer text-xl hover:bg-red-50 text-red-500 px-2 rounded-md">×</span>
            </span>
        </div>
    )
}
interface AddBodyT {
    type: string, token?: string, data?: { exam: string, subject: string, dataList: DataT[] }
}
interface DataT {
    name: string, id: number, score: number
}



function UploadPage() {
    const [dataList, setDataList] = React.useState<DataT[]>([])
    const [stId, setStId] = React.useState<number>(0)
    const [subject, setSubject] = React.useState<string>("")
    const [subjects, setSubjects] = React.useState<string[]>([])
    // const [classText, setClassText] = React.useState<string>("")
    // const [classesText, setClassesText] = React.useState<string[]>([])
    const [exam, setExam] = React.useState<string>("")
    const [exams, setExams] = React.useState<string[]>([])
    const [students, setStudents] = React.useState<{ name: string, id: number }[]>([])
    const [inputV, setInputV] = React.useState<number>(0)
    const [uploading, setUploading] = React.useState<boolean>(true)
    const [uploadingMsg, setUploadingMsg] = React.useState<string>("Verifying identity")

    const [uploadingExamList, setUploadingExamList] = React.useState<boolean>(false)

    const handleEnterNumber = (n: number) => {
        if (!stId) {
            setStId(n)
        } else {
            const student = (students.find(e => e.id == stId))
            if (!student) {
                return
            }
            setDataList([{ id: stId, score: n, name: student.name }, ...dataList.filter(e => e.id != stId)])
            setStId(0)
        }
    }

    const handleUpload = () => {
        setUploading(true)
        setUploadingMsg("Uploading")

        let body: AddBodyT = { type: "add", token: storage.getItem("jwt") || "" }
        body.data = { exam: exam, subject: subject, dataList: dataList }

        // console.log(body)
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "text/plain");
        const options = {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(body)
        };

        fetch(GAS_LINK, options)
            .then(response => response.json())
            .then(response => {
                if (response.situation == "success") {
                    createPopWindows("Upload Successfully")
                } else {
                    createPopWindows("Upload Failed", "error message：" + response.error, response.error === "Expired" ? (() => { navigate("/login?r=t") }) : undefined)
                }
                setUploading(false)
            })
            .catch(err => {
                createPopWindows("Failed to board the ship", "error message：" + err)
                setUploading(false)
            });
    }

    React.useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "text/plain");
        const options = { method: 'GET', headers: myHeaders };

        fetch(GAS_LINK + '?type=get-subjects', options)
            .then(response => response.json())
            .then(response => {
                setSubjects(response.response.data || [])
                // setUploading(false)
            })
            .catch(err => console.error(err));

        fetch(GAS_LINK + `?type=get-students&token=${storage.getItem('jwt')}`, options)
            .then(response => response.json())
            .then(response => {
                setStudents(response.response.data || [])
                setUploading(false)
            })
            .catch(err => console.error(err));
    }, [])

    // React.useEffect(() => {
    //     if (!classText) {
    //         return
    //     }

    //     const myHeaders = new Headers();
    //     myHeaders.append("Content-Type", "text/plain");
    //     const options = { method: 'GET', headers: myHeaders };

    //     fetch(GAS_LINK + `?type=get-exams&subject=${subject}`, options)
    //         .then(response => response.json())
    //         .then(response => setSubjects(response.response || []))
    //         .catch(err => console.error(err));
    // }, [classText])

    React.useEffect(() => {
        if (!subject) {
            return
        }

        setUploadingExamList(true)
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "text/plain");
        const options = { method: 'GET', headers: myHeaders };

        fetch(GAS_LINK + `?type=get-exams&subject=${subject}`, options)
            .then(response => response.json())
            .then(response => {
                setExams(response.response.data || [])
                setUploadingExamList(false)
            })
            .catch(err => console.error(err));

    }, [subject])


    React.useEffect(() => {
        if (!storage.getItem('permissions') || !storage.getItem("name") || storage.getItem('permissions') !== "2" || !storage.getItem("jwt")) {
            createPopWindows("Insufficient permissions", "Please log in as a teacher", () => { navigate("/login") })
            return
        }

        return
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "text/plain");
        const options = {
            method: 'POST',
            headers: myHeaders,
            body: `{"type":"verify","token":"${storage.getItem("jwt")}"}`
        };

        // fetch(GAS_LINK, options)
        //     .then(response => response.json())
        //     .then(response => {
        //         if (!response.success) {
        //             createPopWindows("Insufficient permissions", "Please log in as a teacher", () => { navigate("/login") })
        //         }
        //         setUploading(false)
        //     })
        //     .catch(err => console.error(err));
    }, [])

    return (
        <div>
            <Header />
            <div className=" w-full mt-20">
                <div className=" px-[10%] sm:px-[20%] text-lg flex flex-col justify-center items-center">
                    {/* <span className=" mt-4">Class</span>
                    <CustomSelect
                        options={classesText.map(e => ({ value: e, label: e }))}
                        placeholder="Select a Class or add a new one"
                        onChange={setClassText}
                        initialValue=""
                        maxH={200}
                    /> */}
                    <span className=" mt-4">Subject</span>
                    <CustomSelect
                        options={subjects.map(e => ({ value: e, label: e }))}
                        placeholder="Select a Subject or add a new one"
                        onChange={setSubject}
                        initialValue=""
                        maxH={200}
                    />
                    <span className=" mt-4 relative">Exam Name {uploadingExamList && <LoadingAnimation className=" top-1 bg-white/40 absolute" primaryColor=" bg-gray-900"></LoadingAnimation>}</span>
                    <CustomSelect
                        options={exams.map(e => ({ value: e, label: e }))}
                        placeholder="Select a Exam Name or add a new one"
                        onChange={setExam}
                        initialValue=""
                        maxH={200}
                    />
                    <div className="w-full max-w-md pl-11 mt-4 px-4 text-xl font-bold ">
                        {stId > 0 && stId + `（${((students.find(e => e.id == stId)) || { name: "None" }).name}）｜`}{inputV || '-'}
                    </div>
                    <NumberKeypad onSubmit={handleEnterNumber} onChange={setInputV} autoSubmitDelay={500} onAC={() => setStId(0)}></NumberKeypad>
                    <hr className=" my-2 mb-3  w-full" />
                    <div className=" w-full max-w-md my-1 space-x-10">
                        <span className=" inline-block w-20">Number</span>
                        <span className=" inline-block w-20">Name</span>
                        <span className=" inline-block w-20">Score</span>
                        <span className=" inline-block w-20">Delete</span>
                    </div>
                    {dataList.map(e => (<AScore key={e.id} {...e} onDelete={(dId: number) => setDataList(dataList.filter(e => e.id != dId))} />))}
                    {dataList.length > 0 &&
                        <hr className=" mt-10 mb-3  w-full" />
                    }
                    <div className=" mb-20 w-full max-w-md ">
                        <div className=" w-full my-1 leading-8">
                            <span >subject：</span>
                            <span className=" bg-gray-200 px-2 rounded-md mr-5">{subject || "　"}</span>
                            <span >exam：</span>
                            <span className=" bg-gray-200 px-2 rounded-md mr-5">{exam || "　"}</span>
                            <span className=" text-nowrap" >data length：
                                <span className=" bg-gray-200 px-2 rounded-md text-nowrap">{dataList.length}</span>
                            </span>
                        </div>
                        <div className=" text-right">
                            <button
                                className=" inline-block mt-4 not-disabled:hover:border-2 disabled:cursor-not-allowed cursor-pointer bg-slate-50 border-r-4 border-b-4 px-2 rounded-sm border-amber-600 "
                                disabled={dataList.length === 0 || !subject || !exam}
                                onClick={handleUpload}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {uploading &&
                <div className=" fixed left-0 top-0 w-full h-full bg-white/30 backdrop-blur-sm pt-80">
                    <div className=" w-full text-center text-2xl mb-4 ">{uploadingMsg}</div>
                    <LoadingAnimation primaryColor="bg-gray-600" className=" scale-150"></LoadingAnimation>
                </div>
            }
        </div>
    )
}
export default UploadPage
