"use client";
import { Accordion, AccordionDetails, AccordionSummary, Box, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import Section from "@/components/Section";
import { faqs } from "@/lib/content";

export default function FAQ() {
  return (
    <Section
      id="faq"
      eyebrow="QUESTIONS"
      title="The honest answers."
      subtitle="The objections we get most, answered without sales gloss."
    >
      <Box sx={{ maxWidth: 820, mx: "auto" }}>
        <Stack>
          {faqs.map((f, i) => (
            <Accordion key={i}>
              <AccordionSummary
                expandIcon={<AddIcon sx={{ color: "primary.main" }} />}
                sx={{
                  px: 0,
                  py: 2,
                  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": { transform: "rotate(45deg)" },
                }}
              >
                <Typography variant="h5" sx={{ color: "text.primary" }}>
                  {f.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pb: 3, pt: 0 }}>
                <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 720 }}>
                  {f.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Stack>
      </Box>
    </Section>
  );
}
