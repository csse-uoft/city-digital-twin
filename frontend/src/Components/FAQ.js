import { useState, useEffect } from "react";
import { Typography, Stack, AccordionGroup } from "@mui/joy";
import { Container, Button, Box, Avatar } from "@mui/material";
import FAQQuestion from "./FAQComponents/FAQQuestion";
import { faqItems } from "./FAQComponents/FAQData";

import dashboard from "../assets/icons/dashboard.png";
import dataLogo from "../assets/icons/data.png";
import repositoryLogo from "../assets/icons/repository.png";
import jobLogo from "../assets/icons/job.png";
import applicationLogo from "../assets/icons/application.png";
import generalLogo from "../assets/icons/general.png";

export default function FAQ() {
  // State to hold the selected category
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categoryLogos = {
    "Canadian Urban Data Catalogue": dataLogo,
    "City Digital Twin Project": repositoryLogo,
    "Jobs": jobLogo,
    "Contact Us": applicationLogo,
    "How to use the dashboard": dashboard,
    "General Questions": generalLogo,
  };

  // Extract unique categories from faqItems
  const predefinedCategories = [
    "Canadian Urban Data Catalogue",
    "City Digital Twin Project",
    "How to use the dashboard",
    "Jobs",
    "Contact Us",
    "General Questions",
  ];

  // Group the faqItems by category

  // Group FAQ items into the predefined categories
  const categorizedFaqItems = predefinedCategories.reduce((acc, category) => {
    acc[category] = [];
    return acc;
  }, {});

  faqItems.forEach(item => {
    const category = predefinedCategories.includes(item.category)
      ? item.category
      : "General Questions";
    categorizedFaqItems[category].push(item);
  });

  useEffect(() => {
    if (selectedCategory) {
      console.log("Selected Category:", selectedCategory);
    }
  }, [selectedCategory]);

  return (
    <Container maxWidth="lg" sx={{ marginTop: { xs: "100px", md: "30px" }, paddingBottom: "100px" }}>
      <Stack spacing={5}>
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            marginBottom: "10px",
            color: "black",
            fontWeight: "bold",
            fontFamily: "Trade Gothic Next LT Pro Cn, sans-serif",
            fontSize: 40,
          }}
        >
          Frequently Asked Questions
        </Typography>

        {/* Display list of categories if no category is selected */}
        {!selectedCategory ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            {predefinedCategories.map((category, index) => (
              <Button
                key={index}
                variant="contained"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  margin: "10px",
                  paddingLeft: "15px",
                  fontSize: "16px",
                  backgroundColor: "#FBFCFE",
                  color: "#171a1c",
                  textTransform: "none", 
                  width: "40%",
                  border: "1px solid black",
                  '&:hover': {
                    backgroundColor: "#f5f5f5"
                  },
                }}
                onClick={() => setSelectedCategory(category)}
              >
                {/* Display the square logo on the leftmost side */}
                <Box
                  component="img"
                  src={categoryLogos[category] || generalLogo}
                  alt={category}
                  sx={{
                    width: 30,
                    height: 30,
                    marginRight: "15px",
                    borderRadius: "4px"
                  }} 
                />
                {category}
              </Button>
            ))}
          </Box>
        ) : (
          // Display FAQs for the selected category
          <AccordionGroup sx={{ 
            // maxWidth: "80%", // Adjust as needed
            margin: "0 auto", // Centers the element horizontally
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            }}>
            <Button
              variant="contained"
              onClick={() => setSelectedCategory(null)}
              sx={{
                marginBottom: "20px",
                color: "black",
                backgroundColor: "white",
                border: "1px solid black",
                fontSize: "18px",
                fontWeight: "bold",
                padding: "10px 20px",
                '&:hover': {
                  backgroundColor: "#f5f5f5" // Light gray on hover
                },
              }}
            >
              Back to Categories
            </Button>
            {categorizedFaqItems[selectedCategory].map((item, index) => (
              <FAQQuestion key={index} question={item.question} answer={item.answer} />
            ))}
          </AccordionGroup>
        )}
      </Stack>
    </Container>
  );
}
