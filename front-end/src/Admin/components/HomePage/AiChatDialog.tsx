import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { api } from "../../../store/axiosInstance";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type AskResponse = { value: unknown } | { rows: unknown[] };

type AiChatDialogProps = {
  open: boolean;
  onClose: () => void;
};

const formatAnswer = (data: AskResponse): string => {
  if ("value" in data) {
    return data.value === null ? "אין נתון" : String(data.value);
  }

  const rows = data.rows;
  if (!Array.isArray(rows) || rows.length === 0) {
    return "לא נמצאו תוצאות.";
  }

  const hasFullName =
    rows.every((row) => row && typeof row === "object") &&
    rows.some((row) => "first_name" in (row as Record<string, unknown>));

  if (hasFullName) {
    return rows
      .map((row) => {
        const record = row as Record<string, unknown>;
        const first = record.first_name ? String(record.first_name) : "";
        const last = record.last_name ? String(record.last_name) : "";
        const combined = `${first} ${last}`.trim();
        return combined || JSON.stringify(record);
      })
      .join("\n");
  }

  return rows.map((row) => JSON.stringify(row)).join("\n");
};

const newConversationId = (): string => {
  return `conv-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
};

const AiChatDialog: React.FC<AiChatDialogProps> = ({ open, onClose }) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && !conversationId) {
      setConversationId(newConversationId());
    }
  }, [open, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const canSend = useMemo(() => input.trim().length > 0 && !loading, [input, loading]);

  const handleSend = async () => {
    if (!canSend || !conversationId) {
      return;
    }

    const question = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setLoading(true);

    try {
      const response = await api.post<AskResponse>("/ai/ask", {
        conversationId,
        question,
      });
      const answer = formatAnswer(response.data);
      setMessages((prev) => [...prev, { role: "assistant", content: answer }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "שגיאה בזמן ביצוע הבקשה. נסה שוב." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>צ׳אט AI</DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            minHeight: 260,
            maxHeight: 420,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {messages.length === 0 && (
            <Typography color="text.secondary">אפשר לשאול כאן שאלות על הנתונים.</Typography>
          )}
          {messages.map((msg, index) => (
            <Box
              key={`${msg.role}-${index}`}
              sx={{
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                px: 2,
                py: 1.5,
                borderRadius: 2,
                backgroundColor: msg.role === "user" ? "primary.main" : "grey.200",
                color: msg.role === "user" ? "primary.contrastText" : "text.primary",
                whiteSpace: "pre-wrap",
              }}
            >
              {msg.content}
            </Box>
          ))}
          {loading && (
            <Box sx={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 1 }}>
              <CircularProgress size={18} />
              <Typography variant="body2">חושב...</Typography>
            </Box>
          )}
          <div ref={bottomRef} />
        </Box>
        <Box mt={2} display="flex" gap={2}>
          <TextField
            label="השאלה שלך"
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            multiline
            minRows={2}
          />
          <Button variant="contained" onClick={handleSend} disabled={!canSend}>
            שלח
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>סגור</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AiChatDialog;
