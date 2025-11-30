"use server";

import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

export default async function TankVisual({ params }) {
  const { slug: inspectionID } = await params;

  return (
    <Container maxWidth="lg">
      <Typography variant="h2" component="h2" sx={{ mb: 2 }}>
        Visual Inspection - {inspectionID}
      </Typography>
    </Container>
  );
}
