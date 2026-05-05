"use client";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import { courses } from "@/lib/memberData";

type Tab = "courses" | "resources" | "newsletter" | "podcast";

const TABS: { key: Tab; label: string }[] = [
  { key: "courses", label: "Courses" },
  { key: "resources", label: "Resource library" },
  { key: "newsletter", label: "Newsletter" },
  { key: "podcast", label: "Podcast" },
];

export default function AdminContentPage() {
  const [tab, setTab] = useState<Tab>("courses");

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}>
        <Box>
          <Typography variant="overline" sx={{ color: "text.secondary", display: "block" }}>
            CONTENT CMS
          </Typography>
          <Typography variant="h2" sx={{ mt: 0.5, mb: 1, fontSize: { xs: "1.85rem", md: "2.5rem" } }}>
            Manage member content
          </Typography>
          <Typography sx={{ color: "text.secondary", maxWidth: 620 }}>
            Lester is the primary author. Any admin can edit; publishing requires a different admin to approve (2-eyes rule).
          </Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddCircleOutlineOutlinedIcon />}>
          New {tab === "courses" ? "course" : tab === "resources" ? "resource" : tab === "newsletter" ? "newsletter" : "episode"}
        </Button>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: "0.95rem" },
            "& .Mui-selected": { color: "primary.main" },
            "& .MuiTabs-indicator": { backgroundColor: "secondary.main", height: 3, borderRadius: 999 },
          }}
        >
          {TABS.map((t) => (
            <Tab key={t.key} value={t.key} label={t.label} />
          ))}
        </Tabs>
      </Box>

      {tab === "courses" && (
        <Grid container spacing={2.5}>
          {courses.map((c) => (
            <Grid key={c.slug} size={{ xs: 12, md: 6, lg: 4 }}>
              <Box
                sx={{
                  height: "100%",
                  borderRadius: "20px",
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "common.white",
                }}
              >
                <Box
                  sx={{
                    height: 92,
                    backgroundImage: c.thumbAccent,
                    position: "relative",
                  }}
                >
                  <Stack direction="row" sx={{ p: 1.5, justifyContent: "space-between" }}>
                    <Chip
                      label={c.category}
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.95)", color: "primary.dark", fontWeight: 700, fontSize: "0.65rem", height: 22 }}
                    />
                    <Chip
                      label="PUBLISHED"
                      size="small"
                      sx={{ bgcolor: "rgba(34,108,78,0.18)", color: "#0F3525", fontWeight: 700, fontSize: "0.62rem", height: 22, letterSpacing: "0.08em" }}
                    />
                  </Stack>
                </Box>
                <Box sx={{ p: 2.5 }}>
                  <Typography sx={{ fontSize: "1rem", fontWeight: 600, lineHeight: 1.3, mb: 1.25, minHeight: 50 }}>
                    {c.title}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 2, fontSize: "0.78rem", color: "text.secondary" }}>
                    <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>
                      {c.lessons.length} lessons
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>
                      {c.quiz.length} quiz Qs
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.78rem" }}>
                      {c.ceCredits} CE
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
                    <Typography variant="body2" sx={{ fontSize: "0.74rem", color: "text.secondary", flex: 1 }}>
                      Created by {c.instructor}
                    </Typography>
                    <Tooltip title="Preview">
                      <IconButton size="small" sx={{ color: "text.secondary" }}>
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" sx={{ color: "text.secondary" }}>
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {(tab === "resources" || tab === "newsletter" || tab === "podcast") && (
        <Box sx={{ p: 6, textAlign: "center", borderRadius: "20px", border: "1px dashed", borderColor: "divider", bgcolor: "common.white" }}>
          <Typography variant="h5" sx={{ fontSize: "1.15rem", mb: 1 }}>
            {tab === "resources" ? "Resource library coming soon" : tab === "newsletter" ? "Newsletter manager coming soon" : "Podcast manager coming soon"}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 480, mx: "auto" }}>
            CMS for {tab === "resources" ? "templates, calculators, SOPs" : tab === "newsletter" ? "monthly member newsletter" : "member-only audio episodes"} ships in Phase 1.5. Lester provides content; any admin can edit and publish.
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
