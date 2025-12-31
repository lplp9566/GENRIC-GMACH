import { Box, Card, IconButton, Typography } from "@mui/material";
import React, { FC } from "react";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
interface FrameProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}
const Frame: FC<FrameProps> = ({
  title,
  onToggle,
  expanded,
  children,
}: FrameProps) => {
  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          // bgcolor: "#f5f7fa",
          borderBottom: "1px solid #e6e9ef",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} color="#1c3c3c">
          {title}
        </Typography>
        <IconButton onClick={onToggle} size="small" sx={{ color: "#1c3c3c" }}>
          {expanded ? <FullscreenExitIcon /> : <FullscreenIcon />}
        </IconButton>
      </Box>
          <Box sx={{ flex: 1, p: 2 }}>{children}</Box>

    </Card>
  );
};

export default Frame;
