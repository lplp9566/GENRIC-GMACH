import { FC } from "react"
import { InvestmentDto } from "../InvestmentDto"
interface GeneralInvestmentInfoCardProps {
    investment:InvestmentDto
}
const GeneralInvestmentInfoCard:FC<GeneralInvestmentInfoCardProps> = ({ investment }) => {
  return (
    <div>GeneralInvestmentInfoCard</div>
  )
}

export default GeneralInvestmentInfoCard