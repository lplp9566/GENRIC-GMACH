import { Box, Typography } from "@mui/material";

export type FundsNode = {
  id: string;
  label: string;
  value: number;
  color?: string;
  children?: FundsNode[];
};

function safePct(value: number, base: number) {
  if (!base || base <= 0) return 0;
  return (value / base) * 100;
}

function NodeCard({
  label,
  value,
  percent,
  color,
  subtitle,
}: {
  label: string;
  value: number;
  percent: number;
  color?: string;
  subtitle?: string;
}) {
  const p = Math.round(percent);

  return (
    <Box
      sx={{
        position: "relative",
        minWidth: 190,
        p: 2,
        borderRadius: 4,
        border: "1px solid rgba(148,163,184,0.35)",
        bgcolor: "rgba(255,255,255,0.9)",
        boxShadow: "0 16px 34px rgba(2,6,23,0.10)",
        backdropFilter: "blur(8px)",
        textAlign: "center",
        transition: "transform 140ms ease, box-shadow 140ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 20px 45px rgba(2,6,23,0.14)",
        },
      }}
    >
      {/* אחוז badge */}
      <Box
        sx={{
          position: "absolute",
          top: -10,
          left: 12,
          px: 1.2,
          py: 0.4,
          borderRadius: 999,
          border: "1px solid rgba(148,163,184,0.35)",
          bgcolor: "#fff",
          fontWeight: 900,
          fontSize: 12,
          color: color ?? "text.primary",
          boxShadow: "0 10px 18px rgba(2,6,23,0.08)",
        }}
      >
        {p}%
      </Box>

      <Typography sx={{ fontWeight: 900, fontSize: 15 }}>
        {label}
      </Typography>

      {subtitle && (
        <Typography sx={{ mt: 0.2, fontSize: 12, color: "text.secondary", fontWeight: 700 }}>
          {subtitle}
        </Typography>
      )}

      <Typography
        sx={{
          mt: 0.8,
          fontWeight: 950,
          fontSize: 18,
        }}
      >
        ₪{Number(value || 0).toLocaleString()}
      </Typography>

      {/* פס התקדמות */}
      <Box
        sx={{
          mt: 1.2,
          height: 10,
          borderRadius: 999,
          bgcolor: "rgba(148,163,184,0.22)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${Math.min(100, Math.max(0, percent))}%`,
            bgcolor: color ?? "primary.main",
            borderRadius: 999,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.35)",
          }}
        />
      </Box>
    </Box>
  );
}

function Lines({ count }: { count: number }) {
  // קווים יותר “עדינים” עם נקודות
  return (
    <Box sx={{ width: "100%", maxWidth: 1100, height: 40 }}>
      <svg width="100%" height="40" viewBox="0 0 100 40" preserveAspectRatio="none">
        {/* יורד מההורה */}
        <path d="M50 0 V16" stroke="rgba(148,163,184,0.8)" strokeWidth="2" fill="none" />
        <circle cx="50" cy="16" r="1.8" fill="rgba(148,163,184,0.9)" />

        {/* אופקי */}
        <path d="M10 16 H90" stroke="rgba(148,163,184,0.65)" strokeWidth="2" fill="none" />

        {Array.from({ length: count }).map((_, i) => {
          const x = 10 + (80 * (i + 0.5)) / count;
          return (
            <g key={i}>
              <path d={`M${x} 16 V40`} stroke="rgba(148,163,184,0.65)" strokeWidth="2" fill="none" />
              <circle cx={x} cy="16" r="1.6" fill="rgba(148,163,184,0.9)" />
            </g>
          );
        })}
      </svg>
    </Box>
  );
}

function TreeLevel({
  node,
  parentValue,
  depth,
}: {
  node: FundsNode;
  parentValue: number; // בשביל אחוזים לפי אבא
  depth: number;
}) {
  const hasChildren = !!node.children?.length;

  // Root: אפשר להציג 100% או ביחס לעצמו
  const percent = depth === 0 ? 100 : safePct(node.value, parentValue);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, width: "100%" }}>
      <NodeCard
        label={node.label}
        value={node.value}
        percent={percent}
        color={node.color}
      />

      {hasChildren && (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Lines count={node.children!.length} />

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 2,
              maxWidth: 1200,
            }}
          >
            {node.children!.map((child) => (
              <Box key={child.id} sx={{ display: "flex", justifyContent: "center" }}>
                <TreeLevel node={child} parentValue={node.value} depth={depth + 1} />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default function FundsOverviewTree({ root }: { root: FundsNode }) {
  return (
    <Box
      dir="rtl"
      sx={{
        width: "100%",
        p: 3,
        display: "flex",
        justifyContent: "center",
        background:
          "radial-gradient(1000px 400px at 50% 0%, rgba(78,205,196,0.18), transparent 60%), radial-gradient(900px 500px at 20% 20%, rgba(255,204,92,0.14), transparent 60%)",
        borderRadius: 4,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 1250 }}>
        <TreeLevel node={root} parentValue={root.value} depth={0} />
      </Box>
    </Box>
  );
}
