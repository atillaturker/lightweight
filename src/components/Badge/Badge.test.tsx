import { render, screen } from "@testing-library/react-native";
import React from "react";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders the label", async () => {
    await render(<Badge label="PR" />);

    expect(screen.getByText("PR")).toBeTruthy();
  });

  it("renders with the neutral variant by default", async () => {
    const { toJSON: defaultJSON } = await render(<Badge label="PR" />);
    const { toJSON: neutralJSON } = await render(
      <Badge label="PR" variant="neutral" />,
    );

    expect(defaultJSON()).toEqual(neutralJSON());
  });
});
