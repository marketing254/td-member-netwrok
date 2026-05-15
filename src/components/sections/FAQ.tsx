"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreOutlinedIcon from "@mui/icons-material/ExpandMoreOutlined";
import { motion, useReducedMotion } from "framer-motion";
import { faqs, faqSection } from "@/lib/content";

const MotionBox = motion.create(Box);

export default function FAQ() {
  const reduced = useReducedMotion();
  const [expanded, setExpanded] = useState<string | false>(`faq-0`);

  return (
    <Box
      id="faq"
      component="section"
      sx={{
        position: "relative",
        py: { xs: 8, md: 12 },
        bgcolor: "#FBF8F1",
        borderTop: "1px solid",
        borderColor: "rgba(14,42,61,0.06)",
      }}
    >
      <Container maxWidth="md" sx={{ position: "relative" }}>
        <Stack spacing={2} sx={{ mb: { xs: 5, md: 7 }, textAlign: { xs: "left", md: "center" } }}>
          <Typography variant="overline" sx={{ color: "#A07823", letterSpacing: "0.16em" }}>
            {faqSection.eyebrow}
          </Typography>
          <Typography variant="h2" sx={{ color: "#0A1A2F", fontSize: { xs: "2rem", md: "2.85rem" }, lineHeight: 1.1 }}>
            {faqSection.title}
          </Typography>
          <Typography variant="subtitle1" sx={{ color: "#3B4A55", maxWidth: 580, mx: { md: "auto" } }}>
            {faqSection.subtitle}
          </Typography>
        </Stack>

        <Stack>
          {faqs.map((f, i) => {
            const id = `faq-${i}`;
            return (
              <MotionBox
                key={id}
                initial={reduced ? false : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: Math.min(i * 0.03, 0.3) }}
              >
                <Accordion
                  expanded={expanded === id}
                  onChange={(_, isExpanded) => setExpanded(isExpanded ? id : false)}
                  sx={{
                    "&.Mui-expanded": { my: 0 },
                    borderTop: i === 0 ? "1px solid" : "none",
                    borderColor: "rgba(14,42,61,0.1)",
                    "&:last-of-type": { borderBottom: "1px solid", borderBottomColor: "rgba(14,42,61,0.1)" },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreOutlinedIcon sx={{ color: "#A07823" }} />}
                    sx={{
                      px: 0,
                      py: 1.5,
                      "& .MuiAccordionSummary-content": { my: 1.5 },
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#0A1A2F",
                        fontWeight: 600,
                        fontSize: { xs: "1rem", md: "1.075rem" },
                      }}
                    >
                      {f.q}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ px: 0, pb: 3 }}>
                    <Typography sx={{ color: "#3B4A55", fontSize: "0.98rem", lineHeight: 1.7, maxWidth: 720 }}>
                      {f.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </MotionBox>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
}
