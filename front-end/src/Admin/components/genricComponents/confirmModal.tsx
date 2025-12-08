import { Dialog } from '@mui/material'
import { FC } from 'react'
interface Props {
    open: boolean
    onClose: () => void
    onSubmit: () => void
    text:string
}
const ConfirmModal:FC<Props> = ({open,onClose,onSubmit,text}) => {
  return (
<Dialog open={open} onClose={onClose}>
    <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">{text}</h1>
        <div className="flex justify-center space-x-4">
            <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                onClick={onSubmit}
            >
                Yes
            </button>
            <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                onClick={onClose}
            >
                No
            </button>
        </div>
    </div>

</Dialog>
  )
}

export default ConfirmModal