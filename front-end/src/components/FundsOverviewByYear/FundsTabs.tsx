import { Box, Tabs, Tab } from "@mui/material";
interface Props {
  value: number;
  onChange: (tabIdx: number) => void;
}
const tabs = [
  { icon: "📈", label: "קו" },
  { icon: "📊", label: "עמודות" },
  { icon: "🥧", label: "עוגה" },
  { icon: "🌈", label: "שטח" },
  { icon: "🕸️", label: "רדאר" },
  { icon: "📋", label: "טבלה" },
];
const  FundsTabs = ({ value, onChange }: Props)=> {
  return (
    <Tabs
      value={value}
      onChange={(_, newTab) => onChange(newTab)}
      indicatorColor="primary"
      textColor="primary"
      sx={{ minHeight: 70, height: 70, mt: 0 }}
      variant="fullWidth"
    >
      {tabs.map((t, i) => (
        <Tab
          key={i}
          icon={
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: 28 }}>{t.icon}</span>
              <span style={{ fontSize: 13 }}>{t.label}</span>
            </Box>
          }
          aria-label={t.label}
        />
      ))}
    </Tabs>
  );
}
export default FundsTabs