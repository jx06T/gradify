import * as React from "react"
import Header from "../components/Header"
import CustomSelect from '../components/Select';

import { navigate } from "gatsby";
import createPopWindows from "../components/PopWindows";
import LoadingAnimation from "../components/LoadingAnimation";
import { GasLink } from "../utils/GasLink";


interface ExamScoreT { exam: string, score: number }

function ViewPage() {
    const [subject, setSubject] = React.useState<string>("")
    const [exam, setExam] = React.useState<string>("")
    const [studentId, setStudentId] = React.useState<string>("")
    const [subjects, setSubjects] = React.useState<string[]>([])
    const [exams, setExams] = React.useState<string[]>([])
    const [uploading, setUploading] = React.useState<boolean>(true)
    const [uploadingMsg, setUploadingMsg] = React.useState<string>("Verifying identity")
    const [scoresList, setScoresList] = React.useState<ExamScoreT[]>([])

    React.useEffect(()=>{
        console.log(studentId)
    },[studentId])

    React.useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "text/plain");
        const options = { method: 'GET', headers:myHeaders };

        fetch(GasLink + '?type=get-subjects&=', options)
            .then(response => response.json())
            .then(response => setSubjects(response.response))
            .catch(err => console.error(err));

    }, [])

    React.useEffect(() => {
        if (!subject) {
            return
        }

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "text/plain");
        const options = { method: 'GET', headers:myHeaders };

        fetch(GasLink + `?type=get-exams&subject=${subject}`, options)
            .then(response => response.json())
            .then(response => setExams(response.response))
            .catch(err => console.error(err));
    }, [subject])

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            if (!localStorage.getItem('permissions') || !localStorage.getItem("name") || !localStorage.getItem('permissions') || !localStorage.getItem("jwt")) {
                createPopWindows("Insufficient permissions", "Please log in", () => { navigate("/") })
                return
            }
            
            setStudentId(localStorage.getItem("id") || "")
            console.log(studentId,localStorage.getItem("id") || "")
            
            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "text/plain");
            const options = {
                method: 'POST',
                headers: myHeaders,
                body: `{"type":"verify","token":"${localStorage.getItem("jwt")}"}`
            };

            fetch(GasLink, options)
                .then(response => response.json())
                .then(response => {
                    if (!response.success) {
                        createPopWindows("Insufficient permissions", "Please log in", () => { navigate("/") })
                    }
                    setUploading(false)
                })
                .catch(err => console.error(err));
        }
    }, [])


    const handleSearch = () => {
        setUploading(true)
        setUploadingMsg("Searching")
         const myHeaders = new Headers();
        myHeaders.append("Content-Type", "text/plain");
        const options = { method: 'GET', headers:myHeaders };
        let token
        if (typeof window !== 'undefined') {
            token = localStorage.getItem("jwt") || ""
        }
        console.log(studentId)
        if (!exam) {
            fetch(GasLink + `?type=get-student-scores-by-subject&subject=${subject}&id=${studentId}&token=${token}`, options)
                .then(response => response.json())
                .then(response => {
                    if (response.status !== "normal" || !response.response.success) {
                        createPopWindows("Upload Failed", "error message：" + response.response.error)
                        setUploading(false)
                        return
                    }
                    setScoresList(response.response.scores)
                    setUploading(false)
                })
                .catch(err => {
                    createPopWindows("Failed to board the ship", "error message：" + err)
                    setUploading(false)
                });
        } else {
            fetch(GasLink + `?type=get-student-score-by-exam&subject=${subject}&id=${studentId}&exam=${exam}&token=${token}`, options)
                .then(response => response.json())
                .then(response => {
                    if (response.status !== "normal"|| !response.response.success) {
                        createPopWindows("Upload Failed", "error message：" + response.response.error)
                        setUploading(false)
                        return
                    }
                    setScoresList([{ exam: exam, score: response.response.score }])
                    console.log([{ exam: exam, score: response.response.score }])
                    setUploading(false)
                })
                .catch(err => {
                    createPopWindows("Failed to board the ship", "error message：" + err)
                    setUploading(false)
                });
        }
    }

    return (
        <div>
            <Header />
            <div className=" w-full mt-20">
                <div className=" px-[10%] sm:px-[20%] text-xl flex flex-col justify-center items-center">
                    <span className=" mt-4">Subject</span>
                    <CustomSelect
                        options={subjects.map(e => ({ value: e, label: e }))}
                        placeholder="Select a Subject or add a new one"
                        onChange={setSubject}
                        initialValue=""
                        maxH={200}
                    />
                    <span className=" mt-4">Exam Name</span>
                    <CustomSelect
                        options={exams.map(e => ({ value: e, label: e }))}
                        placeholder="Select a Exam Name or add a new one"
                        onChange={setExam}
                        initialValue=""
                        maxH={200}
                    />
                    <span className=" mt-4">Student Number</span>
                    <CustomSelect
                        options={exams.map(e => ({ value: e, label: e }))}
                        placeholder="Select a Exam Name or add a new one"
                        onChange={setStudentId}
                        initialValue={studentId}
                        maxH={200}
                    />

                    <div className=" mb-20 mt-10 w-full max-w-md ">
                        <div className=" w-full my-1 leading-8">
                            <span >subject：</span>
                            <span className=" bg-gray-200 px-2 rounded-md mr-5">{subject || "　"}</span>
                            <span >exam：</span>
                            <span className=" bg-gray-200 px-2 rounded-md mr-5">{exam || "　"}</span>

                        </div>
                        <div className=" text-right">
                            <button
                                onClick={handleSearch}
                                className=" inline-block mt-4 not-disabled:hover:border-2 disabled:cursor-not-allowed cursor-pointer bg-slate-50 border-r-4 border-b-4 px-2 rounded-sm border-amber-600 "
                            >
                                Search
                            </button>
                        </div>
                    </div>
                    {scoresList.map(e => <AScore key={e.exam} {...e} />)}
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



function AScore({ exam, score }: { exam: string, score: number }) {
    return (
        <div className=" w-full max-w-md my-1">
            <span >exam：</span>
            <span className=" py-0.5 bg-gray-200 px-2 rounded-md mr-5">{exam}</span>
            <span >score：</span>
            <span className=" py-0.5 bg-gray-200 px-2 rounded-md">{score}</span>
        </div>
    )
}