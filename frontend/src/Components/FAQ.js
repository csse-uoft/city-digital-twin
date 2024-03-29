import { Typography, Stack, AccordionGroup } from "@mui/joy";
import { Container } from "@mui/material";
import FAQQuestion from "./FAQComponents/FAQQuestion";

/*
 * This function implements the FAQ page, a location for frequently asked questions.
 * Each FAQQuestion component is a standalone question and answer accordion section (dropdown). You can copy and paste them inside the AccordionGroup to add new questions.
 * Insert the question into the 'question' property and the answer into the 'answer' property, as the examples show.
 */
export default function FAQ() {
  return (
    <Container maxWidth="lg" sx={{ marginTop: { xs: "100px", md: "30px" }, paddingBottom: "100px" }}>
      <Stack spacing={5}>
        <Typography variant="h4" sx={{textAlign:"center", marginBottom:"10px", color:"black", fontWeight:"bold", fontFamily:"Trade Gothic Next LT Pro Cn, sans-serif", fontSize:40}}>
          Frequently Asked Questions
        </Typography>

        <AccordionGroup sx={{ maxWidth: "600px" }}>
          <FAQQuestion
            question={"Why?"}
            answer={"Why not?"}
          />

          <FAQQuestion
            question={"Why did the chicken cross the road?"}
            answer={"To get to the other side!"}
          /> 
        </AccordionGroup>
      </Stack>
    </Container>
  )
}