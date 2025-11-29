import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import NextLink from "next/link";

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Marshalls Dive station tracking site
        </Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          A simple site for keeping track of service that was done at the fill
          station
        </Typography>

        <Link href="/fills" color="secondary" component={NextLink}>
          Record a new tank fill
        </Link>

        <Link href="/visual" color="secondary" component={NextLink}>
          Record a new tank Visual
        </Link>

        <Link href="/about" color="secondary" component={NextLink}>
          Go to the about page
        </Link>
      </Box>
    </Container>
  );
}
