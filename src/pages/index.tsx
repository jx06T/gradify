import * as React from "react"
import Header from "../components/Header"
import { GravityUiCircleChevronsRight } from "../components/Icons"
import { Link } from "gatsby";

function IndexPage() {
  return (
    <div>
      <Header />
      <div className=" mt-24 text-center">
        <Link to="/add" className=" text-xl py-2 hover:border-2 bg-slate-50 border-r-4 border-b-4 px-2 rounded-sm border-amber-600 "><span>Upload Grades</span><GravityUiCircleChevronsRight className=" inline-block mb-1 text-2xl ml-2" /></Link>
      </div>

    </div>
  )
}
export default IndexPage
