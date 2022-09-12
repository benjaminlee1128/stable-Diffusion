import React from "react";
import { db, useGongoUserId } from "gongo-client-react";
import { useRouter } from "next/router";
import { t, Trans } from "@lingui/macro";

import { Google, GitHub } from "@mui/icons-material";

import AppBar from "../src/MyAppBar";

import { Container, Box, Button } from "@mui/material";

export default function Login() {
  const router = useRouter();
  const userId = useGongoUserId();

  const services = [
    {
      id: "google",
      name: t`Google`,
      startIcon: <Google />,
      style: {
        background: "#57f",
      },
    },
    {
      id: "github",
      name: t`GitHub`,
      startIcon: <GitHub />,
      style: {
        background: "#555",
      },
    },
  ];

  if (userId) {
    const from = router.query.from;
    router.push(from ? (Array.isArray(from) ? from[0] : from) : "/");
    return null;
  }

  return (
    <Box>
      <AppBar title="Cart" />
      <Container maxWidth="sm" style={{ textAlign: "center" }}>
        <p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icon.png" alt="logo" width="192" height="192" />
        </p>
        <p>SD-MUI</p>

        {services.map((service) => (
          <Button
            sx={{ my: 0.5 }}
            key={service.id}
            variant="contained"
            startIcon={service.startIcon}
            style={{
              ...service.style,
              width: "90%",
            }}
            // @ts-expect-error: TODO
            onClick={() => db.auth.loginWithService(service.id)}
          >
            <Trans>Connect with {service.name}</Trans>
          </Button>
        ))}
      </Container>
    </Box>
  );
}
