import * as React from "react"
import Header from "../components/Header"
import CustomSelect from '../components/Select';

import { navigate } from "gatsby";
import createPopWindows from "../components/PopWindows";
import LoadingAnimation from "../components/LoadingAnimation";
import { GAS_LINK } from "../utils/gasUrl";
import { storage } from "../utils/storage";


function ScoresTable({ rowHeader, colHeader, data }: { rowHeader: string[], colHeader: string[], data: string[][] }) {
    return (
        <div className="w-full overflow-x-auto relative rounded-md border-x-2 border-y border-gray-400">
            <table className="w-full table-auto whitespace-nowrap rounded-md">
                <thead>
                    <tr className="bg-gray-200 text-black">
                        <th className="border p-2 border-gray-300"></th>
                        {rowHeader.map((header, index) => (
                            <th key={index} className="border border-gray-300 p-2">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-100">
                            <td className="border p-2 font-bold bg-gray-100 border-gray-300 w-36">{colHeader[rowIndex]}</td>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="border border-gray-300 p-2 text-center">{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

function transpose(matrix: string[][]) {
    return matrix[0].map((_, colIndex) =>
        matrix.map(row => row[colIndex])
    );
}


function ViewPage() {
    const [subject, setSubject] = React.useState<string>("")
    const [exam, setExam] = React.useState<string>("")
    const [studentId, setStudentId] = React.useState<string>("")
    const [subjects, setSubjects] = React.useState<string[]>([])
    const [exams, setExams] = React.useState<string[]>(["All"])
    const [uploading, setUploading] = React.useState<boolean>(true)
    const [uploadingExamList, setUploadingExamList] = React.useState<boolean>(false)
    const [uploadingMsg, setUploadingMsg] = React.useState<string>("Verifying identity")
    const [students, setStudents] = React.useState<{ name: string, id: number }[]>([])

    const [rowHeader, setRowHeader] = React.useState<string[]>([])
    const [colHeader, setColHeader] = React.useState<string[]>([])
    const [scoreData, setScoreData] = React.useState<string[][]>([])

    const [showSendBtn, setShowSendBtn] = React.useState<boolean>(false)
    const [sendSubject, setSendSubject] = React.useState<string>('')

    React.useEffect(() => {
        console.log(studentId)
    }, [studentId])

    React.useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "text/plain");
        const options = { method: 'GET', headers: myHeaders };

        fetch(GAS_LINK + '?type=get-subjects&=', options)

            .then(response => response.json())
            .then(response => {
                setSubjects(response.response.data || [])
                setUploading(false)
            })
            .catch(err => console.error(err));

        fetch(GAS_LINK + `?type=get-students&token=${storage.getItem('jwt')}`, options)
            .then(response => response.json())
            .then(response => {
                if (response.status == "error" && response.message == "Error: Expired") {
                    storage.setItem('jwt', '')
                    createPopWindows("Login expired", "Please log in again", () => navigate("/login?r=t"))
                    return
                }
                if (response.status == "error" && response.message == "Error: Verification failure") {
                    storage.setItem('jwt', '')
                    createPopWindows("Login error", "Please log in again", () => navigate("/login?r=t"))
                    return
                }
                setStudents([{ id: "All", name: "all" }, ...(response.response.data || [])])
                setUploading(false)
            })
            .catch(err => alert(err));

    }, [])

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
                setExams(["All", ...(response.response.data || [])])
                setUploadingExamList(false)
            })
            .catch(err => console.error(err));
    }, [subject])

    React.useEffect(() => {
        if (!storage.getItem('permissions') || !storage.getItem("name") || !storage.getItem("jwt")) {
            createPopWindows("Insufficient permissions", "Please log in", () => { navigate("/login") })
            return
        }

        setStudentId(storage.getItem('permissions') == "1" ? storage.getItem("id") || "" : "")
        return

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "text/plain");
        const options = {
            method: 'POST',
            headers: myHeaders,
            body: `{"type":"verify","token":"${storage.getItem("jwt")}"}`
        };

        fetch(GAS_LINK, options)
            .then(response => response.json())
            .then(response => {
                if (!response.success) {
                    createPopWindows("Insufficient permissions", "Please log in", () => { navigate("/") })
                }
                setUploading(false)
            })
            .catch(err => console.error(err));
    }, [])

    const handleSend = () => {
        setUploading(true)
        setUploadingMsg("Sending")
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "text/plain");
        const options = {
            method: 'POST',
            headers: myHeaders,
            body: `{"type":"send","token":"${storage.getItem("jwt")}","data":{"subject":"${sendSubject}"}}`
        };

        fetch(GAS_LINK, options)
            .then(response => response.json())
            .then(response => {
                if (!response.success) {
                    createPopWindows("Failed to send email", "error message：" + response.message)
                } else {
                    createPopWindows("Email sending results", response.results.map((e: { name: string, status: string }) => `${e.name} ｜ status:${e.status}`).join("\n"))
                }
                setUploading(false)
            })
            .catch(err => console.error(err));
    }

    const handleSearch = () => {
        setShowSendBtn(false)
        setUploading(true)
        setUploadingMsg("Searching")
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "text/plain");
        const options = { method: 'GET', headers: myHeaders };
        const token = storage.getItem("jwt") || ""

        if (!exam || exam == "All") {
            if (studentId === "All") {
                fetch(GAS_LINK + `?type=get-all-student-scores-by-subject&subject=${subject}&token=${token}`, options)
                    .then(response => response.json())
                    .then(response => {
                        if (response.status !== "normal" || !response.response.success) {
                            createPopWindows("Upload Failed", "error message：" + response.message)
                            setUploading(false)
                            return
                        }
                        const rData = response.response.scores
                        setColHeader(students.map(e => `${e.id}（${e.name}）`).slice(1))
                        setRowHeader(rData.map((e: { exam: string }) => e.exam))
                        setScoreData(transpose(rData.map((e: { data: number[] }) => e.data)))

                        setUploading(false)
                        setShowSendBtn(true)
                        setSendSubject(subject)
                    })
                    .catch(err => {
                        createPopWindows("Failed to board the ship", "error message：" + err)
                        setUploading(false)
                    });
            } else {
                fetch(GAS_LINK + `?type=get-student-scores-by-subject&subject=${subject}&id=${studentId}&token=${token}`, options)
                    .then(response => response.json())
                    .then(response => {
                        if (response.status !== "normal" || !response.response.success) {
                            createPopWindows("Upload Failed", "error message：" + response.message)
                            setUploading(false)
                            return
                        }
                        const rData = response.response.scores
                        setColHeader([`${studentId}（${getNameById(studentId)}）`])
                        setRowHeader(rData.map((e: { exam: string }) => e.exam))
                        setScoreData([rData.map((e: { score: number }) => e.score)])

                        setUploading(false)
                    })
                    .catch(err => {
                        createPopWindows("Failed to board the ship", "error message：" + err)
                        setUploading(false)
                    });
            }
        } else {
            if (studentId === "All") {
                fetch(GAS_LINK + `?type=get-all-student-scores-by-exam&subject=${subject}&exam=${exam}&token=${token}`, options)
                    .then(response => response.json())
                    .then(response => {
                        if (response.status !== "normal" || !response.response.success) {
                            createPopWindows("Upload Failed", "error message：" + response.message)
                            setUploading(false)
                            return
                        }

                        const rData = response.response.scores
                        setColHeader(students.map(e => `${e.id}（${e.name}）`).slice(1))
                        setRowHeader([exam])
                        setScoreData(rData.map((e: number) => ([e])))

                        setUploading(false)
                    })
                    .catch(err => {
                        createPopWindows("Failed to board the ship", "error message：" + err)
                        setUploading(false)
                    });
            } else {
                fetch(GAS_LINK + `?type=get-student-score-by-exam&subject=${subject}&id=${studentId}&exam=${exam}&token=${token}`, options)
                    .then(response => response.json())
                    .then(response => {
                        if (response.status !== "normal" || !response.response.success) {
                            createPopWindows("Upload Failed", "error message：" + response.message)
                            setUploading(false)
                            return
                        }

                        const rData = response.response.score
                        setColHeader([`${studentId}（${getNameById(studentId)}）`])
                        setRowHeader([exam])
                        setScoreData([[rData]])

                        setUploading(false)
                    })
                    .catch(err => {
                        createPopWindows("Failed to board the ship", "error message：" + err)
                        setUploading(false)
                    });
            }
        }
    }

    const getNameById = (id: string) => {
        return (students.find(e => e.id == parseInt(id)) || id == "ALL") ? students.find(e => e.id == parseInt(id))!.name : id == "ALL" ? "all" : "None"
    }
    return (
        <div>
            <Header />
            <div className=" w-full mt-20">
                <div className=" px-[10%] sm:px-[20%] text-xl flex flex-col justify-center items-center">
                    <span className=" mt-4">Subject</span>
                    <CustomSelect
                        options={subjects.map(e => ({ value: e, label: e }))}
                        placeholder="Select a Subject"
                        onChange={setSubject}
                        initialValue=""
                        maxH={200}
                        disabledNew={true}
                    />
                    <span className=" mt-4 relative">Exam Name {uploadingExamList && <LoadingAnimation className=" top-1 bg-white/40 absolute" primaryColor=" bg-gray-900"></LoadingAnimation>}</span>
                    <CustomSelect
                        options={exams.map(e => ({ value: e, label: e }))}
                        placeholder="Select a Exam Name"
                        onChange={setExam}
                        initialValue=""
                        maxH={200}
                        disabledNew={true}
                    />
                    <span className=" mt-4">Student Number</span>
                    <CustomSelect
                        options={students.map(e => ({ value: e.id.toString(), label: `${e.id}（${e.name}）` }))}
                        placeholder="Select a Exam Name "
                        onChange={setStudentId}
                        initialValue={studentId}
                        maxH={200}
                        disabledNew={true}
                    />

                    <div className=" mb-20 mt-10 w-full max-w-md ">
                    <div className="w-full my-1 leading-8 flex flex-wrap gap-x-5 gap-y-1">
                        <span className="inline-block text-nowrap">subject：</span>
                        <span className="inline-block text-nowrap bg-gray-200 px-2 rounded-md">{subject || "　"}</span>
                    
                        <span className="inline-block text-nowrap">exam：</span>
                        <span className="inline-block text-nowrap bg-gray-200 px-2 rounded-md">{exam || "　"}</span>
                    
                        <span className="inline-block text-nowrap">student：</span>
                        <span className="inline-block text-nowrap bg-gray-200 px-2 rounded-md">
                            {studentId ? `${studentId}（${getNameById(studentId)}）` : "　"}
                        </span>
                    </div>
                        <div className=" text-right">
                            <button
                                onClick={handleSearch}
                                disabled={!subject}
                                className=" h-10 inline-block mt-4 not-disabled:hover:border-2 disabled:cursor-not-allowed cursor-pointer bg-slate-50 border-r-4 border-b-4 px-2 rounded-sm border-amber-600 "
                            >
                                Search
                            </button>
                        </div>
                    </div>
                    {/* <div className=" flex rounded-lg overflow-hidden">
                        {scoresList.map(e => <AScore key={e.exam} {...e} />)}
                    </div> */}
                </div>
                <div className="  px-[5%] sm:px-[10%] flex flex-col mb-20">
                    <ScoresTable
                        rowHeader={rowHeader}
                        colHeader={colHeader}
                        data={scoreData}
                    />
                    {showSendBtn &&
                        <div className=" text-right mt-4">
                            <button
                                onClick={handleSend}
                                className=" inline-block mt-4 h-10 not-disabled:hover:border-2 disabled:cursor-not-allowed cursor-pointer bg-slate-50 border-r-4 border-b-4 px-2 rounded-sm border-amber-600 "
                            >
                                Send email to students
                            </button>
                        </div>
                    }
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
export default ViewPage

