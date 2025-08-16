import API from "./index"

export const getAllReports = async () => {
  const res = await API.get("/reports")
  return res.data
}

export const deleteReport = async (reportId: number) => {
  return await API.delete(`/reports/${reportId}`)
}