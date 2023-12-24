import { Accordion, AccordionSummary, AccordionDetails } from "@mui/joy";

export default function FAQQuestion({question, answer}) {
  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary sx={{fontWeight:"bold"}}>{question}</AccordionSummary>
        <AccordionDetails>{answer}</AccordionDetails>
      </Accordion>
    </>
  )
}